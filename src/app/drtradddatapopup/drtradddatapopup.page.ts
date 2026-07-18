import { Component, OnInit, Input } from '@angular/core';
import { ModalController ,NavParams,ToastController} from '@ionic/angular';
import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Observable } from 'rxjs';

interface DataItem {
  branch_name: any;
  name: any;
  qty: any;
  itemvalue: any;
  price: any;
}
@Component({
  selector: 'app-drtradddatapopup',
  templateUrl: './drtradddatapopup.page.html',
  styleUrls: ['./drtradddatapopup.page.scss'],
  standalone: false,
})
export class DrtradddatapopupPage implements OnInit {
  brandArr:any = []; // [{ "name": "Coats", "value": "Coats" },{ "name": "Vardhman", "value": "Vardhman" },{ "name": "Pasupati", "value": "Pasupati" },{ "name": "TIL", "value": "TIL" },{ "name": "Perfect", "value": "Perfect" },{ "name": "YKK", "value": "YKK" },{ "name": "Gill", "value": "Gill" },{ "name": "TEX", "value": "TEX" },{ "name": "Unorganized", "value": "Unorganized" }];
  brandArr1:any = [];
  data:DataItem[]=[];  data1:DataItem[]=[];
  qty:any=0;
  itemvalue:any='';
  price:any;
  article:any;
  brands:any; brands1:any;
  addarticle:any="";
  reqarticle:any=false;
  filedata:any;
  imgBlob:any='';
  dealername:any='';
  GT:any=0; GT1:any=0;
  GTKTL:any=0;
  maindata:any=[
                        [true,'2/180 M','',70,''],[true,'3/135 M','',70,''],[true,'2/800 M','',110,''], [true,'2/10000 M','',110,''],[true,'2/200 G','',100,''],
                        [true,'2/170 G','',100,''],[true,'2/300 M','',120,''],[true,'CFC-8"','',4,''],[true,'LFC-8"','',4,''],[true,'CINC','',5,''] ,[true,'Others','','1',''],
                        [true,'2/130M','',85,'']
                        ];
  articlesdata:any=[
                        [true,'2/180 M','',70,''],[true,'3/135 M','',70,''],[true,'2/800 M','',110,''], [true,'2/10000 M','',110,''],[true,'2/200 G','',100,''],
                        [true,'2/170 G','',100,''],[true,'2/300 M','',120,''],[true,'CFC-8"','',4,''],[true,'LFC-8"','',4,''],[true,'CINC','',5,''] ,[true,'Others','','1',''],
                        [true,'2/130M','',85,'']
                        ];

  maindata1:any=[
                        [true,'2/180 M','',70,''],[true,'3/135 M','',70,''],[true,'2/800 M','',110,''], [true,'2/10000 M','',110,''],[true,'2/200 G','',100,''],
                        [true,'2/170 G','',100,''],[true,'2/300 M','',120,''],[true,'CFC-8"','',4,''],[true,'LFC-8"','',4,''],[true,'CINC','',5,''] ,[true,'Others','','1',''],
                        [true,'2/130M','',85,'']
                        ];
  articlesdata1:any=[
                        [true,'2/180 M','',70,''],[true,'3/135 M','',70,''],[true,'2/800 M','',110,''], [true,'2/10000 M','',110,''],[true,'2/200 G','',100,''],
                        [true,'2/170 G','',100,''],[true,'2/300 M','',120,''],[true,'CFC-8"','',4,''],[true,'LFC-8"','',4,''],[true,'CINC','',5,''] ,[true,'Others','','1',''],
                        [true,'2/130M','',85,'']
                        ];
  
