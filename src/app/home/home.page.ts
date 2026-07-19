import { Component, OnInit, Type } from '@angular/core';
import { MenuController, ToastController, Platform, NavController, PopoverController, ActionSheetController, AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';

import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { environment } from '../../environments/environment';
import { AppComponent } from '../app.component';

import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
//import { Market } from '@awesome-cordova-plugins/market/ngx';
import { PopupPage } from '../popup/popup.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  version: any;
  userid: any;
  name: any;
  image: any;
  mobile: any;
  empmanager: any;
  empcode: any;
  phone: any;
  department: any;
  designation: any;
  branchname: any;
  dob: any;
  doj: any;
  address: any;
  client: any;
  isLoading = false;
  statusdsrDrtr: any;

  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: true
  };
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
    allowEdit: true,
    targetWidth: 800,
    cameraDirection: 0,
    saveToPhotoAlbum: false,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.CAMERA
  };

  url = environment.SERVER_URL;
  manager_type: any;
  homescreendata: any;
  groupedmenu: any[] = [];
  buddyattendacne: any;
  constructor(public menuCtrl: MenuController,
    private navctrl: NavController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    public actionsheetCtrl: ActionSheetController,
    private platform: Platform, private router: Router, public str: Storage, 
    private barcodeScanner: BarcodeScanner, private iab: InAppBrowser,
    public popoverController: PopoverController, private file: File, private camera: Camera, 
    private androidPermissions: AndroidPermissions,
    public alertCtrl: AlertController
    //, private market: Market
  ) {
      this.platform.ready().then(async () => {
        this.getStorageValue();
      });
  }

  async getStorageValue() {
    await this.str.create();
    this.str.get('id').then((value) => {
      this.userid = value;
      this.callCirculars(this.userid);
      this.getProfile(this.userid);
      this.getHomescreen(this.userid);  // Looping screen through api
       this.checkpass(this.userid);
    });

    this.str.get("version").then((version) => {
      this.version = version;
      this.checkVersion(version);
    });
  }
  
 checkpass(id:any) {
  let headers = new HttpHeaders();
  headers.append("Accept", 'application/json');
  headers.append('Content-Type', 'application/json');
  let datap = { user_id: id, };
  console.log(datap);
  this.http.post(this.url + 'checkuser', datap, { headers: headers }).subscribe((data: any) => {


    if (data.success == false) {


       this.str.set('id',null);
       this.str.set('username',null);
      this.str.set('empid',null);
      this.str.set('otp',null);
      this.str.set('mobile',null);

      this.navctrl.navigateRoot('login');
    }


  });
}

callCirculars(value:any) {
  // this.presentLoading();
  console.log("call circular")
  console.log(value)
  let headers = new HttpHeaders();
  headers.append("Accept", 'application/json');
  headers.append('Content-Type', 'application/json');
  let datap = { staffid: value };
  this.http.post(this.url + 'get-circular', datap, { headers: headers }).subscribe((data: any) => {

    if (data.status) {
      this.navctrl.navigateRoot('notices');
    }
  })

}


navigateRoute(id:any, route:any) {
  if (id == 13) {
    this.gotosetClient();
  } else if (id == 16) {
    this.checkmanagerid();
  } else if (id == 26) {
    this.barcodeScannerBtn();
  } else if (id == 31) {
    this.logout();
  } else {
    this.navctrl.navigateRoot(route);
  }
}

getHomescreen(value:any) {

  let headers = new HttpHeaders();
  headers.append("Accept", 'application/json');
  headers.append('Content-Type', 'application/json');

  let datap = { staffid: value };

  this.http.post(this.url + 'get-homescreen', datap, { headers: headers }).subscribe((data: any) => {
    console.log("department11");
    console.log(data);

    if (data.status) {

      this.homescreendata = (data.result || []).map((item: any) => {
        const name = (item.itemname || '').toString().trim().toLowerCase().replace(/\s+/g, '');
        if (name === 'allattendance' || name === 'allattandance') {
          return { ...item, itemname: 'All Attendance' };
        }
        if (name.includes('compaints') || name.includes('suggestion/compaints')) {
          return { ...item, itemname: 'Suggestion/Complaints' };
        }
        return item;
      }).filter((item: any) => {
        const name = (item.itemname || '').toString().trim().toLowerCase();
        const route = (item.route || '').toString().trim().toLowerCase();
        // Logout and My Profile live in the side panel — hide menu tile duplicates
        return item.id != 31 && name !== 'logout' && name !== 'my profile' && route !== 'profile';
      });

      this.groupedmenu = this.buildGroups(this.homescreendata);
    } else {

    }
  }, err => { this.presentToast('Please check your internet Connection.', 3000, 'middle') })
}

