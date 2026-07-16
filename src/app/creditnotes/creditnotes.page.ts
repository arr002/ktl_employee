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
  selector: 'app-creditnotes',
  templateUrl: './creditnotes.page.html',
  styleUrls: ['./creditnotes.page.scss'],
  standalone: false,
})
export class CreditnotesPage implements OnInit {
  userid:any;
  sdate:any;
sactual:any;
edate:any;
eactual:any;
caltype:any;
selectedOption:any;
datalength:any=-1;
statement:any;
isLoading = false;
 company:any;
 masterid:any;
 url=environment.SERVER_URL;
  constructor(public menuCtrl: MenuController,public loadingCtrl: LoadingController,private  http:HttpClient,public toastCtrl: ToastController,private platform: Platform, private router: Router,public modalController:ModalController,public popoverController:PopoverController,public str:Storage,private transfer: FileTransfer, private file: File,private androidPermissions: AndroidPermissions  ) {
	 this.str.get('client_id').then((value) => { 
              		this.userid=value;
                        this.updateCreditNotes(value);
                        this.Contact(value); 
                });
   }

Contact(userid:any){

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

 radioTimeChange(event:any) {
  this.selectedOption = event.detail.value;
 	this.getStatement();
  }


updateCreditNotes(userid:any){

  let headers = new HttpHeaders(); 
  headers.append("Accept", 'application/json');
  headers.append('Content-Type', 'application/json' );
  let datap= { client_id: userid};
  this.http.post(this.url +'update-credit-note-status',datap,{headers:headers}).subscribe((data:any)=>
     {})
}
 getStatement(){
		this.presentLoading();
  		let headers = new HttpHeaders(); 
		headers.append("Accept", 'application/json');
    	headers.append('Content-Type', 'application/json' );
		let datap= { client_id: this.userid,month:this.selectedOption};
		console.log(datap);
 		this.http.post(this.url +'get-credit-note',datap,{headers:headers}).subscribe((data:any)=>{
 		this.dismiss();
 		console.log(data);
 		this.datalength=data.data.length;
		this.statement=data.data;
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

 		this.http.post(this.url +'get-credit-note-pdf',datap,{headers:headers}).subscribe((data:any)=>{
 		this.dismiss();

 		console.log(data);
		//this.statement=data.data;
		    if(data.status)     {
     		window.open(data.pdf);
			
    	 }
		
	
    });


  }



download(){
return;
	// if(!this.selectedOption){
	// this.presentToast("Please select Date Option",2000,"middle");
	// return;
	// }
	// if(this.selectedOption==0){
	// 	let pday = new Date(this.sdate);
	// 	let lday = new Date(this.edate);
	// 	if(pday>lday){
	// 		this.presentToast("Please select end date greater than start date",2000,"middle");
	// 		return;
	// 	}
	// 	else{
	// 		this.androidPermissions.hasPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
  //   .then(status => {
	// 	      if (status.hasPermission) {
	// 	        this.downloadFile();
	// 	      } 
	// 	      else {
	// 	        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
	// 	          .then(status => {
	// 	            if(status.hasPermission) {
	// 	              this.downloadFile();
	// 	            }
	// 	          });
	// 		      }
	// 		    });
	// 	}
	// }
}
downloadFile(){
			const fileTransfer: FileTransferObject = this.transfer.create();
		    //let datap= { client_id: this.userid,selectedoption:id};
		    let filename=Math.floor(Math.random() * 10000); 
			const url = this.url + 'download-creditnotes/' + this.userid + '/' + this.selectedOption + '/' + this.sdate + '/' + this.edate;
 			 fileTransfer.download(url, this.file.externalRootDirectory + '/Download/'  + filename + '.pdf').then((entry) => {
 			 this.presentToast('download complete: ' + entry.toURL(),3000,"bottom");
    				
  			}, (error:any) => {
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
