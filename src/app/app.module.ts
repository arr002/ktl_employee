import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { Storage } from '@ionic/storage';

import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
//import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
//import { Market } from '@awesome-cordova-plugins/market/ngx';
//import { LightboxModule } from 'ngx-lightbox';
import { ClientsPageModule } from './clients/clients.module';
import { TownPageModule } from './town/town.module';
import { CustomerPageModule } from './customer/customer.module';
import { DsrpopupPageModule } from './dsrpopup/dsrpopup.module';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    ClientsPageModule,
    TownPageModule,
    CustomerPageModule,
    DsrpopupPageModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, Camera, AndroidPermissions, BarcodeScanner, InAppBrowser, SplashScreen, StatusBar, Storage, File, FileTransfer, Geolocation ],
  bootstrap: [AppComponent],
})
export class AppModule {}
