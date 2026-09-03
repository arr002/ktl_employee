import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, Platform } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { environment } from '../environments/environment';

/**
 * Location sync:
 * - While app is OPEN ("While using the app" is enough): upload every 5 min via JS + GPS
 * - When app is CLOSED: needs "Allow all the time" + native background service
 */
@Injectable({ providedIn: 'root' })
export class LocationTrackerService {
  private readonly INTERVAL_MS = 5 * 60 * 1000;
  private readonly ENDPOINT = 'update-staff-location';

  private running = false;
  private uploading = false;
  private userid: string | null = null;
  private url = environment.SERVER_URL;
  private configured = false;
  private backgroundPromptShown = false;
  private foregroundTimer: any = null;
  private hasBackgroundPermission = false;

  constructor(
    private http: HttpClient,
    private geolocation: Geolocation,
    private androidPermissions: AndroidPermissions,
    private platform: Platform,
    private str: Storage,
    private alertCtrl: AlertController,
  ) {
    // When app returns to foreground, sync once (works with "While using")
    this.platform.resume.subscribe(() => {
      if (this.running) {
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

    this.userid = id;
    this.running = true;

    const perms = await this.requestAllLocationPermissions();
    this.hasBackgroundPermission = !!perms.background;

    // 1) Always start foreground sync — works with "While using the app"
    this.startForegroundLoop();
    this.uploadForegroundOnce('start');

    // 2) Also start native background service when possible (closed-app sync)
    if (this.isNativeCordova()) {
      const bg = this.bgPlugin();
      if (bg) {
        try {
          await this.configureAndStartBackground(bg, id);
          console.log('[LocationTracker] native background service started');
        } catch (e) {
          console.warn('[LocationTracker] native background start failed (foreground sync still runs)', e);
        }
      }
    }

    if (perms.fine && !perms.background) {
      await this.promptAllowAllTheTime();
    }

    console.log('[LocationTracker] started user=', id, 'fine=', perms.fine, 'background=', perms.background);
  }

  stop() {
    this.running = false;
    this.userid = null;
    clearInterval(this.foregroundTimer);
    this.foregroundTimer = null;

    const bg = this.bgPlugin();
    if (bg) {
      try {
        bg.stop();
        bg.configure({ stopOnTerminate: true, startOnBoot: false });
      } catch {
        // ignore
      }
    }
    console.log('[LocationTracker] stopped');
  }

  /** Foreground 5-min loop — works with "While using the app". */
  private startForegroundLoop() {
    clearInterval(this.foregroundTimer);
    this.foregroundTimer = setInterval(() => {
      this.uploadForegroundOnce('interval');
    }, this.INTERVAL_MS);
  }

  private async uploadForegroundOnce(reason: string) {
    if (!this.running || this.uploading) {
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
      // Ensure while-using permission
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

  private bgPlugin(): any {
    return (window as any).BackgroundGeolocation
      || (window as any).backgroundGeolocation
      || null;
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

  private async requestAllLocationPermissions(): Promise<{ fine: boolean; background: boolean }> {
    if (!this.platform.is('android') || !this.isNativeCordova()) {
      return { fine: true, background: false };
    }

    const P = this.androidPermissions.PERMISSION;
    const fine = await this.askPermission(P.ACCESS_FINE_LOCATION);
    await this.askPermission(P.ACCESS_COARSE_LOCATION);

    try {
      await this.askPermission('android.permission.POST_NOTIFICATIONS');
    } catch {
      // older
    }

    const bg = this.bgPlugin();
    try {
      if (bg?.requestNotificationPermission) {
        await new Promise<void>((resolve) => {
          bg.requestNotificationPermission(() => resolve(), () => resolve());
        });
      }
    } catch {
      // optional
    }

    let background = false;
    if (fine) {
      background = await this.askPermission(P.ACCESS_BACKGROUND_LOCATION);
      try {
        if (bg?.requestBackgroundLocationPermission) {
          await new Promise<void>((resolve) => {
            bg.requestBackgroundLocationPermission(() => resolve(), () => resolve());
          });
          background = await this.hasPermission(P.ACCESS_BACKGROUND_LOCATION);
        }
      } catch {
        // optional
      }
    }

    return { fine, background: !!background };
  }

  private async promptAllowAllTheTime() {
    if (this.backgroundPromptShown) {
      return;
    }
    this.backgroundPromptShown = true;

    const alert = await this.alertCtrl.create({
      header: 'Location permission',
      message:
        'You selected “While using the app”.\n\n' +
        '• App open → location syncs every 5 minutes\n' +
        '• App closed → sync stops\n\n' +
        'For sync when the app is closed, set Location to “Allow all the time”.',
      buttons: [
        { text: 'OK', role: 'cancel' },
        {
          text: 'Open Settings',
          handler: () => this.openAppLocationSettings()
        }
      ]
    });
    await alert.present();
  }

  private openAppLocationSettings() {
    const bg = this.bgPlugin();
    try {
      if (bg?.showAppSettings) {
        bg.showAppSettings();
        return;
      }
    } catch {
      // fall through
    }
    console.warn('[LocationTracker] Settings → App info → Permissions → Location → Allow all the time');
  }

  private configureAndStartBackground(bg: any, userId: string): Promise<void> {
    const apiUrl = this.url + this.ENDPOINT;

    const config: any = {
      locationProvider: bg.DISTANCE_FILTER_PROVIDER ?? 0,
      desiredAccuracy: bg.HIGH_ACCURACY ?? 0,
      stationaryRadius: 25,
      distanceFilter: 30,
      debug: false,
      interval: this.INTERVAL_MS,
      fastestInterval: Math.floor(this.INTERVAL_MS / 2),
      activitiesInterval: this.INTERVAL_MS,
      stopOnTerminate: false,
      startOnBoot: true,
      startForeground: true,
      notificationsEnabled: true,
      notificationTitle: 'KTL Plus',
      notificationText: 'Location syncing for field tracking',
      notificationIconColor: '#0f4c5c',
      url: apiUrl,
      syncUrl: apiUrl,
      syncThreshold: 1,
      sync: true,
      httpMode: 'single',
      httpMethod: 'POST',
      httpHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      postTemplate: {
        appuser_id: String(userId),
        staffid: String(userId),
        user_id: String(userId),
        lat: '@latitude',
        long: '@longitude',
        lang: '@longitude'
      },
      maxLocations: 1000
    };

    return new Promise((resolve, reject) => {
      try {
        if (!this.configured) {
          bg.on('location', (loc: any) => {
            console.log('[LocationTracker] bg location', loc?.latitude, loc?.longitude);
          });
          bg.on('error', (err: any) => {
            console.warn('[LocationTracker] bg plugin error', err);
          });
          this.configured = true;
        }

        bg.configure(config, () => {
          bg.start();
          resolve();
        }, (err: any) => {
          try {
            const maybe = bg.configure(config);
            if (maybe && typeof maybe.then === 'function') {
              maybe.then(() => {
                bg.start();
                resolve();
              }).catch(reject);
              return;
            }
          } catch {
            // fall through
          }
          try {
            bg.start();
            resolve();
          } catch (e2) {
            reject(err || e2);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}
