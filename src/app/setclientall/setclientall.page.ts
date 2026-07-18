import { Component, OnInit} from '@angular/core';
import { MenuController, ToastController, Platform, NavController,ModalController  } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-setclientall',
  templateUrl: './setclientall.page.html',
  styleUrls: ['./setclientall.page.scss'],
  standalone: false,
})
export class SetclientallPage implements OnInit {
  isSearch:boolean = false;
  userid:any;
clientslist:any;
mainlist:any;
search:string='';
isLoading = false;
 url=environment.SERVER_URL;
 constructor(public menuCtrl: MenuController,public loadingCtrl: LoadingController,private  http:HttpClient,public toastCtrl: ToastController,private platform: Platform, private router: Router,public str:Storage) { 
 			this.str.get('id').then((value) => { 
           		this.userid=value;
            	//this.getClientList(); 
            });
 }

getClientList(){
  if(this.search.toString().length > 2){
	 this.presentLoading();
		let headers = new HttpHeaders(); 
			headers.append("Accept", 'application/json');
    		headers.append('Content-Type', 'application/json' );
		    let datap= {search: this.search};
		   
			this.http.post(this.url + 'employee-client-list-all',datap,{headers:headers}).subscribe((data:any)=>{
			console.log(data);
			this.dismiss();
			console.log(data);
				this.clientslist=data.data;
				this.mainlist=data.data;
				this.isSearch=true;
			},
			(error) => { 
			this.dismiss();
         this.presentToast('There is error. Please check intenet connection.',4000,"middle");
        }

			)
    }
}

 updateSearchResults(keyCode:any){

 this.getClientList();
 //this.clientslist = this.mainlist.filter((filerdata) => {
  //    return filerdata.title.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
  //  });

 }

 radioTimeChange(event:any) {
  this.str.set('client_id', event.detail.value);
 this.router.navigateByUrl('/clientdashboard',{ skipLocationChange: true });
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
