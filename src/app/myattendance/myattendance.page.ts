import { Component, OnInit} from '@angular/core';
import { MenuController, ToastController, Platform, NavController,ModalController  } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-myattendance',
  templateUrl: './myattendance.page.html',
  styleUrls: ['./myattendance.page.scss'],
  standalone: false,
})
export class MyattendancePage implements OnInit {

  userid:any;
clientslist:any;
isLoading = false;
datesearch:any;
caldate:number=0;
 url=environment.SERVER_URL;
 month:any;
 months:any = ['January','February','March','April','May','June','July','August','September','October','November','December'];
 constructor(public menuCtrl: MenuController,public loadingCtrl: LoadingController,private  http:HttpClient,public toastCtrl: ToastController,private platform: Platform, private router: Router,public str:Storage) { 
 			this.str.get('id').then((value) => { 
           		this.userid=value;
            	this.getClientList();
            	var d = new Date();
            	this.month = this.months[d.getMonth()];

            });
             this.datesearch=new Date();
 }

getClientList(){
	 this.presentLoading();
		let headers = new HttpHeaders(); 
			headers.append("Accept", 'application/json');
    		headers.append('Content-Type', 'application/json' );
    		
		    let datap= {staffid: this.userid,date:this.caldate};
		   console.log(datap);
			this.http.post(this.url + 'get-attendance',datap,{headers:headers}).subscribe((data:any)=>{
			console.log(data);
			this.dismiss();
			console.log(data);
				this.clientslist=data.attendance;
			
			},
			(error) => { 
			this.dismiss();
         this.presentToast('There is error. Please check intenet connection.',4000,"middle");
        }

			)
}

cal(val:any){
if (val==0){
this.caldate=0;
}
else{
	this.caldate=this.caldate+val;
}
let date = new Date();
date.setMonth(date.getMonth() + this.caldate);

this.month = this.months[date.getMonth()];

this.getClientList(); 
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
