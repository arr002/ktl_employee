import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';

@Component({
  selector: 'app-tada',
  templateUrl: './tada.page.html',
  styleUrls: ['./tada.page.scss'],
  standalone: false,
})
export class TadaPage implements OnInit {
  isLoading = false;
  url = environment.SERVER_URL;
  optionsCamera: CameraOptions = {
    quality: 100,
    allowEdit: true,
    targetWidth: 800,
    cameraDirection: 0,
    saveToPhotoAlbum: false,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.CAMERA
  };

  options: CameraOptions = {
    quality: 100,
    targetWidth: 800,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  };
  userid: any;

  constructor(public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    private platform: Platform,
    private router: Router,
    public str: Storage,
    private file: File,
    private camera: Camera,
    private androidPermissions: AndroidPermissions) {


    this.str.get('id').then((value) => {
      this.userid = value;

    });
  }

  ngOnInit() {
  }


  takePictureCamera() {

    this.camera.getPicture(this.optionsCamera).then((imageData) => {
      console.log(imageData)
      // this.file.resolveLocalFilesystemUrl(imageData).then((entry: FileEntry) => {
      //   entry.file(file => {
      //     console.log(file);
      //     this.readFileCamera(file);
      //   });
      // });
      this.file.resolveLocalFilesystemUrl(imageData).then((entry: any) => {
        if (entry.isFile) {
          const fileEntry = entry as FileEntry;
          fileEntry.file(file => {
            console.log('File object:', file);
            this.readFileCamera(file);
          }, error => {
            console.error('Error getting file:', error);
          });
        } else {
          console.error('Entry is not a file.');
        }
      }, error => {
        console.error('Error resolving file system URL', error);
      });
    }, (err) => {
      // Handle error
    });
  }


  async presentLoading() {

    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 1000
    });

    await loading.present();

  }


  readFileCamera(file: any) {
    
    this.presentLoading();
    const reader = new FileReader();

    reader.onloadend = () => {
      const imgBlob = new Blob([reader.result as ArrayBuffer], {
        type: file.type
      });

      let headers = new HttpHeaders();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');

      const formData = new FormData();

      formData.append('file', imgBlob, file.name);
      formData.append('staff_id', this.userid);

      this.http.post(this.url + 'uploads-dsr', formData, { headers: headers }).subscribe((data: any) => {
        
        console.log(data);

        this.dismiss();
        //this.image=data.image;
        this.presentToast(data.message, 4000, "bottom");
      }, error => {
        console.log(error)
        alert(JSON.stringify(error));
        this.presentToast('Please check your internet Connection.', 3000, 'middle')
        this.presentToast("Error uploading. Please try again.", 4000, "bottom");
        //this.loader.dismiss();
        //this.toast.presentToast("Check internet connection");
      });
    };
    reader.readAsArrayBuffer(file);
  }


  takePictureFile() {

    this.camera.getPicture(this.options).then((imageData) => {
      console.log(imageData)
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.readFile(base64Image);

    }, (err) => {
      console.log(err)
      // Handle error
    });
  }



  readFile(file: any) {

    this.presentLoading();
    const reader = new FileReader();

    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    const formData = new FormData();

    var fname = Math.floor(Math.random() * 100000);
    formData.append('file', file);
    console.log(this.userid)
    formData.append('staff_id', this.userid);

    this.http.post(this.url + 'uploads-dsr-base', formData, { headers: headers }).subscribe((data: any) => {

      if (data.status)
        console.log(data);

      this.dismiss();
      //this.image=data.image;
      this.presentToast(data.message, 4000, "bottom");
    }, error => {

      this.presentToast('Please check your internet Connection.', 3000, 'middle')
      this.presentToast("Error uploading. Please try again.", 4000, "bottom");
      //this.loader.dismiss();
      //this.toast.presentToast("Check internet connection");
    });
    //};
    //  reader.readAsArrayBuffer(file);
  }




  presentToast(msg: any, durat: any, pos: any) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: durat,
      position: pos
    }).then((toastData) => {
      console.log(toastData);
      toastData.present();
    });
    //await this.toastCtrl.create({ message:msg, duration:durat, position:pos }).present();
  }
  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }

}
