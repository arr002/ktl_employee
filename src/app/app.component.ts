import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { LocationTrackerService } from './location-tracker.service';

const SESSION_KEYS = ['id', 'username', 'empid', 'otp', 'mobile'] as const;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(public platform: Platform, private androidPermissions: AndroidPermissions, private splashScreen: SplashScreen,
    private statusBar: StatusBar, private router: Router, public str: Storage,
    private locationTracker: LocationTrackerService) {
    this.platform.ready().then((readySource) => {
      console.log("readySource="+readySource);
      if(readySource=='dom') {
      } else {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.androidPermission();
      }

      // Camera opens an external activity; Android often kills the WebView while paused.
      this.platform.pause.subscribe(() => {
        const url = this.router.url;
        if (url && url !== '/' && url !== '/login') {
          localStorage.setItem('ktl_return_route', url);
        }
        // Flush session to localStorage before the process may be killed.
        this.mirrorSessionToLocal();
      });

      // After camera/gallery returns (or process restart), re-apply session + return route.
      this.platform.resume.subscribe(() => {
        this.recoverSessionAfterResume();
      });

      // Cordova delivers camera/gallery results via resume.pendingResult when the
      // WebView was destroyed while the camera activity was open (common on low-RAM phones).
      document.addEventListener('resume', (event: any) => {
        this.capturePendingCameraResult(event);
      }, false);
    });
  }

  /** Stash Camera plugin result so Mark Attendance can upload after a process kill. */
  private capturePendingCameraResult(event: any) {
    try {
      const pending = event && event.pendingResult;
      if (!pending || pending.pluginServiceName !== 'Camera') {
        return;
      }
      const purpose = localStorage.getItem('ktl_camera_pending');
      if (purpose !== 'attendance') {
        return;
      }
      if (pending.pluginStatus === 'OK' && pending.result != null && pending.result !== '') {
        localStorage.setItem('ktl_pending_image', String(pending.result));
        localStorage.setItem('ktl_return_route', '/attandence');
        // Ensure we land on attendance so it can consume + upload the recovered photo.
        const url = this.router.url || '';
        if (url !== '/attandence' && url.indexOf('attandence') === -1) {
          this.router.navigateByUrl('/attandence');
        }
      } else {
        localStorage.removeItem('ktl_camera_pending');
        localStorage.removeItem('ktl_pending_image');
      }
    } catch (e) {
      console.log('capturePendingCameraResult error', e);
    }
  }

  ngOnInit() {
    this.initializeApp();
  }

  async initializeApp() {
      await this.str.create();
      this.str.set('version', 5);

      // Camera / draft OOM can leave Ionic Storage unreadable briefly.
      // Retry storage, then fall back to localStorage before treating as logged out.
      const value = await this.resolveSessionId();

      if (value) {
        await this.navigateAfterSessionRestore();
        this.locationTracker.start(value);
      } else {
        // Only clear return route when session is truly missing after retries.
        localStorage.removeItem('ktl_return_route');
        this.locationTracker.stop();
        this.router.navigate(['/login']);
      }
  }

  private async recoverSessionAfterResume() {
    const value = await this.resolveSessionId();
    if (!value) {
      return;
    }
    const url = this.router.url || '';
    if (url === '/login' || url === '/' || url === '') {
      await this.navigateAfterSessionRestore();
    }
  }

  /** Resolve staff id from Ionic Storage (with retry) or localStorage backup. */
  private async resolveSessionId(): Promise<string | null> {
      let value = await this.str.get('id');
      if (value != null && value !== '' && value !== 'null') {
        await this.mirrorSessionToLocal();
        return String(value);
      }

      // IndexedDB can be briefly empty right after a WebView OOM kill.
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        value = await this.str.get('id');
        if (value != null && value !== '' && value !== 'null') {
          await this.mirrorSessionToLocal();
          return String(value);
        }
      }

      const localId = localStorage.getItem('ktl_id');
      if (localId && localId !== 'null' && localId !== '') {
        await this.restoreSessionFromLocal();
        return localId;
      }
      return null;
  }

  private isAtAuthEntryRoute(): boolean {
      const path = window.location.pathname || '';
      const hash = (window.location.hash || '').replace(/^#/, '');
      const url = this.router.url || '';
      const entryHints = [path, hash, url];
      return entryHints.some((c) =>
        !c ||
        c === '/' ||
        c === '/login' ||
        c === 'login' ||
        c.endsWith('index.html') ||
        c.indexOf('/login') !== -1
      );
  }

  private async navigateAfterSessionRestore() {
      const returnRoute = localStorage.getItem('ktl_return_route');
      if (returnRoute && returnRoute !== '/' && returnRoute !== '/login') {
        localStorage.removeItem('ktl_return_route');
        this.router.navigateByUrl(returnRoute);
        return;
      }

      if (this.isAtAuthEntryRoute()) {
        this.router.navigate(['/home']);
      }
  }

  private async mirrorSessionToLocal() {
    for (const key of SESSION_KEYS) {
      const v = await this.str.get(key);
      if (v != null && v !== '' && v !== 'null') {
        localStorage.setItem('ktl_' + key, String(v));
      }
    }
  }

  private async restoreSessionFromLocal() {
    for (const key of SESSION_KEYS) {
      const v = localStorage.getItem('ktl_' + key);
      if (v != null && v !== '' && v !== 'null') {
        await this.str.set(key, v);
      }
    }
  }

  androidPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
      result => {
        if (!result.hasPermission) {
          this.androidPermissions.requestPermissions([
            this.androidPermissions.PERMISSION.CAMERA,
            this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
            this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
          ]);
        }
      },
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
    );
  }

}