buildGroups(items: any[]) {
  const sections = [
    { title: 'Attendance', routes: ['allattendance', 'markattendance', 'myattendance', 'buddyattendance', 'viewattendance', 'editattendance', 'attandence'] },
    { title: 'Reports & DSR', routes: ['dsrupload', 'industrial', 'dsrdrtrview', 'drtrupload', 'ccsreportupload', 'opn-clsdailyseal'] },
    { title: 'Payroll & TADA', routes: ['payroll', 'tada', 'tadaupload', 'mytada'] },
    { title: 'Sales & Clients', routes: ['newsetclient', 'newsetclientemp', 'newsetstate', 'vanupadddata', 'scancode', 'shopbanner', 'courier'] }
  ];

  const used = new Set<any>();
  const groups = sections.map(sec => {
    const groupItems = (items || []).filter((item: any) => {
      const route = (item.route || '').toString().trim().toLowerCase();
      if (sec.routes.indexOf(route) !== -1) {
        used.add(item);
        return true;
      }
      return false;
    });
    return { title: sec.title, items: groupItems };
  });

  const rest = (items || []).filter((item: any) => !used.has(item));
  groups.push({ title: 'General', items: rest });

  return groups.filter(g => g.items.length > 0);
}

async presentModal() {
  const modal = await this.popoverController.create({
    component: PopupPage,

  });
  return await modal.present();
}




checkmanagerid() {

  let headers = new HttpHeaders();
  headers.append("Accept", 'application/json');
  headers.append('Content-Type', 'application/json');

  let datap = { managerid: this.userid };
  this.http.post(this.url + 'check-manager', datap, { headers: headers }).subscribe((data: any) => {
    if (data.status) {
      this.navctrl.navigateRoot('viewattendance');

    } else {
      this.presentToast("Not Authenticated User", 3000, 'middle')
    }
  }, err => { this.presentToast('Please check your internet Connection.', 3000, 'middle') })



}
gotosetClient() {

  if (this.department == 'Sales' || this.manager_type == 'Manager' || this.manager_type == 'Branch Manager') {

    console.log(this.manager_type)
  }

  let navigationExtras: NavigationExtras = {
    queryParams: {
      special: JSON.stringify({ manager_type: this.manager_type })
    }
  };
  this.router.navigate(['setclient'], navigationExtras);
}

DRMTUploadBtn() {
  let navigationExtras: NavigationExtras = {
    queryParams: {
      special: JSON.stringify({ manager_type: this.manager_type })
    }
  };
  this.router.navigate(['ccsreportupload']);
}

VanUploadBtn() {
  let navigationExtras: NavigationExtras = {
    queryParams: {
      special: JSON.stringify({ manager_type: this.manager_type })
    }
  };
  this.router.navigate(['vanupadddata']);
}

openMenu() {
  this.menuCtrl.enable(true, 'home-menu');
  this.menuCtrl.open('home-menu');
}

reloadHome() {
  this.getProfile(this.userid);
  this.getHomescreen(this.userid);
}

doRefresh(event: any) {
  this.getProfile(this.userid);
  this.getHomescreen(this.userid);
  setTimeout(() => event.target.complete(), 1200);
}

async openMyProfile() {
  await this.menuCtrl.close('home-menu');
  this.navctrl.navigateRoot('profile');
}

changeProfilePhoto() {
  this.menuCtrl.close('home-menu');
  this.takePicture();
}

async logout() {
    await this.menuCtrl.close('home-menu');
    const alert = await this.alertCtrl.create({
      header: 'Warning', message: 'Are you sure want to logout?',
      buttons: [
        { text: 'Yes', handler: () => { 
          this.str.set('id', null);
          this.router.navigateByUrl('/login', { skipLocationChange: true });
        } },
        { text: 'No', role: 'cancel' }
      ]
    });
    alert.present();
}

