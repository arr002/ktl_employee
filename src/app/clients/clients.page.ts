import { Component, OnInit} from '@angular/core';
import { MenuController,ToastController,Platform, NavController,ModalController  } from '@ionic/angular';
import {ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
  standalone: false,
})
export class ClientsPage implements OnInit {

  userid:any;
  head:any;
  header:any
  
   customers:any;
    url=environment.SERVER_URL;
    selectedRadioGroup:any;
    constructor(public menuCtrl: MenuController,public loadingCtrl: LoadingController,private  http:HttpClient,public toastCtrl: ToastController,private platform: Platform, private router: Router,public route: ActivatedRoute,public str:Storage,public popoverController:ModalController ) { 
           
  
    this.str.get('id').then((value) => { 
                    this.userid=value;
                this.clients(value); 
  
                  });
  
    }
  
     clients(id:any){
  
        let headers = new HttpHeaders(); 
          headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
         
          let datap = {employee_id:id};
          
          this.http.post(this.url + 'employee-customer-details' ,datap,{headers:headers}).subscribe((data:any)=>{
         
           // if(data.status){
          
              this.customers=data.data;
              
              
            //}else{
              //this.presentToast(res.message,3000,'middle')
            //}
          }, err => { JSON.stringify(err) })
     }
  radioGroupChange(event:any) {
  
    
   
    this.popoverController.dismiss({
        'client': this.selectedRadioGroup
      });
    }
  
  
  
  ngOnInit() {
  }

}
