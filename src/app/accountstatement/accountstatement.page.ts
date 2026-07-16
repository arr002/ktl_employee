import { Component, OnInit } from '@angular/core';
import { MenuController,ToastController,Platform, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController,ModalController,PopoverController  } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { HttpClient , HttpHeaders } from '@angular/common/http';
//import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx'
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
//import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
//import { File } from '@awesome-cordova-plugins/file/ngx';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-accountstatement',
  templateUrl: './accountstatement.page.html',
  styleUrls: ['./accountstatement.page.scss'],
  standalone: false,
})
export class AccountstatementPage implements OnInit {

  userid:any;
  sdate:any;
  sactual:any;
  edate:any;
  eactual:any;
  caltype:any;
  statement:any;
  isLoading = false;
  datalength:any=-1;
  selectedOption:any;
  openingbalance:any;
  closingbalnace:any;
  recon:any=false;
  company:any;
  contactname:any;
  mobile:any;
  masterid:any;
  balance:any;
  pdf:any;
  
   url=environment.SERVER_URL;
    constructor(public menuCtrl: MenuController,public loadingCtrl: LoadingController,private  http:HttpClient,public toastCtrl: ToastController,private platform: Platform, private router: Router,public str:Storage,private transfer: FileTransfer, private file: File) {
      this.str.get('client_id').then((value) => { 
                    this.userid=value;
                        this.callContact(value);                  
                  });
  
                 
  
     }
  
   radioTimeChange(event:any) {
    this.selectedOption = event.detail.value;
    this.getStatement();
   
    }
  
  
  
  
  
  callContact(userid:any){
  
    let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
          let datap= { client_id: userid};
          
        this.http.post(this.url + 'get-callprofile' ,datap,{headers:headers}).subscribe((data:any)=>{
        
        if(data.status){
          this.company=data.company;
          this.contactname=data.contactname;
          this.mobile=data.mobile;
        this.masterid=data.masterid;
        }
      
        })
  }
    getStatement(){
        this.presentLoading();
        let headers = new HttpHeaders(); 
      headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json' );
      let datap= { client_id: this.userid,month:this.selectedOption};
      console.log(datap);
       this.http.post(this.url +'get-account-statement',datap,{headers:headers}).subscribe((data:any)=>{
       this.dismiss();
       
       console.log(data);
       this.datalength=data.data.length;
       
      this.statement=data.data;
      
      this.openingbalance=this.statement[0].opening_balance;
      this.closingbalnace=this.statement[this.statement.length-1].closing_balance;
      if(data.success==false)     {
           
        
         }
      
    
      });
    }
  
    downloadPDF(){
      this.presentLoading();
        let headers = new HttpHeaders(); 
      headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json' );
      let datap= { client_id: this.userid,month:this.selectedOption};
      console.log(datap);
       this.http.post(this.url +'get-account-statement-pdf',datap,{headers:headers}).subscribe((data:any)=>{
       console.log(data);
       this.dismiss();
     
      this.pdf=data.pdf;
          if(data.status)     {
           window.open(data.pdf);
        
         }
      
    
      });
  
  
    }
  
  
  
  async  presentLoading() {
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
  
      presentToast(msg:any,durat:any,pos:any) {
        let toast = this.toastCtrl.create({
            message: msg,
            duration: durat,
            position:pos
          }).then((toastData)=>{
            console.log(toastData);
            toastData.present();
          });
      //await this.toastCtrl.create({ message:msg, duration:durat, position:pos }).present();
    }
    ngOnInit() {
    }
}
