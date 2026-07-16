import { Component, OnInit } from '@angular/core';

import { MenuController, ToastController, Platform, NavController, NavParams,ModalController, ActionSheetController } from '@ionic/angular';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { DsrpopupPage } from '../dsrpopup/dsrpopup.page';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-mytada',
  templateUrl: './mytada.page.html',
  styleUrls: ['./mytada.page.scss'],
  standalone: false,
})
export class MytadaPage implements OnInit {
  dateSelect:any;
  year:any;
  month:any;
  userid:any;
  daterequest:any;
  url = environment.SERVER_URL;
    constructor(private modalCtrl: ModalController,private  http:HttpClient,public str:Storage,   public toastCtrl: ToastController,) { 
        this.str.get('id').then((value) => { this.userid=value;});
        }
  
    ngOnInit() {
    }
  
  updateMyDate($event:any) {
    const d = new Date($event);
   
    this.year=d.getFullYear();
    this.month=d.getMonth() +1;
    this.getTADA();
  }
  
  getTADA(){
  
     let headers = new HttpHeaders(); 
          headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
         
          let datap = {appuser_id:this.userid,year:this.year,month:this.month};
          console.log(datap);
          this.http.post(this.url + 'getmytada' ,datap,{headers:headers}).subscribe((data:any)=>{
          console.log(data);
            this.daterequest=data.data;
              
          }, err => {  })
  }
  
  getStatus(val:any){
  
    if(val==0){
   return 'Proc';
    }
    else if(val==1){
  return 'Acc';
    }
    else{
  return 'App';
    }
  }

}