getProfile(userid:any) {
  let headers = new HttpHeaders();
  headers.append("Accept", 'application/json');
  headers.append('Content-Type', 'application/json');

  let datap = { staff_id: userid };
  this.http.post(this.url + 'get-staff', datap, { headers: headers }).subscribe((data: any) => {

    console.log("buddy")
    console.log(data)
    console.log("buddy")
    if (data.status) {
      if(data.data) {
        this.name = data.data.name;
        this.empcode = data.data.employee_code;
        this.phone = data.data.phone;
        this.address = data.data.address;
        this.department = data.data.department;
        this.designation = data.data.designation;
        this.branchname = data.data.branch_name;
        this.dob = data.data.dob;
        this.doj = data.data.doj;
        this.empmanager = data.data.emp_manager;
      }
      this.manager_type = data.manager_type;
      this.buddyattendacne = data.buddy_attendance;

      if (data.image_path == '' || data.image_path == "" || data.image_path == null) {
        this.image = 'assets/profile.jpg';
      }
      else {
        this.image = data.image_path;
      }

    } else {
      //this.presentToast(res.message,3000,'middle')
    }
  }, err => { this.presentToast('Please check your internet Connection.', 3000, 'middle') })
}
checkVersion(version:any) {
  let headers = new HttpHeaders();
  headers.append("Accept", 'application/json');
  headers.append('Content-Type', 'application/json');

  let datap = { version: version };
  this.http.get(this.url + 'get-version?version=' + version, { headers: headers }).subscribe((data: any) => {
    console.log("check version data")
    console.log(data)
    //alert(data.status);
    if (data.status) {
     // this.market.open('plus.ktl.in');
    } else {
      console.log("Error in check version data")
      //this.presentToast(res.message,3000,'middle')
    }
  }, err => { console.log('Error in checkVersion ', err) })
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
    // headers.append('Content-Type', 'application/json');

    const formData = new FormData();
    formData.append('staff_id', this.userid);
    formData.append('file', imgBlob, file.name);

    this.http.post(this.url + 'uploads-profile-image', formData, { headers }).subscribe((data: any) => {

      if (data.status)
        console.log(data);
      this.dismiss();
      this.image = data.image;
      //this.presentToast(data.message,4000,"bottom");
    }, error => {
      this.presentToast('Please check your internet Connection.', 3000, 'middle')
      this.presentToast("Error uploading. Please try again.", 4000, "bottom");
      //this.loader.dismiss();
      //this.toast.presentToast("Check internet connection");
    });
  };
  reader.readAsArrayBuffer(file);
}





