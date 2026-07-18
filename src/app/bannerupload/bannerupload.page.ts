import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, Platform, NavController, ModalController, ActionSheetController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { File, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { environment } from '../../environments/environment';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';

@Component({
  selector: 'app-bannerupload',
  templateUrl: './bannerupload.page.html',
  styleUrls: ['./bannerupload.page.scss'],
  standalone: false,
})
export class BanneruploadPage implements OnInit {
  userid: any;
  shop_name: any;
  shop_mobile: any;
  customer_type: any;
  
  lat: any;
  long: any;
  isLoading = false;
  imageBlob: any;
  imageFile: any;

  optionsGallery: CameraOptions = {
    quality: 100,
    targetWidth: 800,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  };
  options: CameraOptions = {
    quality: 100,
    allowEdit: false,
    targetWidth: 800,
    cameraDirection: 0,
    saveToPhotoAlbum: false,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.CAMERA
  };

  url = environment.SERVER_URL;

  constructor(public menuCtrl: MenuController,
    public actionsheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    private platform: Platform,
    private router: Router,
    public str: Storage,
    private file: File,
    private camera: Camera,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation) {

    this.str.get('id').then((value) => {
      this.userid = value;
    });
  }

  ngOnInit() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.long = resp.coords.longitude;
    }).catch((error) => {
      this.presentToast("Please check your location is enabled.", 4000, "bottom");
    });
    this.getLocation();
  }

  async getLocation(): Promise<boolean> {
    try {
      const locationStatus = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
      );
  
      if (!locationStatus.hasPermission) {
        const locationRequest = await this.androidPermissions.requestPermission(
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
        );
        if (!locationRequest.hasPermission) return false;
      }
  
      const storageStatus = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
      );
  
      if (!storageStatus.hasPermission) {
        const storageRequest = await this.androidPermissions.requestPermission(
          this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        );
        if (!storageRequest.hasPermission) return false;
      }
  
      return true;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  async openePicChooser() {
    const actionSheet = await this.actionsheetCtrl.create({
      header: 'Option',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'ios-camera-outline' : '',
          handler: () => {
            this.takePicture();
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: !this.platform.is('ios') ? 'ios-images-outline' : '',
          handler: () => {
             this.takePictureFile();
          }
        },
      ]
    });
    await actionSheet.present();
  }

  takePictureFile() {
    this.camera.getPicture(this.optionsGallery).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.readFileGallery(base64Image);
    }, (err) => {
      // Handle error
    });
  }

  readFileGallery(file: any) {
    this.imageFile = file;
    this.imageBlob = null;
    this.presentToast("Image selected from gallery.", 2000, "bottom");
  }

  takePicture() {
    this.camera.getPicture(this.options).then((imageData) => {
      this.file.resolveLocalFilesystemUrl(imageData).then((entry: any) => {
        if (entry.isFile) {
          const fileEntry = entry as FileEntry;
          fileEntry.file(file => {
            this.readFile(file);
          }, error => {
            console.error('Error getting file:', error);
          });
        }
      }, error => {
        console.error('Error resolving file system URL', error);
      });
    }, (err) => {
      // Handle error
    });
  }

  readFile(file: any) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imgBlob = new Blob([reader.result as ArrayBuffer], {
        type: file.type
      });
      this.imageBlob = imgBlob;
      this.imageFile = file.name;
      this.presentToast("Image selected from camera.", 2000, "bottom");
    };
    reader.readAsArrayBuffer(file);
  }

  uploadData() {
    if (!this.customer_type) { this.presentToast("Customer Type is required.", 4000, "bottom"); return; }
    if (!this.shop_name) { this.presentToast("Shop Name is required.", 4000, "bottom"); return; }
    if (!this.shop_mobile) { this.presentToast("Shop Mobile is required.", 4000, "bottom"); return; }
    if (!this.imageFile && !this.imageBlob) { this.presentToast("Please attach an image.", 4000, "bottom"); return; }

    this.presentLoading();

    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');

    const formData = new FormData();
    formData.append('userid', this.userid || '');
    formData.append('shop_name', this.shop_name || '');
    formData.append('customer_type', this.customer_type || '');
    formData.append('shop_mobile', this.shop_mobile || '');
    formData.append('lat', this.lat || '');
    formData.append('long', this.long || '');
    
    if (this.imageBlob) {
      formData.append('image', this.imageBlob, this.imageFile);
    } else {
      formData.append('image', this.imageFile);
    }

    this.http.post(this.url + 'upload-banner', formData, { headers: headers }).subscribe((data: any) => {
      this.dismiss();
      if (data.status) {
        this.presentToast(data.message || data.msg || "Uploaded successfully.", 4000, "bottom");
        this.shop_name = "";
        this.shop_mobile = "";
        this.customer_type = "";
        this.imageFile = null;
        this.imageBlob = null;
      } else {
        this.presentToast(data.message || data.msg || "Error uploading data", 4000, "bottom");
      }
    }, error => {
      this.dismiss();
      this.presentToast('Please check your internet Connection.', 3000, 'bottom');
    });
  }

  presentToast(msg: any, durat: any, pos: any) {
    this.toastCtrl.create({ message: msg, duration: durat, position: pos }).then((toastData) => { toastData.present(); });
  }

  async presentLoading() {
    this.isLoading = true;
    const a = await this.loadingCtrl.create({});
    await a.present();
    if (!this.isLoading) {
      await a.dismiss();
    }
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().catch(() => {});
  }

  validatePhone(event: any) {
    let input = event.target.value;
    input = input.replace(/\D/g, '');
    input = input.slice(0, 10);
    this.shop_mobile = input;
  }

  onKeyDown(event: KeyboardEvent) {}

  onKeyUp(event: KeyboardEvent) {
    if (this.shop_mobile && this.shop_mobile.length > 10) {
      this.shop_mobile = this.shop_mobile.slice(0, 10);
    }
  }
}
