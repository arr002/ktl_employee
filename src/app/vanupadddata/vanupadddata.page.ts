import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Observable } from 'rxjs';
import { MenuController, ToastController, Platform, NavController, LoadingController, ModalController, PopoverController, ActionSheetController } from '@ionic/angular';
import { VanupadddatauploadPage } from '../vanupadddataupload/vanupadddataupload.page';
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
  selector: 'app-vanupadddata',
  templateUrl: './vanupadddata.page.html',
  styleUrls: ['./vanupadddata.page.scss'],
  standalone: false,
})
export class VanupadddataPage implements OnInit {
  finalSubmitData:finalSubmitData[]= [];
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
  towndatalist: any=[]; citydatalist:any=[];
  townselected: any; townnameDistrict:any="Select District"; townname: any = 'Select City';
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
address:any=""; startDate:any=""; start_time:any=""; end_time:any="";
distanceKms:any=""; van_no:any=""; vechicle_numer:any=""; payment_collected:any="";
dealer_name:any=""; claimed_amount:any="";

  hoursStart: string[] = []; minutesStart: string[] = []; 
  selectedHourStart: string = '12'; selectedMinuteStart: string = '00'; selectedAmPmStart: string = 'AM';

  hoursEnd: string[] = []; minutesEnd: string[] = []; 
  selectedHourEnd: string = '12'; selectedMinuteEnd: string = '00'; selectedAmPmEnd: string = 'AM';

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

