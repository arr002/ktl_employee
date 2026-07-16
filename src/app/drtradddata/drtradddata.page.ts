import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Observable } from 'rxjs';
import { MenuController, ToastController, Platform, NavController, LoadingController, ModalController, PopoverController, ActionSheetController } from '@ionic/angular';
import { DrtradddatapopupPage } from '../drtradddatapopup/drtradddatapopup.page';
import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { TownPage } from '../town/town.page';

interface Customer {
  name: string;
  phone: string;
  visittype: string;
  town: string;
  file: any;
  data: any;
  comment: string;
  consumption: any;
  dealer: any;
}

interface finalSubmitData {
  name: any;
  phone: any;
  customer: Customer[],
  customerSold: Customer[],
}

@Component({
  selector: 'app-drtradddata',
  templateUrl: './drtradddata.page.html',
  styleUrls: ['./drtradddata.page.scss'],
  standalone: false,
})
export class DrtradddataPage implements OnInit {
  finalSubmitData: finalSubmitData[] = [];
  dateSelect: any;
  visitType: any;
  name: any;
  phone: any;
  brands: any;
  article: any;
  userid: any;
  customer: Customer[] = [];
  customerSold: Customer[] = [];
  filedata: any;
  imgBlob: any = '';
  comment: any = '';
  daterequest: any;
  hotelnote: any;
  towndatalist: any = []; citydatalist: any = [];
  townselected: any; townnameDistrict: any = "Select District"; townname: any = 'Select City';
  isLoading = false;
  reqdate = false;
  datetime: any;
  mindate: any;
  maxdate: any;
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
  SERVERForQR_URL = environment.SERVERForQR_URL;
  username: any;
  DealerName:any;

  constructor(private modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    private navctrl: NavController,
    private platform: Platform,
    private router: Router,
    public str: Storage,
    public popoverController: PopoverController,
    private file: File,
    private camera: Camera,
    private androidPermissions: AndroidPermissions
  ) {
    this.str.get('id').then((value) => {
      this.userid = value;
      this.getDateRequest();
      this.getDiscrictList();
      this.getDealerName();
    });

    this.str.get('username').then((value) => {
      this.username = value;
    });
  }

  getDealerName() {
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    let formData: FormData = new FormData();
    formData.append('user_id', this.userid);
    this.http.post(this.url + 'get-dealer-name', formData, { headers: headers }).subscribe((data: any) => {
      console.log("get-dealer-name resp="+data);
      if(data.status && data.data) {
        this.DealerName= data.data.name;
      } else {
        this.presentToast(data.msg, 4000, "bottom");
      }
    }, err => { })
  }

  openCal() {
    this.reqdate = true;
  }

