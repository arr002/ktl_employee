import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Observable } from 'rxjs';
import { MenuController, ToastController, Platform, NavController,LoadingController, ModalController, PopoverController,ActionSheetController, AlertController } from '@ionic/angular';
import { DrtrpopupPage } from '../drtrpopup/drtrpopup.page';
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

@Component({
  selector: 'app-drtrupload',
  templateUrl: './drtrupload.page.html',
  styleUrls: ['./drtrupload.page.scss'],
  standalone: false,
})
export class DrtruploadPage implements OnInit {

  dateSelect:any;
  visitType:any;
  name:any;
  phone:any;
  brands:any;
  article:any;
  userid:any;
  customer:Customer[]=[];
  filedata:any;
  imgBlob:any='';
  comment:any='';
  daterequest:any;
  hotelnote:any;
  towndatalist:any;
  townselected:any;
  townname:any='';
    isLoading = false;
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
  
    url = environment.SERVER_URL;
    username:any;
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
      public alertController: AlertController,
      private androidPermissions: AndroidPermissions,
  
      ) { 
      this.str.get('id').then((value) => { 
                    this.userid=value;   
                    this.getDateRequest();
                     this.getTowns();
                  });
  
      this.str.get('username').then((value) => { 
                    this.username=value;
        
                  
                  });
    }
  
      openCal(){
  
  this.reqdate=true;
  
    }
  
  
     async openPopOver() {
    const popover = await this.popoverController.create({
      component: TownPage,
      
      translucent: false,
      componentProps: {
        title: "Bank Account",
        items: this.towndatalist,
      }
    });
     
     await popover.present();
     
     // Listen for onDidDismiss
     const { data } = await popover.onDidDismiss();
     
     if (data !== null) {
      console.log(data);
      this.townselected=data;
     this.townname=data.selectedItem;
     }
   } 
  
  
    getclientname(){
     
  
       let headers = new HttpHeaders(); 
          headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
         
          let datap = {phone:this.phone};
          this.http.post(this.url + 'getdrtrcustomername' ,datap,{headers:headers}).subscribe((data:any)=>{
          console.log(data);
            this.name=data.data;
              
          }, err => {  })
  
  
    }
    getTowns(){
  
      let headers = new HttpHeaders(); 
          headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
         
          let datap = {appuser_id:this.userid};
          this.http.post(this.url + 'getcustomertown' ,datap,{headers:headers}).subscribe((data:any)=>{
          
            this.towndatalist=data.data;
              
          }, err => {  })
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
  
    ngOnInit() {
        this.datetime = new Date().toISOString();
      let date=new Date();
      let daten=new Date();
      date.setDate(date.getDate() - 1);
      daten.setDate(daten.getDate() - 3);
      
      this.mindate = daten.toISOString();
      this.maxdate = date.toISOString();
    }
    
    addDrtr(){
      // let data={visitType:this.visitType,name:this.name,phone:this.phone,brands:this.brands,article:this.article,qty:0,itemvalue:0,price:0}
      // this.customer.push(data);
  
    }
  
  
     async openModal() {
  
      if(this.name.length<4){
      this.presentToast("Please check name . It should be min 3 chars", 4000, "bottom");
      return;
  
     }
     
     if(this.phone.length!=10){
      this.presentToast("Please check phone no", 4000, "bottom");
      return;
  
     }
      const modal = await this.modalCtrl.create({
        component: DrtrpopupPage,
        cssClass: 'dsrmodal',
        componentProps: { value: 0,mode:'add'}
        
      });
       modal.onDidDismiss()
        .then((data) => {
          console.log(data);
         
          let newdata={name:this.name, phone:this.phone, visittype: this.visitType, town:this.townname,file:data.data.file,data : data.data.data,comment:data.data.comment,consumption:data.data.consumption,dealer:data.data.dealer, lat: data.data.lat, lang: data.data.lang};
          console.log(newdata);
          this.customer.push(newdata);
          this.name='';
          this.phone='';
          this.imgBlob='';
          this.townname='';
      });
      modal.present();
    }
  
  
   delItem(i:any){
      
      this.customer.splice(i, 1);
    }
  
  dateChangeDrop(){}
  
  
     async uploadDRMT() {
      const alert = await this.alertController.create({
        header: 'Confirm',
        message: 'Are you sure you want to upload this data?',
        buttons: [
          {
            text: 'NO',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Upload cancelled');
            }
          }, {
            text: 'YES',
            handler: () => {
              this.proceedUploadDRMT();
            }
          }
        ]
      });

      await alert.present();
    }

    proceedUploadDRMT() {
        let headers = new HttpHeaders();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json');
  
        const formData = new FormData();
        formData.append('appuser_id', this.userid);
        formData.append('date', this.dateSelect);
        //formData.append('type', 'DRMT');
        formData.append('data', JSON.stringify(this.customer));
        formData.append('comment', this.comment);
        //formData.append('file', this.imgBlob);
        
        
        this.http.post(this.url + 'adddmrtdata', formData, { headers: headers }).subscribe((data: any) => {
  
         this.presentToast(data.message, 4000, "bottom");
            this.navctrl.navigateRoot('home');
        }, err => {  });
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
        this.imgBlob=imgBlobs;
        this.filedata=files;
        reader.readAsArrayBuffer(files);
    }
  }
  

}