  articlesktl:any=[
                        [true,'2/180 M','',70,''],[true,'3/135 M','',70,''],[true,'2/800 M','',110,''], [true,'2/10000 M','',110,''],[true,'2/200 G','',100,''],
                        [true,'2/170 G','',100,''],[true,'2/300 M','',120,''],[true,'CFC-8"','',4,''],[true,'LFC-8"','',4,''],[true,'CINC','',5,''] ,[true,'Others','','1',''],
                        [true,'2/130M','',85,'']
                        ];
  mode:any;
  clientname:any;
  
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
    consumptionDataArr:any=[];
    articlesdataDb:any=[]; brandArrDb:any=[];
    constructor(private modalController: ModalController, public toastCtrl: ToastController, private navParams:NavParams, private file: File, private camera: Camera, private androidPermissions: AndroidPermissions
    ) { 
      this.mode=this.navParams.get('value');
      //if(this.mode=='1') {
        this.brandArr.push({ "value" : "KTL", "name" : "KTL" });
        this.brands = this.brandArr[0].value;
      //} else {
        this.consumptionDataArr = this.navParams.get("consumptionDataArr");
        console.log("this.maindata1==",this.maindata1);
        if(this.consumptionDataArr.length != 0) {
          //this.maindata=this.consumptionDataArr;
            for(let i=0; i<this.consumptionDataArr.length; i++) {
              this.brandArrDb.push({value:this.consumptionDataArr[i].brand_name, name:this.consumptionDataArr[i].brand_name});
              this.data1.push({ branch_name: this.consumptionDataArr[i].brand_name, name: this.consumptionDataArr[i].article_name, qty: this.consumptionDataArr[i].qty, itemvalue: (this.consumptionDataArr[i].price/this.consumptionDataArr[i].qty), price: this.consumptionDataArr[i].price });
            }
            //this.brands = this.brandArr[0].value;
            //console.log("==this.brands==",this.brands);
            console.log("==this.brandArr1==",this.brandArr1);
            this.articlesdataDb = this.consumptionDataArr
              .filter((item: any) => this.brands1 === item.brand_name)
              .map((item: any) => [true, item.article_name, '', item.price, '']);
            //this.articlesdata.push(...this.articlesdataDb);
            console.log("this.maindata1==",this.maindata1);
            this.brandArr1 = [{ "name": "Coats", "value": "Coats" },{ "name": "Vardhman", "value": "Vardhman" },{ "name": "Pasupati", "value": "Pasupati" },{ "name": "TIL", "value": "TIL" },{ "name": "Perfect", "value": "Perfect" },{ "name": "YKK", "value": "YKK" },{ "name": "Gill", "value": "Gill" },{ "name": "TEX", "value": "TEX" },{ "name": "Unorganized", "value": "Unorganized" }];
            // this.brandArr.push(...this.brandArrDb);
        } else {
          this.articlesdata1=this.maindata1;
          this.brandArr1 = [{ "name": "Coats", "value": "Coats" },{ "name": "Vardhman", "value": "Vardhman" },{ "name": "Pasupati", "value": "Pasupati" },{ "name": "TIL", "value": "TIL" },{ "name": "Perfect", "value": "Perfect" },{ "name": "YKK", "value": "YKK" },{ "name": "Gill", "value": "Gill" },{ "name": "TEX", "value": "TEX" },{ "name": "Unorganized", "value": "Unorganized" }];
        }
      //}
    }
  
    onBrandChange(event:any) {
      console.log("=event==",(event));
      console.log("=event==",(event.detail.value));
        // if(this.mode=='0') {
        //   this.articlesdata = this.maindata
        //       .filter((item: any) => (event.detail.value) === item.brand_name)
        //       .map((item: any) => [true, item.article_name, '', item.price, '']);
        //     console.log("this.maindata==",this.maindata);
        // }
    }

    onBrandChange1(event:any) {
      console.log("=event==",(event));
      console.log("=event==",(event.detail.value));
        // if(this.mode=='0') {
        //   this.articlesdata = this.maindata
        //       .filter((item: any) => (event.detail.value) === item.brand_name)
        //       .map((item: any) => [true, item.article_name, '', item.price, '']);
        //     console.log("this.maindata==",this.maindata);
        // }
    }

