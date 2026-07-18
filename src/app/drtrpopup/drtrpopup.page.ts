
import { Component, OnInit, Input } from '@angular/core';
import { ModalController ,NavParams,ToastController} from '@ionic/angular';
import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { Observable } from 'rxjs';

interface DataItem {
  brands: any;
  article: any;
  qty: any;
  itemvalue: any;
  price: any;
}

@Component({
  selector: 'app-drtrpopup',
  templateUrl: './drtrpopup.page.html',
  styleUrls: ['./drtrpopup.page.scss'],
  standalone: false,
})

export class DrtrpopupPage implements OnInit {
  data:DataItem[]=[];
  qty:any=0;
  itemvalue:any='';
  price:any;
  article:any;
  brands:any;
  addarticle:any="";
  reqarticle:any=false;
  filedata:any;
  imgBlob:any='';
  dealername:any='';
  GT:any=0;
  GTKTL:any=0;
  maindata:any=[
                        [true,'2/180 M','',70,''],[true,'3/135 M','',70,''],[true,'2/800 M','',110,''], [true,'2/10000 M','',110,''],[true,'2/200 G','',100,''],
                        [true,'2/170 G','',100,''],[true,'2/300 M','',120,''],[true,'CFC-8"','',4,''],[true,'LFC-8"','',4,''],[true,'CINC','',5,''] ,[true,'Others','','1',''],[true,'2/130M','',85,'']
                        ];
  articlesdata:any=[
                        [true,'2/180 M','',70,''],[true,'3/135 M','',70,''],[true,'2/800 M','',110,''], [true,'2/10000 M','',110,''],[true,'2/200 G','',100,''],
                        [true,'2/170 G','',100,''],[true,'2/300 M','',120,''],[true,'CFC-8"','',4,''],[true,'LFC-8"','',4,''],[true,'CINC','',5,''] ,[true,'Others','','1',''],[true,'2/130M','',85,'']
                        ];
  
  articlesktl:any=[
                        [true,'2/180 M','',70,''],[true,'3/135 M','',70,''],[true,'2/800 M','',110,''], [true,'2/10000 M','',110,''],[true,'2/200 G','',100,''],
                        [true,'2/170 G','',100,''],[true,'2/300 M','',120,''],[true,'CFC-8"','',4,''],[true,'LFC-8"','',4,''],[true,'CINC','',5,''] ,[true,'Others','','1',''],[true,'2/130M','',85,'']
                        ];
  mode:any;
  clientname:any;
  lat: any = '';
  lang: any = '';
  
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
     destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA
    };
    constructor(private modalController: ModalController,
      public toastCtrl: ToastController,
  private navParams:NavParams,
   private file: File,
      private camera: Camera,
  
      private androidPermissions: AndroidPermissions,
      private geolocation: Geolocation
  
  ) { 
  this.mode=this.navParams.get('mode');
      if(this.mode=='add'){
      
      }
  
    }
  
    ngOnInit() {
        this.geolocation.getCurrentPosition().then((resp) => {
          this.lat = resp.coords.latitude;
          this.lang = resp.coords.longitude;
        }).catch((error) => {
          this.presentToast("Please check your location is enabled.", 4000, "bottom");
        });
    }
  openCal(){
    this.reqarticle=true;
  }
  addArticleData(){
    if(this.addarticle==""){
       this.presentToast("Please enter article", 4000, "bottom");
      return;
    }
    else{
      //*****console.log("'" + this.addarticle + "'");
      //*****this.articlesdata.push("'" + this.addarticle + "'");
      //*****this.articlesdata="";
       //*****this.reqarticle=false;
    }
    
  }
  
  calculate(index:any){
    let tval=0;
  
     if(this.articlesdata[index][0]==true && this.articlesdata[index][2]!=''){
    this.articlesdata[index][4]=parseInt(this.articlesdata[index][2]) * parseInt(this.articlesdata[index][3]); 
  }
    for(var i = 0; i < this.articlesdata.length; i++) {
  
      tval+= parseInt(this.articlesdata[i][4]);
    }
    this.GT=tval;
  }
  calculatektl(index:any){
    let tval=0;
  
    if(this.articlesktl[index][0]==true && this.articlesktl[index][2]!=''){
    this.articlesktl[index][4]=parseInt(this.articlesktl[index][2]) * parseInt(this.articlesktl[index][3]); 
  }
     for(var i = 0; i < this.articlesdata.length; i++) {
      tval+= parseInt(this.articlesdata[i][4]);
    }
    this.GTKTL=tval;
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
  addDrtr(){
  
  
    if (this.brands=="" || this.brands==null){
       this.presentToast("Please check Brands", 4000, "bottom");
      return;
    }
    // if (this.article=="" || this.article==null){
    //    this.presentToast("Please check article", 4000, "bottom");
    //   return;
    // }
    // if (this.qty.toString()=="" || this.qty==null){
    //    this.presentToast("Please check qty", 4000, "bottom");
    //   return;
    // }
    
  
    //  if (this.price.toString=="" || this.price==null){
    //    this.presentToast("Please Check Secondary Sales", 4000, "bottom");
    //   return;
    // }
    for(var i = 0; i < this.articlesdata.length; i++) {
      
      if(this.articlesdata[i][0]==true && this.articlesdata[i][2]!=''){
        
       let dataval : DataItem = {brands:this.brands,article:this.articlesdata[i][1],qty:this.articlesdata[i][2],itemvalue:this.articlesdata[i][3],price:this.articlesdata[i][4]}
       
       this.data.push(dataval);
     }
      }
   
   this.articlesdata=null;
  this.articlesdata=this.maindata;
      this.brands='';
     this.GT='';
      this.imgBlob='';
    }
  
  
  
    async postData(){
  
      if (this.imgBlob == '') {
        this.presentToast("Please take a photo of the shop", 4000, "bottom");
        return;
      }

  
      for(var i = 0; i < this.articlesktl.length; i++) {
      
      if(this.articlesktl[i][0]==true && this.articlesktl[i][2]!=''){
        
       let dataval : DataItem = {brands:'KTL',article:this.articlesktl[i][1],qty:this.articlesktl[i][2],itemvalue:this.articlesktl[i][3],price:this.articlesktl[i][4]}
       this.data.push(dataval);
     }
      }
  
      let lastdata={file:this.imgBlob,data:this.data,'comment':this.itemvalue,'consumption':this.qty,'dealer':this.dealername, 'lat': this.lat, 'lang': this.lang}
  
      // let data={zip:this.zip,thread:this.thread,collection:this.paymentcollected,issue:this.currentissue,remarks:this.remarks,clientname:this.clientname,id:this.id}
      await this.modalController.dismiss(lastdata);
    }
  
     delItem(i:any){
      
      this.data.splice(i, 1);
    }
  
   takePicture() {
     
      this.camera.getPicture(this.options).then((imageData:any) => {
        let base64Image = 'data:image/jpeg;base64,' + imageData;
        this.imgBlob=base64Image;
        //alert(base64Image);
      });
    }
  //    readFile(files: any) {
  //     const reader = new FileReader();
  // alert(files);
  //     reader.onloadend = () => {
  //       const imgBlobs = new Blob([reader.result], {
  //         type: files.type
  //       });
  //       alert(imgBlobs);
  //       alert(files);
  //       this.imgBlob=imgBlobs;
  //       this.filedata=files;
  //       reader.readAsArrayBuffer(files);
  //   }
  // }
  

}
