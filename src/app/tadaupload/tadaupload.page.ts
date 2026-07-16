import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, Platform, NavController, ModalController, ActionSheetController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { environment } from '../../environments/environment';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-tadaupload',
  templateUrl: './tadaupload.page.html',
  styleUrls: ['./tadaupload.page.scss'],
  standalone: false,
})
export class TadauploadPage implements OnInit {

  dateSelect:any=""; travelType:any=""; imageShow:any=""; travleKm:any=""; travleAmt:any="0";
  tadatype:any;
 daterequest:any;
  userid:any;
  finalArr:any=[];
  hotelnote:any="";
  isLoading = false;
  isFile=false;
  filedata:any="";
  imgBlob:any;
  url=environment.SERVER_URL;
  limit:any;
  carrate:any=0;
  bikerate:any=0;
  used_limit:any;
  limit_bal:any;
  oth_exp:any;
  reqdate=false;
datetime:any;
mindate: any;
maxdate:any;
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


  constructor(
    public toastCtrl: ToastController,
    private  http:HttpClient,
    public str:Storage,
    public menuCtrl: MenuController,
     private navctrl: NavController,
    public actionsheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    private platform: Platform,
    private router: Router,
    public popoverController: ModalController,
    private file: File,
    private camera: Camera,
    private androidPermissions: AndroidPermissions,

    ) {

    this.str.get('id').then((value) => { 
                  this.userid=value;
      
               this.getTadaType();
               this.getDateRequest();
               this.getLimit();
                });


  }

   ngOnInit() {
    this.datetime = new Date().toISOString();
    let date=new Date();
    let daten=new Date();
    date.setDate(date.getDate() - 1);
    daten.setDate(daten.getDate() - 3);
    
    this.mindate = daten.toISOString();
    this.maxdate = date.toISOString();
  }

  openCal(){
    this.reqdate=true;
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

  dateChangeDrop() {

  }


getdata(){
  
}
  travelTypeDrop() {
    console.log(this.travelType.id + '=' + this.travelType.iskm);
   
  }

getDateRequest(){
   let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json' );
       
        let datap = {appuser_id:this.userid,typerequest:'DSR'};
        this.http.post(this.url + 'getdaterequested' ,datap,{headers:headers}).subscribe((data:any)=>{
        console.log(data);
          this.daterequest=data.data;
            
        }, err => {  })

}

changeFn(e:any){
  //console.log(this.travelType);
  this.travelType.name
  if (this.travelType.id=1){

  this.travleAmt=this.bikerate * e.target.value;
  }
  else{
  this.travleAmt=this.carrate * e.target.value ;
  }
  
}

 getLimit(){

 let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json' );
       
        let datap = {appuser_id:this.userid};

        this.http.post(this.url + 'checklimit' ,datap,{headers:headers}).subscribe((data:any)=>{
        console.log(data);
          this.limit=data.limit;
          this.used_limit=data.used_limit;
          this.limit_bal=data.limit_bal;
          this.oth_exp=data.oth_exp;
          this.bikerate=data.bike_km_rate;
          this.carrate=data.car_km_rate;
        }, err => {  })
}
    getTadaType(){

    let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json' );
       
        let datap = {appuser_id:this.userid};
        this.http.post(this.url + 'gettadadtype' ,datap,{headers:headers}).subscribe((data:any)=>{
        console.log(data);
          this.tadatype=data.data;
            
        }, err => {  })
  }

  OpenPancardFile() {
     this.camera.getPicture(this.options).then((imageData) => {

       let base64Image = 'data:image/jpeg;base64,' + imageData;
      // alert(base64Image);
      
       this.filedata=base64Image;
       this.isFile=true;
      
    }, (err) => {
      // Handle error
    });
  }



 


  saveBtn() {
   
    if(this.travelType == "") {
      this.presentToast('Travel Type is required.', 3000, 'middle');
      return;
    }
    if(this.travleKm == "" && this.travelType.iskm==1) {
      this.presentToast('Travel Dist. is required.', 3000, 'middle');
      return;
    }
    if(this.travleAmt == "") {
      this.presentToast('Travel Amount is required.', 3000, 'middle');
      return;
    }
    var dateWise = [];
        dateWise.push({ travelType: this.travelType.name,'iskm':this.travelType.iskm, hotelnote:this.hotelnote,travleKm: this.travleKm, travleAmt: this.travleAmt, imageShow: this.imageShow,'isfile':this.isFile,'image':this.filedata});
    this.finalArr.push({dateWise: dateWise });
     //dateWise.splice(0, 1);
    this.travelType=""; this.travleKm=""; this.imageShow="";this.isFile=false;

  }


  presentToast(msg: any, durat: any, pos: any) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: durat,
      position: pos
    }).then((toastData:any) => {
      toastData.present();
    });
  }

  dateWiseSubBtn(i:any,j:any) {
    console.log("dateWiseSubBtn");
    if(i==0) {
      this.finalArr.splice(i, 1);
    } else {
      this.finalArr[i].splice(j, 1);
    }
  }

  dateWiseBtn(i:any) {
    console.log("dateWiseBtn");
    this.finalArr.splice(i, 1);
  }

 uploadTADA(){
       if(this.dateSelect == "") {
      this.presentToast('Date is required.', 3000, 'middle');
      return;
    }

     if(this.finalArr == "" || this.finalArr==null) {
      this.presentToast('Date is required.', 3000, 'middle');
      return;
    }
     let headers = new HttpHeaders();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');
//travelType: this.travelType, travleKm: this.travleKm, travleAmt: this.travleAmt,date: this.dateSelect, dateWise: dateWise 
      const formData = new FormData();
      formData.append('appuser_id', this.userid);
      formData.append('date', this.dateSelect);
      formData.append('data', JSON.stringify(this.finalArr));

     

        this.http.post(this.url + 'addtadadata' ,formData,{headers:headers}).subscribe((data:any)=>{
         this.presentToast(data.message, 4000, "bottom");
        console.log(data.message);
        
          this.navctrl.navigateRoot('home');
        


         this.dateSelect=""; this.travelType=""; this.travleKm=""; this.imageShow="";this.isFile=false;
        }, err => {  })

  }

}