    ngOnInit() {
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
  
  // calculate(index:any) {
  //   console.log("articlesdata==",this.articlesdata);
  //   let tval=0;
  //   if(this.articlesdata[index][0]==true && this.articlesdata[index][2]!='') {
  //     this.articlesdata[index][4]=parseInt(this.articlesdata[index][2]) * parseInt(this.articlesdata[index][3]); 
  //   }
  //   for(var i = 0; i < this.articlesdata.length; i++) {
  //     tval+= parseInt(this.articlesdata[i][4]);
  //   }
  //   this.GT=tval;
  // }

calculate(index: number) {
  console.log("articlesdata==", this.articlesdata);
  let tval = 0;

  const item = this.articlesdata[index];

  if (item[0] === true && item[2] !== '' && !isNaN(parseInt(item[2])) && !isNaN(parseInt(item[3]))) {
    item[4] = parseInt(item[2]) * parseInt(item[3]);
  }

  for (let i = 0; i < this.articlesdata.length; i++) {
    const total = parseInt(this.articlesdata[i][4]);
    if (!isNaN(total)) {
      tval += total;
    }
  }

  this.GT = tval;
}


  // calculate1(index:any) {
  //   console.log("articlesdata1==",this.articlesdata1);
  //   let tval=0;
  //   if(this.articlesdata1[index][0]==true && this.articlesdata1[index][2]!='') {
  //     this.articlesdata1[index][4]=parseInt(this.articlesdata1[index][2]) * parseInt(this.articlesdata1[index][3]); 
  //   }
  //   for(var i = 0; i < this.articlesdata1.length; i++) {
  //     tval+= parseInt(this.articlesdata1[i][4]);
  //   }
  //   this.GT1=tval;
  // }

calculate1(index: number) {
  console.log("articlesdata1==", this.articlesdata1);
  let tval = 0;

  const item = this.articlesdata1[index];

  if (item[0] === true && item[2] !== '' && !isNaN(parseInt(item[2])) && !isNaN(parseInt(item[3]))) {
    item[4] = parseInt(item[2]) * parseInt(item[3]);
  }

  for (let i = 0; i < this.articlesdata1.length; i++) {
    const total = parseInt(this.articlesdata1[i][4]);
    if (!isNaN(total)) {
      tval += total;
    }
  }

  this.GT1 = tval;
}


  calculatektl(index:any) {
    let tval=0;
    if(this.articlesktl[index][0]==true && this.articlesktl[index][2]!='') {
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

  addDrtr() {
    if (this.brands=="" || this.brands==null) {
      this.presentToast("Please check sold Brands", 4000, "bottom");
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
    console.log("=this.articlesdata=",this.articlesdata);
    for(var i = 0; i < this.articlesdata.length; i++) {
      if(this.articlesdata[i][0]==true && this.articlesdata[i][2]!='') {
        let dataval : DataItem = {branch_name:this.brands,name:this.articlesdata[i][1],qty:this.articlesdata[i][2],itemvalue:this.articlesdata[i][3],price:this.articlesdata[i][4]}
        this.data.push(dataval);
      }
    }
   
    this.articlesdata=null;
    this.articlesdata=this.maindata;
    this.brands=''; this.GT=''; this.imgBlob='';
      if(this.mode=='0') {
        // this.brands = this.brandArr[0].value;
        //     console.log("==this.brands==",this.brands);
        //     console.log("==this.brandArr==",this.brandArr);
        //     this.articlesdata = this.maindata
        //       .filter((item: any) => this.brands === item.brand_name)
        //       .map((item: any) => [true, item.article_name, '', item.price, '']);
        //     console.log("this.maindata==",this.maindata);
        this.articlesdata.push(...this.articlesdataDb);
      }
  }
  

  addDrtr1() {
    if (this.brands1=="" || this.brands1==null) {
      this.presentToast("Please check cons Brands", 4000, "bottom");
      return;
    }
    console.log("=this.articlesdata1=",this.articlesdata1);
    for(var i = 0; i < this.articlesdata1.length; i++) {
      if(this.articlesdata1[i][0]==true && this.articlesdata1[i][2]!='') {
        let dataval : DataItem = {branch_name:this.brands1,name:this.articlesdata1[i][1],qty:this.articlesdata1[i][2],itemvalue:this.articlesdata1[i][3],price:this.articlesdata1[i][4]}
        this.data1.push(dataval);
      }
    }
   
    this.articlesdata1=null;
    this.articlesdata1=this.maindata;
    this.brands1=''; this.GT1=''; this.imgBlob='';
    this.articlesdata.push(...this.articlesdataDb);
  }

    async postData() {
      for(var i = 0; i < this.articlesktl.length; i++) {
        if(this.articlesktl[i][0]==true && this.articlesktl[i][2]!=''){
          let dataval : DataItem = {branch_name:'KTL',name:this.articlesktl[i][1],qty:this.articlesktl[i][2],itemvalue:this.articlesktl[i][3],price:this.articlesktl[i][4]}
          this.data.push(dataval);
        }
      }
      //let lastdata={file:this.imgBlob,data:this.data,'comment':this.itemvalue,'consumption':this.qty,'dealer':this.dealername}
      // let data={zip:this.zip,thread:this.thread,collection:this.paymentcollected,issue:this.currentissue,remarks:this.remarks,clientname:this.clientname,id:this.id}
      await this.modalController.dismiss({ data:this.data, data1:this.data1 });
    }
  
    delItem(i:any) {
      this.data.splice(i, 1);
    }

    delItem1(i:any) {
      this.data1.splice(i, 1);
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