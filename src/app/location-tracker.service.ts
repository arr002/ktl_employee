import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { environment } from '../environments/environment';

/**
 * Location sync while the app is OPEN (foreground only).
 * Interval and daily window come from environment
 * (locationSyncIntervalMinutes, locationSyncStartTime, locationSyncEndTime).
 */
@Injectable({ providedIn: 'root' })
export class LocationTrackerService {
  private readonly INTERVAL_MS =
    Math.max(1, Number(environment.locationSyncIntervalMinutes) || 5) * 60 * 1000;
  private readonly ENDPOINT = 'update-staff-location';

  private running = false;
  private uploading = false;
  private userid: string | null = null;
  private url = environment.SERVER_URL;
  private foregroundTimer: any = null;
  private lastUploadAt = 0;

  constructor(
    private http: HttpClient,
    private geolocation: Geolocation,
    private androidPermissions: AndroidPermissions,
    private platform: Platform,
    private str: Storage,
  ) {
    this.platform.pause.subscribe(() => {
      if (this.running) {
        this.clearForegroundLoop();
        console.log('[LocationTracker] paused — timer cleared');
      }
    });

    this.platform.resume.subscribe(() => {
      if (this.running) {
        this.startForegroundLoop();
        // Only upload if interval has elapsed (avoid burst when reopening app)
        this.uploadForegroundOnce('resume');
      }
    });
  }

  /** Call after login / session restore. */
  async start(userId?: string | number | null) {
    await this.platform.ready();

    const id = userId != null && String(userId) !== 'null' && String(userId) !== ''
      ? String(userId)
      : await this.resolveUserId();

    if (!id) {
      console.warn('[LocationTracker] start skipped — no user id');
      return;
    }

    const alreadyRunningSameUser = this.running && this.userid === id;
    this.userid = id;
    this.running = true;

    await this.requestForegroundLocationPermissions();
    this.startForegroundLoop();

    // login + home + app.component all call start() — only upload once per interval
    if (!alreadyRunningSameUser) {
      this.uploadForegroundOnce('start');
    } else {
      console.log('[LocationTracker] start ignored (already running)', id);
    }

    console.log(
      '[LocationTracker] started user=',
      id,
      'intervalMin=',
      environment.locationSyncIntervalMinutes,
      'window=',
      environment.locationSyncStartTime,
      '-',
      environment.locationSyncEndTime
    );
  }

  stop() {
    this.running = false;
    this.userid = null;
    this.lastUploadAt = 0;
    this.clearForegroundLoop();
    console.log('[LocationTracker] stopped');
  }

  private startForegroundLoop() {
    this.clearForegroundLoop();
    this.foregroundTimer = setInterval(() => {
      this.uploadForegroundOnce('interval');
    }, this.INTERVAL_MS);
  }

  private clearForegroundLoop() {
    clearInterval(this.foregroundTimer);
    this.foregroundTimer = null;
  }

