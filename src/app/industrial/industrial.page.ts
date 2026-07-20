import { Component, OnInit } from '@angular/core';

import { MenuController, ToastController, Platform, NavController, NavParams,ModalController, PopoverController, ActionSheetController } from '@ionic/angular';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { DsrpopupPage } from '../dsrpopup/dsrpopup.page';
import { TownPage } from '../town/town.page';
import { CustomerPage } from '../customer/customer.page';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-industrial',
  templateUrl: './industrial.page.html',
  styleUrls: ['./industrial.page.scss'],
  standalone: false,
})
export class IndustrialPage implements OnInit {

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
townname:any='';
customername:any='';
customerid:any='';
currentissue:any;
url=environment.SERVER_URL;

  constructor(private modalCtrl: ModalController,private popoverController: PopoverController,private navctrl: NavController,private  http:HttpClient,public str:Storage,   public toastCtrl: ToastController,) {

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
  const modal = await this.modalCtrl.create({
    component: TownPage,
    componentProps: {
      title: "Select Town",
      items: this.towndatalist || [],
    }
  });
   
   await modal.present();
   
   const { data } = await modal.onDidDismiss();
   
   if (data && data.selectedItem) {
    console.log(data);
    this.townselected = data.selectedItem;
    this.townname = data.selectedItem;
    this.getCustomerList();
   }
 }
async openPopOverCustomer() {
  const modal = await this.modalCtrl.create({
    component: CustomerPage,
    componentProps: {
      title: "Select Customer",
      items: this.customerdatalist || [],
    }
  });
   
   await modal.present();
   
   const { data } = await modal.onDidDismiss();
   
   if (data && data.client_name) {
    console.log(data);
    this.clientselected = data;
    this.customername = data.client_name;
    this.customerid = data.id;
   }
 }

addDSR(){


if(this.customername==''){
   this.presentToast("Please select customer", 4000, "bottom");
   return;
}
if(this.townname==''){
   this.presentToast("Please select townname", 4000, "bottom");
   return;
}
let datadd={id:this.customerid,clientname:this.customername,townname:this.townname,activity:this.activity,issue:this.currentissue,remarks:this.remarks};

this.dataadded.push(datadd);

console.log(this.dataadded);
this.customername="";
this.townname="";
this.remarks="";
this.currentissue="";

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
       
        let datap = {appuser_id:this.userid,town:this.townname};
        console.log(datap);
        this.http.post(this.url + 'getcustomersdata' ,datap,{headers:headers}).subscribe((data:any)=>{
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
  uploadDSR(){


      if(this.fieldtype=="InField" && (this.customerdatalist=='' || this.customerdatalist==null )){

         this.presentToast("Please enter customer details", 4000, "bottom");
         return;
      }

        let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json' );
       
        let datap = {appuser_id:this.userid,date:this.dateSelect,type:this.fieldtype,data:this.dataadded};
       
        this.http.post(this.url + 'adddsrindustrial' ,datap,{headers:headers}).subscribe((data:any)=>{
       this.presentToast(data.message, 4000, "bottom");
         // this.customerdatalist=data.data;
           // this.townlist=true;
           this.navctrl.navigateRoot('home');
        }, err => {  })


  }

}
