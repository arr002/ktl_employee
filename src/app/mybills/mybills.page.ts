import { Component, OnInit} from '@angular/core';
import { MenuController,ToastController,Platform, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController,ModalController,PopoverController  } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx'
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-mybills',
  templateUrl: './mybills.page.html',
  styleUrls: ['./mybills.page.scss'],
  standalone: false,
})
export class MybillsPage implements OnInit {
  isLoading = false;
  userid:any;
 bills:any;
 datalength:any=-1;
   url=environment.SERVER_URL;
 
  current_month_puchase:any;
  current_month_payment:any;
  current_quart_purchase:any;
  current_quart_payment:any;
  last_quart_purchase:any;
  last_quart_payment:any;
  year_puchase:any;
  year_payment:any;
 masterid:any;
 company:any;
 
   constructor(public menuCtrl: MenuController,public loadingCtrl: LoadingController,private  http:HttpClient,public toastCtrl: ToastController,private platform: Platform, private router: Router,public modalController:ModalController,public popoverController:PopoverController,public str:Storage,private transfer: FileTransfer, private file: File,private androidPermissions: AndroidPermissions  ) {
    this.str.get('client_id').then((value) => { 
                   this.userid=value;
                      this.getBills(value); 
                      this.getSummary(value);
                      this.updateMyBills(value);  
                       this.callContact(value);                 
                 });
 
 
    }
 
 callContact(userid:any){
 
   let headers = new HttpHeaders(); 
       headers.append("Accept", 'application/json');
         headers.append('Content-Type', 'application/json' );
         let datap= { client_id: userid};
         
       this.http.post(this.url + 'get-callprofile' ,datap,{headers:headers}).subscribe((data:any)=>{
     
       if(data.status){
         this.company=data.company;
        
       this.masterid=data.masterid;
       }
     
       })
 }
 getSummary(id:any){
 //this.presentLoading();
   let headers = new HttpHeaders(); 
       headers.append("Accept", 'application/json');
         headers.append('Content-Type', 'application/json' );
         let datap= { client_id: id};
    
       this.http.post(this.url +'my-bill',datap,{headers:headers}).subscribe((data:any)=>{
    // this.dismiss();
 
     this.current_month_puchase=data.current_month_puchase;
     this.current_month_payment=data.current_month_payment;
     this.current_quart_purchase=data.current_quart_purchase;
     this.current_quart_payment=data.current_quart_payment;
     this.last_quart_purchase=data.last_quart_purchase;
     this.last_quart_payment=data.last_quart_payment;
     this.year_puchase=data.year_puchase;
     this.year_payment=data.year_payment;
     
     
     
   
     }, err => { });
 
   }
 updateMyBills(userid:any){
 
   let headers = new HttpHeaders(); 
       headers.append("Accept", 'application/json');
         headers.append('Content-Type', 'application/json' );
         let datap= { client_id: userid};
        this.http.post(this.url +'update-sales-status',datap,{headers:headers}).subscribe((data:any)=>
      { 
      
     
       }, err => {   })
 }
 
 
   getBills(id:any){
 this.presentLoading();
   let headers = new HttpHeaders(); 
       headers.append("Accept", 'application/json');
         headers.append('Content-Type', 'application/json' );
         let datap= { client_id: id};
       console.log(datap);
        this.http.post(this.url +'get-my-bills',datap,{headers:headers}).subscribe((data:any)=>{
     this.dismiss();
  console.log(data);
      if(data.success)
      {
     
      this.datalength=data.data.length;
     this.bills=data.data;
      }
     
   
     });
 
   }
 
 
 
 download(path:any,filename:any){
 
 window.open(path);
   return;
       this.androidPermissions.hasPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
     .then(status => {
           if (status.hasPermission) {
             this.downloadFile(path,filename);
           } 
           else {
             this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
               .then(status => {
                 if(status.hasPermission) {
                   this.downloadFile(path,filename);
                 }
               });
             }
           });
     }
 
 downloadFile(path:any,filename:any){
 window.open(path);
       const fileTransfer: FileTransferObject = this.transfer.create();
       const url = this.url + 'download-billsstatement/' + this.userid;
         fileTransfer.download(path, this.file.externalRootDirectory + '/Download/'  + filename + '.pdf').then((entry) => {
         this.presentToast('download complete: ' + entry.toURL(),3000,"bottom");
             
         }, (error) => {
         this.presentToast('download error ',3000,"bottom");
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