takePicture() {

  // this.camera.getPicture(this.options).then((imageData) => {
  //   this.file.resolveLocalFilesystemUrl(imageData).then((entry: FileEntry) => {
  //     entry.file(file => {
  //       console.log(file);
  //       this.readFile(file);
  //     });
  //   });
  // }, (err) => {
  //   // Handle error
  // });

  this.camera.getPicture(this.options).then(imagePath => {
    // Platform-specific path fix (especially important for Android)
    let filePath: string;
    if (this.platform.is('android')) {
      if (imagePath.startsWith('file://')) {
        filePath = imagePath;
      } else {
        filePath = 'file://' + imagePath;
      }
    } else {
      filePath = imagePath;
    }

    // this.file.resolveLocalFilesystemUrl(filePath).then((entry: FileEntry) => {
    //   entry.file(file => {
    //     console.log('File object:', file);
    //     this.readFile(file);
    //   }, error => {
    //     console.error('Error reading file entry', error);
    //   });
    // }, error => {
    //   console.error('Error resolving file system URL', error);
    // });

    this.file.resolveLocalFilesystemUrl(filePath).then((entry: any) => {
      if (entry.isFile) {
        const fileEntry = entry as FileEntry;
        fileEntry.file(file => {
          console.log('File object:', file);
          this.readFile(file);
        }, error => {
          console.error('Error getting file:', error);
        });
      } else {
        console.error('Entry is not a file.');
      }
    }, error => {
      console.error('Error resolving file system URL', error);
    });


  }).catch(err => {
    console.error('Camera error:', err);
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
  this.platform.ready().then(async (readySource) => {
    console.log("readySource="+readySource);
    if(readySource=='dom') {
    } else {
      this.androidPermissions.hasPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
      .then(status => {
        if (status.hasPermission) {
          //this.downloadFile();
        }
        else {
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE)
            .then(status => {
              if (status.hasPermission) {
                //this.downloadFile();
              }
            });
        }
      });
    }
  });
}

async selectDsrDrtr() {
  const actionSheet = await this.actionsheetCtrl.create({
    header: 'Option',
    cssClass: 'action-sheets-basic-page',
    buttons: [
      {
        text: 'DSR',
        role: 'destructive',
        icon: 'document-outline',
        handler: () => {
          this.openePicChooser("DSR");
        }
      },
      {
        text: 'DRTR',
        icon: 'newspaper-outline',
        handler: () => {
          this.openePicChooser("DRTR");
        }
      },
    ]
  });
  await actionSheet.present();
}


async openePicChooser(type:any) {
  this.statusdsrDrtr = type;

  const actionSheet = await this.actionsheetCtrl.create({
    header: 'Option',
    cssClass: 'action-sheets-basic-page',
    buttons: [
      {
        text: 'Take photo',
        role: 'destructive',
        icon: 'camera-outline',
        handler: () => {
          this.takedsrdrtrPic();
        }
      },
      {
        text: 'Choose photo from Gallery',
        icon: 'image-outline',
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
    // alert(base64Image);
    
    this.readFileGallery(base64Image);

  }, (err) => {
    // Handle error
  });
}

readFileGallery(file: any) {

  this.presentLoading();
  const reader = new FileReader();

  let headers = new HttpHeaders();
  headers.append("Accept", 'application/json');
  headers.append('Content-Type', 'application/json');

  const formData = new FormData();

  formData.append('empid', this.userid);    
  formData.append('drtr', this.statusdsrDrtr);      
  formData.append('image', file);

  this.http.post(this.url + 'add-drtr-base', formData, { headers: headers }).subscribe((data: any) => {

    if (data.status)
      console.log(data);
          
    this.dismiss();
    
    this.presentToast(data.message, 4000, "bottom");
  }, error => {

    this.presentToast('Please check your internet Connection.', 3000, 'middle')
    this.presentToast("Error uploading. Please try again.", 4000, "bottom");
    this.dismiss();
    
   
  });
  
}

takedsrdrtrPic() {

  this.camera.getPicture(this.options).then((imageData) => {
    // this.file.resolveLocalFilesystemUrl(imageData).then((entry: FileEntry) => {
    //   entry.file(file => {
    //     console.log(file);
    //     this.readdsrFile(file);
    //   });
    // });
    this.file.resolveLocalFilesystemUrl(imageData).then((entry: any) => {
      if (entry.isFile) {
        const fileEntry = entry as FileEntry;
        fileEntry.file(file => {
          console.log('File object:', file);
          this.readdsrFile(file);
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

readdsrFile(file: any) {
  // alert(this.statusdsrDrtr);
  this.presentLoading();
  const reader = new FileReader();

  reader.onloadend = () => {
    const imgBlob = new Blob([reader.result as ArrayBuffer], {
      type: file.type
    });

    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    // headers.append('Content-Type', 'application/json');

    const formData = new FormData();

    formData.append('empid', this.userid);

    formData.append('drtr', this.statusdsrDrtr);

    formData.append('image', imgBlob, file.name);

    this.http.post(this.url + 'add-drtr', formData, { headers }).subscribe((data: any) => {

      if (data.status)
        console.log(data);

      this.dismiss();
     
      this.presentToast(data.message, 4000, "bottom");
    }, (error:any) => {
      this.presentToast('Please check your internet Connection.', 3000, 'middle')
      this.presentToast("Error uploading. Please try again.", 4000, "bottom");
      this.dismiss();
      //this.toast.presentToast("Check internet connection");
    });
  };
  reader.readAsArrayBuffer(file);
}


  barcodeScannerBtn() {
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      if(barcodeData.format == "QR_CODE") {
        let barcodeDataText = barcodeData.text;
        console.log("barcodeData.text == ",barcodeDataText);
        this.openWebBrowser(barcodeDataText);
      } else {

      }
     }).catch(err => {
       console.log('Error', err);
     });
  }

  openWebBrowser(barcodeDataText:any) {
    const options: InAppBrowserOptions = { location: 'no', hidden: 'no', toolbar: 'no' };
    const endpointParam = barcodeDataText+"&user_id="+this.userid;
    const browser = this.iab.create(endpointParam, '_blank', options);
    browser.on('loadstop').subscribe(event => {
      console.log('Page loaded:', event.url);
      browser.executeScript({
        code: `
          if (!document.getElementById('customCloseBtn')) {
            const btn = document.createElement('button');
            btn.id = 'customCloseBtn';
            btn.innerText = 'Close';
            btn.style.position = 'fixed';
            btn.style.top = '10px';
            btn.style.right = '10px';
            btn.style.zIndex = '9999';
            btn.style.padding = '10px';
            btn.style.background = '#000';
            btn.style.color = '#fff';
            btn.style.border = 'none';
            btn.style.borderRadius = '5px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => window.location.href = 'exit://';
            document.body.appendChild(btn);
          }
        `
      });
      if (event.url.startsWith('exit://')) {
        browser.close();
      }      
    });
    browser.on('exit').subscribe(() => {
      console.log('Browser closed');
    });
  }

}
