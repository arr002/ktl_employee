import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

const SESSION_KEYS = ['id', 'username', 'empid', 'otp', 'mobile'] as const;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(public platform: Platform, private androidPermissions: AndroidPermissions, private splashScreen: SplashScreen,
    private statusBar: StatusBar, private router: Router, public str: Storage) {
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
      });
    });
  }

  ngOnInit() {
    this.initializeApp();
  }

  async initializeApp() {
      await this.str.create();
      this.str.set('version', 5);

      // Camera / draft OOM can leave Ionic Storage unreadable briefly or corrupted.
      // localStorage backup is the reliable fallback for session restore.
      let value = await this.str.get('id');
      if (!value) {
        value = localStorage.getItem('ktl_id');
        if (value) {
          await this.restoreSessionFromLocal();
        }
      } else {
        this.mirrorSessionToLocal();
      }

      const currentPath = window.location.pathname;
      if (value) {
        if (currentPath === '/' || currentPath === '/login') {
          const returnRoute = localStorage.getItem('ktl_return_route');
          if (returnRoute && returnRoute !== '/' && returnRoute !== '/login') {
            localStorage.removeItem('ktl_return_route');
            this.router.navigateByUrl(returnRoute);
          } else {
            this.router.navigate(['/home']);
          }
        }
      } else {
        localStorage.removeItem('ktl_return_route');
        this.router.navigate(['/login']);
      }
  }

  private async mirrorSessionToLocal() {
    for (const key of SESSION_KEYS) {
      const v = await this.str.get(key);
      if (v != null && v !== '') {
        localStorage.setItem('ktl_' + key, String(v));
      }
    }
  }

  private async restoreSessionFromLocal() {
    for (const key of SESSION_KEYS) {
      const v = localStorage.getItem('ktl_' + key);
      if (v != null && v !== '') {
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
            this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
          ]);
        }
      },
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
    );    
  }

}
