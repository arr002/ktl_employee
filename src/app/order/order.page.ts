import { Component, OnInit} from '@angular/core';
import { MenuController, ToastController, Platform, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { environment } from '../../environments/environment';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
  standalone: false,
})
export class OrderPage implements OnInit {
 url = environment.SERVER_URL;
 client_id: any;
 options: CameraOptions = {
    quality: 70,
    targetWidth: 800,
    saveToPhotoAlbum: true,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  };
  
  constructor(public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private http: HttpClient, public toastCtrl: ToastController, private platform: Platform,
    private router: Router, private file: File, private camera: Camera, private androidPermissions: AndroidPermissions, public str: Storage) { 
        
      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, 
          this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
          
      // Use client_id from storage since we are navigating from clientdashboard
      this.str.get('client_id').then((value) => { 
         this.client_id = value;
      });
  }

  readFile(file: any) {
    this.presentLoading();
    const reader = new FileReader();
    reader.onloadend = () => {
      const imgBlob = new Blob([reader.result as ArrayBuffer], {
        type: file.type
      });
      let headers = new HttpHeaders(); 
      headers.append("Accept", 'application/json');
      const formData = new FormData();
      formData.append('client_id', this.client_id);
      formData.append('file', imgBlob, file.name);
      
      this.http.post(this.url + 'upload-order', formData, {headers: headers}).subscribe((data: any) => {
        this.loadingCtrl.dismiss().catch(() => {});
        if(data.status) {
          console.log(data);
          this.presentToast(data.message, 4000, "bottom");
        } else {
          this.presentToast(data.message || "Error uploading order", 4000, "bottom");
        }
      }, err => {
          this.loadingCtrl.dismiss().catch(() => {});
          this.presentToast("Failed to upload order", 4000, "bottom");
      });
    };
    reader.readAsArrayBuffer(file);
  }

  takePicture() {
    this.camera.getPicture(this.options).then((imageData) => {
      this.file.resolveLocalFilesystemUrl(imageData).then((entry: any) => {
        if (entry.isFile) {
          const fileEntry = entry as FileEntry;
          fileEntry.file(file => {
            console.log(file);
            this.readFile(file);
          });
        }
      });
    }, (err) => {
      // Handle error
    });
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
        message: 'Please wait...',
        duration: 5000
    });
    await loading.present();
  }

  presentToast(msg: any, durat: any, pos: any) {
    this.toastCtrl.create({
      message: msg,
      duration: durat,
      position: pos
    }).then((toastData) => {
      console.log(toastData);
      toastData.present();
    });
  }	

  ngOnInit() {
    this.androidPermissions.hasPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
      .then(status => {
        if (!status.hasPermission) {
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
            .then(status => {});
        }
      });
  }
}
