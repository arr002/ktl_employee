import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { environment } from '../environments/environment';

/** Uploads employee lat/long every 20 minutes, only between 8:00 AM and 6:00 PM local time. */
@Injectable({ providedIn: 'root' })
export class LocationTrackerService {
  private readonly INTERVAL_MS = 20 * 60 * 1000;
  private readonly WINDOW_START_HOUR = 8;  // 8:00 AM
  private readonly WINDOW_END_HOUR = 18;   // 6:00 PM (exclusive of hour 18+)
  private readonly ENDPOINT = 'update-staff-location';

  private timer: any = null;
  private running = false;
  private uploading = false;
  private userid: string | null = null;
  private url = environment.SERVER_URL;

  constructor(
    private http: HttpClient,
    private geolocation: Geolocation,
    private androidPermissions: AndroidPermissions,
    private platform: Platform,
    private str: Storage,
  ) {
    this.platform.resume.subscribe(() => {
      if (this.running) {
        this.uploadOnce('resume');
      }
    });
  }

  /** True only during 08:00–18:00 local device time. */
  private isWithinSyncWindow(now: Date = new Date()): boolean {
    const hour = now.getHours();
    // 8:00 inclusive → 18:00 exclusive (last sync window ends at 6:00 PM)
    return hour >= this.WINDOW_START_HOUR && hour < this.WINDOW_END_HOUR;
  }

  /** Call after login / session restore. */
  async start(userId?: string | number | null) {
    const id = userId != null && String(userId) !== 'null' && String(userId) !== ''
      ? String(userId)
      : await this.resolveUserId();

    if (!id) {
      console.warn('[LocationTracker] start skipped — no user id');
      return;
    }

    this.userid = id;

    // Already running with a live timer — keep it
    if (this.running && this.timer) {
      console.log('[LocationTracker] already running for user', id);
      return;
    }

    this.running = true;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.uploadOnce('interval'), this.INTERVAL_MS);
    console.log(
      '[LocationTracker] started — every',
      this.INTERVAL_MS / 60000,
      'min, window',
      this.WINDOW_START_HOUR + ':00–' + this.WINDOW_END_HOUR + ':00, user',
      id
    );

    // Don't await permission/geo before scheduling the timer (was hanging in Chrome)
    this.uploadOnce('start');
  }

  stop() {
    this.running = false;
    this.userid = null;
    clearInterval(this.timer);
    this.timer = null;
    console.log('[LocationTracker] stopped');
  }

  private isNativeCordova(): boolean {
    return !!(this.platform.is('cordova') || (window as any).cordova);
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

  private async ensureLocationPermission(): Promise<void> {
    // Only on real Cordova Android — Chrome device mode also reports is('android')
    if (!this.isNativeCordova() || !this.platform.is('android')) {
      return;
    }
    try {
      const fine = this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION;
      const coarse = this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION;
      const status = await Promise.race([
        this.androidPermissions.checkPermission(fine),
        new Promise<any>((resolve) => setTimeout(() => resolve({ hasPermission: false }), 3000))
      ]);
      if (status && status.hasPermission) {
        return;
      }
      await Promise.race([
        this.androidPermissions.requestPermissions([fine, coarse]),
        new Promise((resolve) => setTimeout(resolve, 5000))
      ]);
    } catch (e) {
      console.warn('[LocationTracker] permission check failed', e);
    }
  }

  private getPosition(): Promise<{ latitude: number; longitude: number }> {
    const options: PositionOptions = {
      enableHighAccuracy: this.isNativeCordova(),
      timeout: this.isNativeCordova() ? 20000 : 10000,
      maximumAge: 60000
    };

    // Prefer browser geolocation on ionic serve / desktop
    if (!this.isNativeCordova() && typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve, reject) => {
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

    return this.geolocation.getCurrentPosition(options).then((resp) => ({
      latitude: resp.coords.latitude,
      longitude: resp.coords.longitude
    }));
  }

  private async uploadOnce(reason: string = 'manual') {
    if (!this.running || this.uploading) {
      return;
    }
    if (!this.isWithinSyncWindow()) {
      console.log('[LocationTracker] skipped — outside 8AM–6PM window', reason);
      return;
    }
    if (!this.userid) {
      this.userid = await this.resolveUserId();
    }
    if (!this.userid) {
      console.warn('[LocationTracker] upload skipped — no user id');
      return;
    }

    this.uploading = true;
    try {
      await this.ensureLocationPermission();
      const coords = await this.getPosition();
      const lat = coords.latitude;
      const lng = coords.longitude;

      if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) {
        console.warn('[LocationTracker] invalid coords', coords);
        return;
      }

      const headers = new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      });

      const datap = {
        appuser_id: this.userid,
        staffid: this.userid,
        user_id: this.userid,
        lat: String(lat),
        long: String(lng),
        lang: String(lng)
      };

      console.log('[LocationTracker] posting', reason, datap);

      await new Promise<void>((resolve) => {
        this.http.post(this.url + this.ENDPOINT, datap, { headers }).subscribe({
          next: (res) => {
            console.log('[LocationTracker] saved', res);
            resolve();
          },
          error: (err) => {
            console.warn('[LocationTracker] API error', err);
            resolve();
          }
        });
      });
    } catch (e) {
      console.warn('[LocationTracker] geo/upload failed', reason, e);
    } finally {
      this.uploading = false;
    }
  }
}
