import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, Platform, NavController, ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { environment } from '../../environments/environment';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { ClientsPage } from '../clients/clients.page';

@Component({
  selector: 'app-attandence',
  templateUrl: './attandence.page.html',
  styleUrls: ['./attandence.page.scss'],
  standalone: false,
})
export class AttandencePage implements OnInit {
  version: any;

  userid: any;
  name: any;
  image: any;
  empcode: any;
  phone: any;
  department: any;
  designation: any;
  branchname: any;
  dob: any;
  doj: any;
  address: any;
  client: any;

  lat: any;
  long: any;
  comment: any;
  subject: any = '';
  isLoading = false;
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: true
  };


  optionsGallery: CameraOptions = {
    // Lower size/quality reduces WebView OOM kills on low-RAM phones during camera.
    quality: 60,
    targetWidth: 640,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  };
  options: CameraOptions = {
    quality: 60,
    allowEdit: false,
    targetWidth: 640,
    cameraDirection: 1, // Will be overridden in takePicture()
    saveToPhotoAlbum: false,
    correctOrientation: true,
    // DATA_URL (base64) avoids file:// resolution, which silently fails on
    // newer Android (scoped storage), especially Samsung devices
    destinationType: 0, // DATA_URL
    encodingType: 0, // JPEG
    mediaType: 0, // PICTURE
    sourceType: 1 // CAMERA
  };

  url = environment.SERVER_URL;

  constructor(public menuCtrl: MenuController,
    public actionsheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    private platform: Platform,
    private router: Router,
    public str: Storage,
    public popoverController: ModalController,
    private file: File,
    private camera: Camera,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation) {

    this.initAttendanceSession();
  }

  /** Restore session + draft after camera WebView kills on some phones. */
  private async initAttendanceSession() {
    this.restoreAttendanceDraft();
    const id = await this.ensureSessionReady();
    if (id) {
      this.userid = id;
      this.getProfile(id);
      this.getLocation();
    }
  }

  /** Ensure staff id exists in Ionic Storage and localStorage before camera opens. */
  private async ensureSessionReady(): Promise<any> {
    await this.str.create();
    let id = await this.str.get('id');
    if (!id || id === 'null') {
      id = localStorage.getItem('ktl_id');
      if (id && id !== 'null') {
        await this.str.set('id', id);
        for (const key of ['username', 'empid', 'otp', 'mobile']) {
          const v = localStorage.getItem('ktl_' + key);
          if (v != null && v !== '' && v !== 'null') {
            await this.str.set(key, v);
          }
        }
      }
    }
    if (id && id !== 'null') {
      this.userid = id;
      localStorage.setItem('ktl_id', String(id));
      // Mirror remaining session keys so a process kill during camera keeps login.
      for (const key of ['username', 'empid', 'otp', 'mobile']) {
        const v = await this.str.get(key);
        if (v != null && v !== '' && v !== 'null') {
          localStorage.setItem('ktl_' + key, String(v));
        }
      }
      return id;
    }
    return null;
  }

  private saveAttendanceDraft() {
    try {
      localStorage.setItem('ktl_att_draft', JSON.stringify({
        subject: this.subject || '',
        client: this.client || '',
        comment: this.comment || '',
        userid: this.userid || localStorage.getItem('ktl_id') || ''
      }));
    } catch (e) {}
  }

  private restoreAttendanceDraft() {
    try {
      const raw = localStorage.getItem('ktl_att_draft');
      if (!raw) {
        return;
      }
      const draft = JSON.parse(raw);
      if (draft.subject) {
        this.subject = draft.subject;
      }
      if (draft.client) {
        this.client = draft.client;
      }
      if (draft.comment) {
        this.comment = draft.comment;
      }
      if (draft.userid && !this.userid) {
        this.userid = draft.userid;
      }
    } catch (e) {}
  }

  private clearAttendanceDraft() {
    localStorage.removeItem('ktl_att_draft');
  }

  private prepareForCamera() {
    this.saveAttendanceDraft();
    localStorage.setItem('ktl_return_route', this.router.url || '/attandence');
  }

  optionSelected() {

    if (this.subject == 'Reached Customer' || this.subject == 'Going to Customer') {

      this.presentPop(this.userid);
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

  async takePictureFile() {
    if (!this.subject) {
      this.presentToast("Please select drop down option.", 4000, "bottom");
      return;
    }

    // Camera plugin only works inside the native app; use a file input in the browser
    if (!this.platform.is('cordova')) {
      this.pickImageInBrowser(false);
      return;
    }

    const sessionOk = await this.ensureSessionReady();
    if (!sessionOk) {
      this.presentToast('Session expired. Please login again.', 4000, 'bottom');
      this.router.navigate(['/login']);
      return;
    }

    // Persist route + draft so a WebView kill during gallery returns here, not /login
    this.prepareForCamera();

    this.camera.getPicture(this.optionsGallery).then((imageData) => {
      localStorage.removeItem('ktl_return_route');
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.readFileGallery(base64Image);

    }, (err) => {
      localStorage.removeItem('ktl_return_route');
      if (err && String(err).toLowerCase().indexOf('cancel') === -1 && String(err).indexOf('No Image Selected') === -1) {
        this.presentToast('Could not open gallery: ' + err, 4000, 'bottom');
      }
    });
  }

  // Gallery: standard file picker. Camera: live webcam overlay (works on laptop + phone browsers).
  pickImageInBrowser(useCamera: boolean) {
    if (useCamera) {
      this.openLaptopCamera();
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        this.readFile(input.files[0]);
      }
    };
    input.click();
  }

  async openLaptopCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.presentToast('Camera is not supported in this browser.', 4000, 'bottom');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
    } catch (err) {
      this.presentToast('Please allow camera access in the browser, then try again.', 5000, 'bottom');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'ktl-camera-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;';

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.srcObject = stream;
    video.style.cssText = 'max-width:100%;max-height:70vh;width:100%;object-fit:cover;';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:16px;margin-top:20px;';

    const captureBtn = document.createElement('button');
    captureBtn.textContent = 'Capture';
    captureBtn.style.cssText = 'padding:12px 28px;border:0;border-radius:24px;background:#279CFF;color:#fff;font-size:16px;cursor:pointer;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'padding:12px 28px;border:0;border-radius:24px;background:#666;color:#fff;font-size:16px;cursor:pointer;';

    const stopCamera = () => {
      stream.getTracks().forEach(t => t.stop());
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };

    cancelBtn.onclick = () => stopCamera();

    captureBtn.onclick = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        stopCamera();
        this.presentToast('Could not capture photo. Please try again.', 4000, 'bottom');
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stopCamera();
      canvas.toBlob((blob) => {
        if (!blob) {
          this.presentToast('Could not capture photo. Please try again.', 4000, 'bottom');
          return;
        }
        // Use browser File (Cordova File plugin shadows the global File type)
        const BrowserFile = (window as any).File;
        const file = new BrowserFile([blob], 'attendance_' + Date.now() + '.jpg', { type: 'image/jpeg' });
        this.readFile(file);
      }, 'image/jpeg', 0.9);
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(captureBtn);
    overlay.appendChild(video);
    overlay.appendChild(btnRow);
    document.body.appendChild(overlay);
  }

  async readFileGallery(file: any) {

    this.presentLoading();
    const sessionId = await this.ensureSessionReady();
    this.restoreAttendanceDraft();
    if (!sessionId && !this.userid) {
      this.dismiss();
      this.presentToast('Session expired. Please login again.', 4000, 'bottom');
      this.router.navigate(['/login']);
      return;
    }

    try {
      const resp = await this.geolocation.getCurrentPosition({ enableHighAccuracy: true });
      this.lat = resp.coords.latitude;
      this.long = resp.coords.longitude;
    } catch (error) {
      console.log('Error getting location', error);
    }

    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    const formData = new FormData();
    formData.append('staff_id', this.userid || localStorage.getItem('ktl_id') || '');
    formData.append('lat', this.lat || '');
    formData.append('long', this.long || '');
    formData.append('position', this.subject || '');
    formData.append('client', this.client || '');
    formData.append('comment', this.comment || '');

    formData.append('file', file);

    this.http.post(this.url + 'uploads-attendance-base', formData, { headers: headers }).subscribe((data: any) => {

      if (data.status)
        console.log(data);

      this.clearAttendanceDraft();
      this.client = "";
      this.lat = "";
      this.long = "";
      this.comment = "";
      this.subject = "";
      this.dismiss();
      this.presentToast(data.message, 4000, "bottom");
    }, error => {
      this.dismiss();
      this.presentToast('Please check your internet Connection.', 3000, 'middle')
      this.presentToast("Error uploading. Please try again.", 4000, "bottom");
     
    });
    
  }






  async presentPop(id: any) {
    const popover = await this.popoverController.create({
      component: ClientsPage,
      componentProps: { head: 'Order Confirmation', header: 'Order Uploaded Successfully.', userid: id }

    });

    popover.onDidDismiss()
      .then((result) => {
        if (result && result['data'] && result['data'].client) {
          this.client = result['data'].client;
        } else {
          // Modal was closed without choosing a client; reset the dropdown
          this.client = '';
          this.subject = '';
        }
      });

    return await popover.present();

  }
  getProfile(userid:any) {
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    let datap = { staff_id: userid };
    this.http.post(this.url + 'get-staff', datap, { headers: headers }).subscribe((data: any) => {

      if (data.status) {
        this.name = data.data.name;
        this.empcode = data.data.employee_code;
        this.phone = data.data.phone;
        this.address = data.data.address;
        this.department = data.data.department;
        this.designation = data.data.designation;
        this.branchname = data.data.branch_name;
        this.dob = data.data.dob;
        this.doj = data.data.doj;
        if (data.image_path == '') {
          this.image = 'assets/profile.jpg';
        }
        else {
          //this.image="";
          this.image = data.image_path;
        }

      } else {
        //this.presentToast(res.message,3000,'middle')
      }
    }, err => { })
  }


  readFile(file: any) {

    this.presentLoading();
    const reader = new FileReader();

    reader.onloadend = async () => {
      await this.ensureSessionReady();
      this.restoreAttendanceDraft();

      const imgBlob = new Blob([reader.result as ArrayBuffer], {
        type: file.type
      });

      try {
        const resp = await this.geolocation.getCurrentPosition({ enableHighAccuracy: true });
        this.lat = resp.coords.latitude;
        this.long = resp.coords.longitude;
      } catch (error) {
        console.log('Error getting location', error);
      }

      let headers = new HttpHeaders();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');

      const formData = new FormData();
      formData.append('staff_id', this.userid || localStorage.getItem('ktl_id') || '');
      formData.append('lat', this.lat || '');
      formData.append('long', this.long || '');
      formData.append('position', this.subject || '');
      formData.append('client', this.client || '');
      formData.append('comment', this.comment || '');

      formData.append('file', imgBlob, file.name);

      this.http.post(this.url + 'uploads-attendance', formData, { headers: headers }).subscribe((data: any) => {

        if (data.status)
          console.log(data);
        this.clearAttendanceDraft();
        this.client = "";
        this.lat = "";
        this.long = "";
        this.comment = "";
        this.subject = "";
        this.dismiss();
        this.presentToast(data.message, 4000, "bottom");
      }, error => {
        this.dismiss();
        this.presentToast('Please check your internet Connection.', 3000, 'middle')
        this.presentToast("Error uploading. Please try again.", 4000, "bottom");
      });
    };
    reader.readAsArrayBuffer(file);
  }

  async takePicture() {
    if (!this.subject) {
      this.presentToast("Please select drop down option.", 4000, "bottom");
      return;
    }

    // Camera plugin only works inside the native app; use a file input in the browser
    if (!this.platform.is('cordova')) {
      this.pickImageInBrowser(true);
      return;
    }

    const sessionOk = await this.ensureSessionReady();
    if (!sessionOk) {
      this.presentToast('Session expired. Please login again.', 4000, 'bottom');
      this.router.navigate(['/login']);
      return;
    }

    // The CAMERA permission is declared in the manifest, so it MUST be granted
    // at runtime before opening the camera, otherwise it silently fails.
    const allowed = await this.ensureCameraPermission();
    if (!allowed) {
      return;
    }

    // Explicitly set to front camera before opening
    this.options.cameraDirection = this.camera.Direction.FRONT;

    // Persist route + draft so a WebView kill during camera returns here, not /login
    this.prepareForCamera();
    
    this.camera.getPicture(this.options).then((imageData) => {
      localStorage.removeItem('ktl_return_route');
      // Same base64 upload path as the gallery flow
      const base64Image = 'data:image/jpeg;base64,' + imageData;
      this.readFileGallery(base64Image);
    }, (err) => {
      localStorage.removeItem('ktl_return_route');
      const errText = String(err || '');
      if (errText && errText.toLowerCase().indexOf('cancel') === -1 && errText.indexOf('No Image Selected') === -1) {
        this.showCameraError(errText);
      }
    });
  }

  async showCameraError(errText: string) {
    const alert = await this.alertCtrl.create({
      header: 'Camera Error',
      message: 'The camera could not be opened: ' + errText +
        '. Please make sure camera permission is allowed in Phone Settings > Apps > KTL Plus > Permissions.',
      buttons: ['OK']
    });
    await alert.present();
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
    this.isLoading = true;
    return await this.loadingCtrl.create({
      // duration: 5000,
    }).then(a => {
      a.present().then(() => {
        console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });

    //await loading.present();

  }
  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }

  ngOnInit() {


    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.long = resp.coords.longitude;
    }).catch((error) => {
      this.presentToast("Please check your location is enabled.", 4000, "bottom");
    });

   


  }


  // Checks CAMERA permission and keeps insisting until the user grants it.
  async ensureCameraPermission(): Promise<boolean> {
    try {
      const status = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.CAMERA
      );
      if (status.hasPermission) {
        return true;
      }

      const request = await this.androidPermissions.requestPermission(
        this.androidPermissions.PERMISSION.CAMERA
      );
      if (request.hasPermission) {
        return true;
      }

      // User denied: keep insisting with a blocking alert until granted
      return await this.showCameraPermissionAlert();
    } catch (error) {
      console.error('Camera permission check error:', error);
      // If the permission plugin itself fails, let the camera plugin try anyway
      return true;
    }
  }

  showCameraPermissionAlert(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: 'Camera Permission Required',
        message: 'Attendance photo cannot be taken without camera access. ' +
          'Please allow the camera permission. If no permission popup appears, enable it manually: ' +
          'Phone Settings > Apps > KTL Plus > Permissions > Camera > Allow.',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.presentToast('Camera permission is required to upload attendance.', 4000, 'bottom');
              resolve(false);
            }
          },
          {
            text: 'Allow Camera',
            handler: () => {
              this.androidPermissions.requestPermission(
                this.androidPermissions.PERMISSION.CAMERA
              ).then((result) => {
                if (result.hasPermission) {
                  resolve(true);
                } else {
                  // Still denied: insist again
                  this.showCameraPermissionAlert().then(resolve);
                }
              }, () => {
                this.showCameraPermissionAlert().then(resolve);
              });
            }
          }
        ]
      });
      await alert.present();
    });
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
  

}