    private androidPermissions: AndroidPermissions,

  ) {
    this.str.get('id').then((value) => {
      this.userid = value;
      this.getDateRequest();
      this.getDiscrictList(); 
      this.getVanDetails(); 
    });

    this.str.get('username').then((value) => {
      this.username = value;


    });


    // Populate hours (1 to 12)
    for (let i = 1; i <= 12; i++) {
      this.hoursStart.push(i < 10 ? '0' + i : i.toString());
    }

    // Populate minutes (00 to 59)
    for (let i = 0; i < 60; i++) {
      this.minutesStart.push(i < 10 ? '0' + i : i.toString());
    }

      // Populate hours (1 to 12)
    for (let i = 1; i <= 12; i++) {
      this.hoursEnd.push(i < 10 ? '0' + i : i.toString());
    }

    // Populate minutes (00 to 59)
    for (let i = 0; i < 60; i++) {
      this.minutesEnd.push(i < 10 ? '0' + i : i.toString());
    }

  }

  showDatePicker = false;
  selectedDate: string = '';
  formattedDate: string = '';

  openDatePicker() {
    this.showDatePicker = true;
  }

  closeDatePicker() {
    this.showDatePicker = false;
  }

  onDateSelected(event: any) {
    this.selectedDate = event.detail.value;
  }
  confirmDate() {
    //this.formattedDate = new Date(this.selectedDate).toDateString(); // format as needed
    const rawDate = new Date(this.selectedDate); // ISO string -> Date
     const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  this.formattedDate = rawDate.toLocaleString('en-US', options);
    //this.formattedDate = rawDate.toLocaleString(); // Date and time
    this.closeDatePicker();
  }

  showDatePicker1 = false;
  selectedDate1: string = '';
  formattedDate1: string = '';

  openDatePicker1() {
    this.showDatePicker1 = true;
  }

  closeDatePicker1() {
    this.showDatePicker1 = false;
  }

  onDateSelected1(event: any) {
    console.log("==event==",event);
    this.selectedDate1 = event.detail.value;
  }
  confirmDate1() {
    //this.formattedDate1 = new Date(this.selectedDate1).toDateString(); // format as needed
    const rawDate = new Date(this.selectedDate1); // ISO string -> Date
     const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  this.formattedDate1 = rawDate.toLocaleString('en-US', options);
    //this.formattedDate1 = rawDate.toLocaleString(); // Date and time
    this.closeDatePicker1();
  }


  openCal() {
    this.reqdate = true;
  }

  async openPopOverDistrict() {
    this.towndatalist.map((item:any) => item.town=item.name);
    console.log("this.towndatalist==", this.towndatalist);
    const modal = await this.modalCtrl.create({
      component: TownPage, componentProps: { title: "District", items: this.towndatalist }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
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

  city_id:any;
  async openPopOverCity() {
    this.citydatalist.map((item:any) => item.town=item.name);
    console.log("this.citydatalist==", this.citydatalist);
    const modal = await this.modalCtrl.create({
      component: TownPage, componentProps: { title: "City", items: this.citydatalist }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    console.log("=openPopOver=", data);
    if (data != undefined) {
      this.townselected = data;
      this.townname = data.selectedItem;
      const city_idArr = this.citydatalist.filter((item:any) => { if(item.name ==this.townname ) { return item; } });
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

  getVanDetails() {
    let headers = new HttpHeaders();
    //headers.append("Accept", 'application/json');
    //headers.append('Content-Type', 'application/json');
    //let datap = { user_id: this.userid };
    let formData: FormData = new FormData();
    formData.append('user_id', this.userid);
    this.http.post(this.url + 'get-van-detail', formData, { headers: headers }).subscribe((data: any) => {
      console.log(data);
      if(data.status) {
        this.dealer_name = data.data.dealer_name;
        this.claimed_amount = data.data.claimed_amount;
        this.address = data.data.address;
        this.username = data.data.name;
      }
      //this.daterequest = data.data;
    }, err => { })
  }

   onBrandChange(event:any) {
        console.log("=event==",(event));
        console.log("=event==",(event.detail.value));
        this.getFilledVanDetails(event.detail.value);
          // if(this.mode=='0') {
          //   this.articlesdata = this.maindata
          //       .filter((item: any) => (event.detail.value) === item.brand_name)
          //       .map((item: any) => [true, item.article_name, '', item.price, '']);
          //     console.log("this.maindata==",this.maindata);
          // }
      }
  getFilledVanDetails(van_no:any) {
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    // headers.append('Content-Type', 'application/json');
    // let datap = { user_id: this.userid, van_no: this.van_no };
    let formData: FormData = new FormData();
    formData.append('user_id', this.userid);
    formData.append('van_no', van_no);
    this.http.post(this.url + 'get-filled-van-detail', formData, { headers: headers }).subscribe((data: any) => {
      console.log(data);
      if(data.status) {
        if(data.data.length > 0) {
          this.daterequest.push(data.data.date);
          this.dateSelect=data.data.date; this.start_time=data.data.start_time; this.end_time=data.data.end_time;
          this.payment_collected = data.data.payment_collected;
        }
      }
    }, err => { })
  }

  downloadBtn() {
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    let formData: FormData = new FormData();
    formData.append('user_id', this.userid);
    formData.append('van_no', this.van_no);
    formData.append('date', this.dateSelect);
    this.http.post(this.url + 'download-van-report', formData, { headers: headers }).subscribe((data: any) => {
      console.log(data);
      if(data.status && data.data) {
        this.presentToast(data.msg, 4000, "bottom");
        let url= data.data;
        this.downloadExcel(url);
      } else {
        this.presentToast(data.msg, 4000, "bottom");
      }
    }, err => { })
  }

downloadExcel(url: string) {
  const timestamp = Date.now(); // current time in ms
  const randomNum = Math.floor(Math.random() * 10000); // random 4-digit number
  const filename = `vanReport_${timestamp}_${randomNum}.xlsx`;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename; // Optional, filename suggestion
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

  convertTo24Hour(selectedHour:any,minute:any, ampm:any) {
    let hour = parseInt(selectedHour, 10);
    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }

    const hourStr = hour < 10 ? '0' + hour : hour.toString();
    return `${hourStr}:${minute}`;
  }

  private convertToMinutes(hour: string, minute: string, ampm: string): number {
    let h = parseInt(hour, 10);
    const m = parseInt(minute, 10);

    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    return h * 60 + m;
  }

  valueConsSoldData=0;
  async openModal(value:any) {

    const startMinutes = this.convertToMinutes(this.selectedHourStart, this.selectedMinuteStart, this.selectedAmPmStart);
    const endMinutes = this.convertToMinutes(this.selectedHourEnd, this.selectedMinuteEnd, this.selectedAmPmEnd);

    if (endMinutes > startMinutes) {
      //this.presentToast('End Time is after Start Time.', 4000, "bottom"); return;
   
    this.start_time = this.convertTo24Hour(this.selectedHourStart,this.selectedMinuteStart,this.selectedAmPmStart);
    console.log("=start_time=",this.start_time);
    this.end_time = this.convertTo24Hour(this.selectedHourEnd,this.selectedMinuteEnd,this.selectedAmPmEnd);
    console.log("=end_time=",this.end_time);

    this.valueConsSoldData=value;
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
    this.http.post(this.url + 'monthly-consumption-articles', datap, { headers: headers }).subscribe(async(data: any) => {
      if( data.msg ==  "success") {
        const modal = await this.modalCtrl.create({ component: VanupadddatauploadPage, cssClass: 'dsrmodal', componentProps: { value: value, consumptionDataArr : data.data  } });
        modal.onDidDismiss()
          .then((data) => {
            console.log("==openModal==",data);
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

    } else if (endMinutes === startMinutes) {
      this.presentToast('Start Time and End Time cannot be the same.', 4000, "bottom"); return;
    } else {
      this.presentToast('End Time must be after Start Time.', 4000, "bottom"); return;
    }
 
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
        let datap = {user_id:this.userid, city_id:this.city_id, type: this.visitType, name: this.finalSubmitData[iAll].name, phone: this.finalSubmitData[iAll].phone, booked:consArr, solds: soldArr, date: this.dateSelect, start_time: this.start_time, end_time: this.end_time, payment_collected:this.payment_collected, vechicle_numer: this.vechicle_numer, van_no: this.van_no, kms: this.distanceKms };
    let headers = new HttpHeaders(); const formData = new FormData();
       headers.append("Accept", 'application/json'); headers.append('Content-Type', 'application/json');
    // let consArr = [];
    // for(let i=0;i<this.customer.length;i++) {
    //   consArr.push(...this.customer[i].data);
    // }
    // let soldArr = [];
    // for(let i=0;i<this.customerSold.length;i++) {
    //   soldArr.push(...this.customerSold[i].data);
    // }
    //
    console.log("=datap==",datap);
    this.http.post(this.url + 'van-report-create' ,datap,{headers:headers}).subscribe((data:any)=>{
      console.log("van-report-create data==",data);
      console.log("this.finalSubmitData.length-1)=="+(this.finalSubmitData.length-1)+"=="+ iAll);
      if((this.finalSubmitData.length-1) == iAll) {
        this.presentToast(data.msg, 4000, "bottom");
        this.city_id=""; this.visitType="";this.name=""; this.phone="";consArr =[]; soldArr=[]; this.dateSelect=""; this.start_time=""; this.end_time="";this.payment_collected=""; this.van_no=""; this.distanceKms="";
        this.customer=[]; this.customerSold=[];
        this.townname="Select City"; this.citydatalist=[]; this.townselected=""; 
        this.townnameDistrict="Select District";
        this.finalSubmitData=[];
        this.vechicle_numer="";
      }
    }, err => {  
      console.log("==err==",err); 
      let errorMsg = "Kindly check internet connection.";
        if (err.status === 400 && err.error && err.error.message) {
          // Handle backend structured error (e.g., { message: { solds: 'solds required' } })
          const message = err.error.message;
          if (typeof message === 'object') {
            errorMsg = Object.values(message).join(', ');
          } else {
            errorMsg = message;
          }
        }
        if((this.finalSubmitData.length-1) == iAll) {
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
