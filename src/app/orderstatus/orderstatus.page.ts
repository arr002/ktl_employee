import { Component, OnInit} from '@angular/core';
import { MenuController,ToastController,Platform, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController,ModalController,PopoverController  } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { HttpClient , HttpHeaders } from '@angular/common/http';
//import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

import { environment } from '../../environments/environment';
//import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-orderstatus',
  templateUrl: './orderstatus.page.html',
  styleUrls: ['./orderstatus.page.scss'],
  standalone: false,
})
export class OrderstatusPage implements OnInit {

  userid:any;
  orders:any;
  masterid:any;
 company:any;
  url=environment.SERVER_URL;
  isLoading = false;
   constructor(public loadingCtrl: LoadingController,private  http:HttpClient,public toastCtrl: ToastController,private platform: Platform, private router: Router,public popoverController:PopoverController,public str:Storage
    //,private photoViewer: PhotoViewer
   //  , private lightbox: Lightbox
   ) {
    this.str.get('client_id').then((value) => {
    
                   this.userid=value;
           this.getOrder();
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
 
 openImg(image:any, orderno:any ){
   let urlimg="http://manage.ktl.in/uploads/order/" + orderno + "/" + image;
   let imageObj = [{
     src: urlimg,
     thumb: urlimg,
     caption: ''
   }];
   //this.lightbox.open(imageObj, 0);
   //this.photoViewer.show(urlimg);
   }
 
 
 getOrder(){
   
   let headers = new HttpHeaders(); 
       headers.append("Accept", 'application/json');
         headers.append('Content-Type', 'application/json' );
         let datap= { client_id: this.userid};
         
       this.http.post(this.url + 'get-order' ,datap,{headers:headers}).subscribe((data:any)=>{
         this.dismiss();
         
       if(data.status=="success"){
 
         this.orders=data.data;
         
       }
     
       })
 }
 
 async dismiss() {
     this.isLoading = false;
     return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
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
