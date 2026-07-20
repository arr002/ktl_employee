import { Component, OnInit } from '@angular/core';

import { MenuController, ToastController, Platform, NavController, NavParams,ModalController, PopoverController, ActionSheetController, AlertController } from '@ionic/angular';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { DsrpopupPage } from '../dsrpopup/dsrpopup.page';
import { TownPage } from '../town/town.page';
import { CustomerPage } from '../customer/customer.page';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dsrupload',
  templateUrl: './dsrupload.page.html',
  styleUrls: ['./dsrupload.page.scss'],
  standalone: false,
})
export class DsruploadPage implements OnInit {


  towndata:boolean=false;
  townlist:boolean=false;
  townselected:any;
  clientselected:any;
  towndatalist:any;
  customerdatalist:any;
  fieldtype:any;
  activity:any='Visit';
  userid:any;
  dateSelect:any;
  daterequest:any;
  dataadded:any[]=[];
  reqdate=false;
  datetime:any;
  mindate: any;
  username:any;
  maxdate:any;
  remarks:any='';
  townname:any;
  customername:any;
  url=environment.SERVER_URL;
  recdata={
      id:'',
      zip:'',
      thread:'',
      collection:'',
      issue:'',
      remarks:'',
      clientname:'',
  
     }
  
    constructor(private modalCtrl: ModalController,private popoverController: PopoverController,private navctrl: NavController,private  http:HttpClient,public str:Storage,   public toastCtrl: ToastController, public alertController: AlertController) { 
  
  this.str.get('id').then((value) => { 
                    this.userid=value;
        
                  this.getTowns();
                  this.getDateRequest();
  
                  });
  
  this.str.get('username').then((value) => { 
                    this.username=value;
        
                  
                  });
   
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
      this.getCustomerList();
       // this.form.patchValue({ bank: data?.selectedItem });
       // this.dataReturned = data?.selectedItem;
       // this.memo = this?.dataReturned + "/" + this.memo;
     }
   }
  async openPopOverCustomer() {
    const popover = await this.popoverController.create({
      component: CustomerPage,
        
      translucent: false,
      componentProps: {
        title: "Bank Account",
        items: this.customerdatalist,
      }
    });
     
     await popover.present();
     
     // Listen for onDidDismiss
     const { data } = await popover.onDidDismiss();
     
     if (data !== null) {
      console.log(data);
      this.clientselected=data;
   
     this.customername=data.client_name;
      this.openModal();
       // this.form.patchValue({ bank: data?.selectedItem });
       // this.dataReturned = data?.selectedItem;
       // this.memo = this?.dataReturned + "/" + this.memo;
     }
   }
  
  
  getDateRequest(){
     let headers = new HttpHeaders(); 
          headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
         
          let datap = {appuser_id:this.userid,typerequest:'DSR'};
          console.log(datap);
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
  
    openCal(){
  
  this.reqdate=true;
  
    }
  
    dateChangeDrop(){}
  
    async openModal() {
     
    console.log("clien ====" + this.clientselected.client_name);
     
      const modal = await this.modalCtrl.create({
        component: DsrpopupPage,
        cssClass: 'dsrmodal',
        componentProps: { value: this.clientselected.client_name ,mode:'add',id:this.clientselected.id,activity:this.activity }
        
      });
       modal.onDidDismiss()
        .then((data) => {
          console.log(data);
         this.dataadded.push(data.data);
      });
      modal.present();
    }
    getSealStatus(){
  
      if (this.fieldtype=='InField' || this.fieldtype=='InFieldandOffice'){
  
        this.towndata=true;
      }
      else{
       this.towndata=false; 
       this.townlist=false;
      }
    }
    getTownlist(){
  
        this.townlist=true;
      
    }
    delItem(i:any){
      
      this.dataadded.splice(i, 1);
    }
    editItem(i:any){
      this.openModalEdit(i);
    }
  
   async openModalEdit(i:any) {
  
      const modal = await this.modalCtrl.create({
        component: DsrpopupPage,
        cssClass: 'dsrmodal',
        componentProps: { data: this.dataadded[i],id:i,mode:'edit',activity:this.activity },
        backdropDismiss:false
      });
       modal.onDidDismiss()
        .then((data) => {
  
        
          this.recdata=data.data;
          let recid : number = parseInt(this.recdata.id);
          this.dataadded[recid as number]=this.recdata;
          
      });
      modal.present();
    }
  
  
  
    getTowns(){
  
      let headers = new HttpHeaders(); 
          headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
         console.log(this.userid);
          let datap = {appuser_id:this.userid};
          this.http.post(this.url + 'getcustomertown' ,datap,{headers:headers}).subscribe((data:any)=>{
          console.log(data);
            this.towndatalist=data.data;
              
          }, err => {  })
    }
  
  
    getCustomerList(){
  
      let headers = new HttpHeaders(); 
          headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
         
          let datap = {appuser_id:this.userid,town:this.townselected};
          console.log(datap);
          this.http.post(this.url + 'get-customers-data' ,datap,{headers:headers}).subscribe((data:any)=>{
          console.log(data.data);
            this.customerdatalist=data.data;
              this.townlist=true;
          }, err => {  })
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
    async uploadDSR() {
      if(this.fieldtype=="InField" && (this.customerdatalist=='' || this.customerdatalist==null )){
         this.presentToast("Please enter customer details", 4000, "bottom");
         return;
      }

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
              this.proceedUploadDSR();
            }
          }
        ]
      });

      await alert.present();
    }

    proceedUploadDSR() {
          let headers = new HttpHeaders(); 
          headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
         
          let datap = {appuser_id:this.userid,date:this.dateSelect,type:this.fieldtype,data:this.dataadded,remarks:this.remarks};
          console.log(datap);
          this.http.post(this.url + 'adddsrdata' ,datap,{headers:headers}).subscribe((data:any)=>{
         this.presentToast(data.message, 4000, "bottom");
           // this.customerdatalist=data.data;
             // this.townlist=true;
             this.navctrl.navigateRoot('home');
          }, err => {  })
    }

}