  async openPopOverDistrict() {
    this.towndatalist.map((item: any) => item.town = item.name);
    console.log("this.towndatalist==", this.towndatalist);
    const popover = await this.popoverController.create({
      component: TownPage, translucent: false, componentProps: { title: "District", items: this.towndatalist }
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    console.log("=openPopOver=", data);
    if (data != undefined) {
      //this.townselected = data;
      this.townnameDistrict = data.selectedItem;
      let districtArrRes = this.towndatalist.filter((towns: any) => {
        return towns.town == this.townnameDistrict;
      });
      let districtId = districtArrRes[0].id;
      let headers = new HttpHeaders();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');
      let datap = { appuser_id: this.userid, district_id: districtId };
      this.http.post(this.url + 'city-list', datap, { headers: headers }).subscribe((data: any) => {
        this.citydatalist = data.data;
      }, err => { })
    }
  }

  city_id: any;
  async openPopOverCity() {
    this.citydatalist.map((item: any) => item.town = item.name);
    console.log("this.citydatalist==", this.citydatalist);
    const popover = await this.popoverController.create({
      component: TownPage, translucent: false, componentProps: { title: "City", items: this.citydatalist }
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    console.log("=openPopOver=", data);
    if (data != undefined) {
      this.townselected = data;
      this.townname = data.selectedItem;
      const city_idArr = this.citydatalist.filter((item: any) => { if (item.name == this.townname) { return item; } });
      this.city_id = city_idArr[0].id;
    }
  }

  getclientname() {
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let datap = { phone: this.phone };
    this.http.post(this.url + 'getdrtrcustomername', datap, { headers: headers }).subscribe((data: any) => {
      console.log(data);
      this.name = data.data;
    }, err => { })
  }

  getTowns() {
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let datap = { appuser_id: this.userid };
    this.http.post(this.url + 'getcustomertown', datap, { headers: headers }).subscribe((data: any) => {
      this.towndatalist = data.data;
    }, err => { })
  }

  getDiscrictList() {
    this.http.get(this.url + 'discrict-list').subscribe((data: any) => {
      this.towndatalist = data.data;
    }, err => { })
  }

  getDateRequest() {
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    let datap = { appuser_id: this.userid, typerequest: 'DSR' };
    this.http.post(this.url + 'getdaterequested', datap, { headers: headers }).subscribe((data: any) => {
      console.log(data);
      this.daterequest = data.data;
    }, err => { })

  }

  ngOnInit() {
    this.datetime = new Date().toISOString();
    let date = new Date();
    let daten = new Date();
    date.setDate(date.getDate() - 1);
    daten.setDate(daten.getDate() - 3);
    this.mindate = daten.toISOString();
    this.maxdate = date.toISOString();
  }

  addDrtr() {
    // let data={visitType:this.visitType,name:this.name,phone:this.phone,brands:this.brands,article:this.article,qty:0,itemvalue:0,price:0}
    // this.customer.push(data);
  }
  valueConsSoldData = 0;
  async openModal(value: any) {
    this.valueConsSoldData = value;
    // if (this.dateSelect == undefined || this.dateSelect == "") {
    //   this.presentToast("Select Uploading Date is required.", 4000, "bottom"); return;
    // }

    // if (this.visitType == undefined || this.visitType == "") { this.presentToast("Customer Type is required.", 4000, "bottom"); return; }

    if (this.name == undefined || this.name == "") { this.presentToast("Name is required.", 4000, "bottom"); return; }

    if (this.name.length < 4) {
      this.presentToast("Please check name . It should be min 3 chars", 4000, "bottom"); return;
    }

    if (this.phone == undefined || this.phone == "") { this.presentToast("Phone is required.", 4000, "bottom"); return; }

    if (this.phone.length != 10) { this.presentToast("Please check phone no", 4000, "bottom"); return; }

    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let datap = { appuser_id: this.userid, phone: this.phone };
    this.http.post(this.url + 'monthly-consumption-articles', datap, { headers: headers }).subscribe(async (data: any) => {
      if (data.msg == "success") {
        const modal = await this.modalCtrl.create({ component: DrtradddatapopupPage, cssClass: 'dsrmodal', componentProps: { value: value, consumptionDataArr: data.data } });
        modal.onDidDismiss()
          .then((data) => {
            console.log("==openModal==", data);
            // if(value==0) {
            this.customer.push({ name: this.name, phone: this.phone, visittype: this.visitType, town: this.townname, file: data.data.file, data: data.data.data1, comment: data.data.comment, consumption: data.data.consumption, dealer: data.data.dealer });
            //this.name = ''; this.phone = ''; this.imgBlob = ''; this.townname = 'Select City';
            // } else {
            this.customerSold.push({ name: this.name, phone: this.phone, visittype: this.visitType, town: this.townname, file: data.data.file, data: data.data.data, comment: data.data.comment, consumption: data.data.consumption, dealer: data.data.dealer });
            //this.name = ''; this.phone = ''; this.imgBlob = ''; this.townname = 'Select City';
            // }
            this.finalSubmitData.push({ name: this.name, phone: this.phone, customer: this.customer, customerSold: this.customerSold });
            this.phone = "";
            this.name = "";
            this.customer=[];
            this.customerSold=[];
          });
        modal.present();
      } else {
        this.presentToast(data.msg, 4000, "bottom"); return;
      }
    }, err => {
      this.presentToast("No internet connection.", 4000, "bottom"); return;
    })


  }

  validatePhone(event: any) {
    let input = event.target.value;
    input = input.replace(/\D/g, '');
    input = input.slice(0, 10);
    this.phone = input;
  }

  onKeyDown(event: KeyboardEvent) {
    // const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'];

    // // Allow control keys and digits only
    // if (
    //   !/^\d$/.test(event.key) &&
    //   !allowedKeys.includes(event.key)
    // ) {
    //   event.preventDefault();
    // }
  }

  onKeyUp(event: KeyboardEvent) {
    // Trim the mobile number to 10 digits if it exceeds
    if (this.phone.length > 10) {
      this.phone = this.phone.slice(0, 10);
    }
  }

  delItemFinal() {

  }

  delItem(i: any, valueConsSoldData: any, iAll: any) {
    if (valueConsSoldData == 0) {
      this.finalSubmitData[iAll].customer.splice(iAll, 1);
    } else if (valueConsSoldData == -1) {
      this.finalSubmitData.splice(iAll, 1);
    } else {
      this.finalSubmitData[iAll].customerSold.splice(iAll, 1);
    }
  }

  dateChangeDrop() { }

  uploadDRMT() {
    if (this.finalSubmitData.length == 0) {
      this.presentToast("No data Found, Kindly add data.", 4000, "bottom"); return;
    } else {
      for (let iAll = 0; iAll < this.finalSubmitData.length; iAll++) {
        let consArr = [];
        for (let i = 0; i < this.finalSubmitData[iAll].customer.length; i++) {
          consArr.push(...this.finalSubmitData[iAll].customer[i].data);
        }
        let soldArr = [];
        for (let i = 0; i < this.finalSubmitData[iAll].customerSold.length; i++) {
          soldArr.push(...this.finalSubmitData[iAll].customerSold[i].data);
        }
        let datap = { user_id: this.userid, city_id: this.city_id, type: this.visitType, name: this.finalSubmitData[iAll].name, number: this.finalSubmitData[iAll].phone, cons: consArr, solds: soldArr, date: this.dateSelect };
        console.log("=datap==", datap);
        let headers = new HttpHeaders(); const formData = new FormData();
        headers.append("Accept", 'application/json'); headers.append('Content-Type', 'application/json');
        this.http.post(this.url + 'css-report-create', datap, { headers: headers }).subscribe((data: any) => {
          console.log("==data==", data);
          if(this.finalSubmitData.length-1 ==iAll) {
            this.presentToast(data.msg, 4000, "bottom");
            this.customer = []; this.customerSold = [];
            this.city_id = ""; this.visitType = ""; this.name = ""; this.phone = "";
            this.townname = "Select City"; this.citydatalist = []; this.townselected = "";
            this.townnameDistrict = "Select District";
            this.dateSelect = "";
            this.finalSubmitData=[];
          }
        }, err => {
          console.log("==err==", err);
          let errorMsg = "Kindly check internet connection.";
          if (err.status === 400 && err.error && err.error.message) {
            const message = err.error.message;
            if (typeof message === 'object') {
              errorMsg = Object.values(message).join(', ');
            } else {
              errorMsg = message;
            }
          }
          if(this.finalSubmitData.length-1 ==iAll) {
            this.presentToast(errorMsg, 4000, "bottom");
          }
        })
      }
    }
  }

  presentToast(msg: any, durat: any, pos: any) {
    this.toastCtrl.create({ message: msg, duration: durat, position: pos }).then((toastData) => { console.log(toastData); toastData.present(); });
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
  takePicture() {

    this.camera.getPicture(this.options).then((imageData) => {
      // this.file.resolveLocalFilesystemUrl(imageData).then((entry: FileEntry) => {
      //   entry.file(file => {
      //     console.log(file);
      //     this.readFile(file);
      //   });
      // });
      this.file.resolveLocalFilesystemUrl(imageData).then((entry: any) => {
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
    }, (err) => {
      // Handle error
    });
  }

  readFile(files: any) {


    const reader = new FileReader();

    reader.onloadend = () => {
      const imgBlobs = new Blob([reader.result as ArrayBuffer], {
        type: files.type
      });
      this.imgBlob = imgBlobs;
      this.filedata = files;
      reader.readAsArrayBuffer(files);
    }
  }


}