  private async uploadForegroundOnce(reason: string) {
    if (!this.running || this.uploading) {
      return;
    }
    if (!this.isWithinSyncWindow()) {
      console.log(
        '[LocationTracker] skip',
        reason,
        '— outside sync window',
        environment.locationSyncStartTime,
        '-',
        environment.locationSyncEndTime
      );
      return;
    }
    const elapsed = Date.now() - this.lastUploadAt;
    if (this.lastUploadAt > 0 && elapsed < this.INTERVAL_MS) {
      console.log(
        '[LocationTracker] skip',
        reason,
        '— next sync in',
        Math.ceil((this.INTERVAL_MS - elapsed) / 1000),
        's'
      );
      return;
    }
    if (!this.userid) {
      this.userid = await this.resolveUserId();
    }
    if (!this.userid) {
      return;
    }

    this.uploading = true;
    try {
      if (this.platform.is('android') && this.isNativeCordova()) {
        const fine = this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION;
        const st = await this.androidPermissions.checkPermission(fine);
        if (!st?.hasPermission) {
          await this.androidPermissions.requestPermission(fine);
        }
      }

      const coords = await this.getForegroundPosition();
      const lat = coords.latitude;
      const lng = coords.longitude;
      if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) {
        console.warn('[LocationTracker] invalid coords', coords);
        return;
      }

      const datap = {
        appuser_id: this.userid,
        staffid: this.userid,
        user_id: this.userid,
        lat: String(lat),
        long: String(lng),
        lang: String(lng)
      };

      console.log('[LocationTracker] foreground post', reason, datap);

      await new Promise<void>((resolve) => {
        this.http.post(this.url + this.ENDPOINT, datap, {
          headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json'
          })
        }).subscribe({
          next: (res) => {
            this.lastUploadAt = Date.now();
            console.log('[LocationTracker] foreground saved', res);
            resolve();
          },
          error: (err) => {
            console.warn('[LocationTracker] foreground API error', err);
            resolve();
          }
        });
      });
    } catch (e) {
      console.warn('[LocationTracker] foreground geo/upload failed', reason, e);
    } finally {
      this.uploading = false;
    }
  }

  private getForegroundPosition(): Promise<{ latitude: number; longitude: number }> {
    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 30000
    };

    if (this.isNativeCordova()) {
      return this.geolocation.getCurrentPosition(options).then((resp) => ({
        latitude: resp.coords.latitude,
        longitude: resp.coords.longitude
      })).catch(() => this.getBrowserPosition(options));
    }
    return this.getBrowserPosition(options);
  }

  private getBrowserPosition(options: PositionOptions): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator?.geolocation) {
        reject(new Error('Geolocation unavailable'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }),
        (err) => reject(err),
        options
      );
    });
  }

  private isNativeCordova(): boolean {
    return !!(this.platform.is('cordova') || (window as any).cordova);
  }

  /** True when device local time is inside environment start–end window. */
  private isWithinSyncWindow(): boolean {
    const startMin = this.parseHhMmToMinutes(environment.locationSyncStartTime, 8 * 60);
    const endMin = this.parseHhMmToMinutes(environment.locationSyncEndTime, 18 * 60);
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    if (startMin === endMin) {
      return true; // same start/end = all day
    }
    if (startMin < endMin) {
      return nowMin >= startMin && nowMin < endMin;
    }
    // Overnight window (e.g. 22:00–06:00)
    return nowMin >= startMin || nowMin < endMin;
  }

  private parseHhMmToMinutes(value: string | undefined, fallback: number): number {
    if (!value || typeof value !== 'string') {
      return fallback;
    }
    const m = value.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) {
      return fallback;
    }
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (isNaN(h) || isNaN(min) || h < 0 || h > 23 || min < 0 || min > 59) {
      return fallback;
    }
    return h * 60 + min;
  }

  private async resolveUserId(): Promise<string | null> {
    try {
      const fromStorage = await this.str.get('id');
      if (fromStorage != null && String(fromStorage) !== '' && String(fromStorage) !== 'null') {
        return String(fromStorage);
      }
    } catch {
      // ignore
    }
    const localId = localStorage.getItem('ktl_id');
    if (localId && localId !== 'null' && localId !== '') {
      return localId;
    }
    return null;
  }

  private async hasPermission(perm: string): Promise<boolean> {
    try {
      const st = await this.androidPermissions.checkPermission(perm);
      return !!st?.hasPermission;
    } catch {
      return false;
    }
  }

  private async askPermission(perm: string): Promise<boolean> {
    try {
      if (await this.hasPermission(perm)) {
        return true;
      }
      const req = await this.androidPermissions.requestPermission(perm);
      return !!req?.hasPermission;
    } catch {
      return false;
    }
  }

  private async requestForegroundLocationPermissions(): Promise<void> {
    if (!this.platform.is('android') || !this.isNativeCordova()) {
      return;
    }

    const P = this.androidPermissions.PERMISSION;
    await this.askPermission(P.ACCESS_FINE_LOCATION);
    await this.askPermission(P.ACCESS_COARSE_LOCATION);
  }
}
