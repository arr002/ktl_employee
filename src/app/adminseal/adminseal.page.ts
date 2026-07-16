
import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, Platform, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Storage } from '@ionic/storage';
import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-adminseal',
  templateUrl: './adminseal.page.html',
  styleUrls: ['./adminseal.page.scss'],
  standalone: false,
})
export class AdminsealPage implements OnInit {


  branches: any = [];
  userid: any;
  name: any;
  branch: any;
  date: any;
  time: any;
  seal: any;
  sealno: any;
  sealuser:any;
  isLoading = false;
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
  url = environment.SERVER_URL;
  sealuserlist: any;
  constructor(public menuCtrl: MenuController, public loadingCtrl: LoadingController, private http: HttpClient, public toastCtrl: ToastController, private platform: Platform, private router: Router, public str: Storage, private file: File, private camera: Camera, private androidPermissions: AndroidPermissions) {
    console.log("u r here")
    this.str.get('id').then((value) => {
      this.userid = value;

    });
    this.callBranch();
    this.getsealuser();

  }

  getSealStatus() {

    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    // alert(this.branch);
    // "userid": this.userid

    this.http.post(this.url + 'get-seal-status', { "branch": this.branch }, { headers: headers }).subscribe((data: any) => {
      console.log("u r in get seal");
      console.log(data.data);
      this.seal = data.data.seal;
      

    }, error => {
      this.presentToast('Please check your internet Connection.', 3000, 'middle');
    });
  }



  getsealuser() {

    
    this.presentLoading();
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let datap = { id: '' };
    this.http.get(this.url + 'get-seal-user', { headers: headers }).subscribe((data: any) => {

      this.sealuserlist = data.data;
      console.log(this.sealuserlist)


    })

  }

  callBranch() {


    this.presentLoading();
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let datap = { id: '' };
    this.http.get(this.url + 'get-branch', { headers: headers }).subscribe((data: any) => {

      this.branches = data.data;


    })

  }


  readFile(file: any) {

    this.presentLoading();
    const reader = new FileReader();

    // reader.onloadend = () => {
    //  const imgBlob = new Blob([reader.result], {
    //   type: file.type
    //  });

    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    const formData = new FormData();

    formData.append('userid', this.sealuser);
    formData.append('name', this.name);
    formData.append('branch', this.branch);
    formData.append('date', this.date);
    formData.append('time', this.time);
    formData.append('seal', this.seal);
    formData.append('sealno', this.sealno);
    var fname = Math.floor(Math.random() * 100000);
    // formData.append('file', file);
    formData.append('image', file);
    // alert(file);

    this.http.post(this.url + 'add-seal-base', formData, { headers: headers }).subscribe((data: any) => {

      if (data.status)
        console.log(data);
      this.name = '';
      this.branch = ''
      this.date = '';
      this.time = '';
      this.seal = '';
      this.sealno = '';
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

  readFileCamera(file: any) {

    this.presentLoading();
    const reader = new FileReader();

    reader.onloadend = () => {
      // const imgBlob = new Blob([reader.result], {
      //   type: file.type
      // });
      const imgBlob = new Blob([reader.result as ArrayBuffer], {
        type: file.type
      });

      let headers = new HttpHeaders();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');

      const formData = new FormData();
      formData.append('userid', this.sealuser);
      formData.append('name', this.name);
      formData.append('branch', this.branch);
      formData.append('date', this.date);
      formData.append('time', this.time);
      formData.append('seal', this.seal);
      formData.append('sealno', this.sealno);

      formData.append('image', imgBlob, file.name);

      this.http.post(this.url + 'add-seal', formData, { headers: headers }).subscribe((data: any) => {

        if (data.status)
          console.log(data);
        this.name = '';
        this.branch = ''
        this.date = '';
        this.time = '';
        this.seal = '';
        this.sealno = '';
        this.dismiss();
        //this.image=data.image;
        this.presentToast(data.message, 4000, "bottom");
      }, error => {
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
    if (!this.name) {
      this.presentToast("Please enter your Name.", 4000, "bottom");
      return;
    }
    if (!this.branch) {
      this.presentToast("Please select your branch.", 4000, "bottom");
      return;
    }
    if (!this.date) {
      this.presentToast("Please enter Date.", 4000, "bottom");
      return;
    }
    if (!this.time) {
      this.presentToast("Please enter time.", 4000, "bottom");
      return;
    }
    if (!this.seal) {
      this.presentToast("Please select opening /closing.", 4000, "bottom");
      return;
    }
    if (!this.sealno) {
      this.presentToast("Please Enter seal no.", 4000, "bottom");
      return;
    }
    this.camera.getPicture(this.options).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.readFile(base64Image);

    }, (err) => {
      // Handle error
    });
  }



  takePictureCamera() {
    if (!this.name) {
      this.presentToast("Please enter your Name.", 4000, "bottom");
      return;
    }
    if (!this.branch) {
      this.presentToast("Please select your branch.", 4000, "bottom");
      return;
    }
    if (!this.date) {
      this.presentToast("Please enter Date.", 4000, "bottom");
      return;
    }
    if (!this.time) {
      this.presentToast("Please enter time.", 4000, "bottom");
      return;
    }
    if (!this.seal) {
      this.presentToast("Please select opening /closing.", 4000, "bottom");
      return;
    }
    if (!this.sealno) {
      this.presentToast("Please Enter seal no.", 4000, "bottom");
      return;
    }

    this.camera.getPicture(this.optionsCamera).then((imageData:any) => {
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
    }, (err:any) => {
      // Handle error
    });
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

  async presentLoading() {

    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 1000
    });

    await loading.present();

  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }

  ngOnInit() {
  }

}
