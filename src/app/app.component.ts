import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
//import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
//import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

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
    });
  }

  ngOnInit() {
    this.initializeApp();
  }

  async initializeApp() {
      await this.str.create();
      this.str.set('version', 5);
      this.str.get('id').then((value) => {
        console.log("==value==",value);
        const currentPath = window.location.pathname;
        if (value) {
          if (currentPath === '/' || currentPath === '/login') {
            this.router.navigate(['/home']);
          }
        } else {
          this.router.navigate(['/login']);
        }
      });
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
