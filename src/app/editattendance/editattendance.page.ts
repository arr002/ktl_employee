import { Component, OnInit} from '@angular/core';
import { MenuController, ToastController, Platform, NavController,ModalController  } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-editattendance',
  templateUrl: './editattendance.page.html',
  styleUrls: ['./editattendance.page.scss'],
  standalone: false,
})
export class EditattendancePage implements OnInit {

 
  userid:any;
  clientslist:any;
  isLoading = false;
  datesearch:any;
   url=environment.SERVER_URL;
   constructor(public menuCtrl: MenuController,public loadingCtrl: LoadingController,private  http:HttpClient,public toastCtrl: ToastController,private platform: Platform, private router: Router,public str:Storage) { 
      this.str.get('id').then((value) => { 
               this.userid=value;
                
          });
          this.datesearch=new Date();
   }
  
  getClientList(){
     this.presentLoading();
      let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
          let datap= {staffid: this.userid,date:this.datesearch};
         
        this.http.post(this.url + 'edit-attendance-list',datap,{headers:headers}).subscribe((data:any)=>{
        console.log(data);
        this.dismiss();
        console.log(data);
          this.clientslist=data.data;
        
        },
        (error) => { 
        this.dismiss();
           this.presentToast('There is error. Please check intenet connection.',4000,"middle");
          }
  
        )
  }
  getAttendance(){
    
    this.getClientList(); 
  }
  mark(id:any,attend:any){
    
     this.presentLoading();
      let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
          let datap= {rowid: id,status:attend};
         this.http.post(this.url + 'mark-attendance',datap,{headers:headers}).subscribe((data:any)=>{
        console.log(data);
        this.dismiss();
        this.getClientList(); 
        
        },
        (error) => { 
        console.log(error);
        this.dismiss();
           this.presentToast('There is error. Please check intenet connection.',4000,"middle");
          }
  
        )
  
  
  
  
  
  
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
