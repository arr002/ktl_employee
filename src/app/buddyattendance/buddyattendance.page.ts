import { Component, OnInit} from '@angular/core';
import { MenuController,ToastController,Platform, NavController,ModalController  } from '@ionic/angular';
import {ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import {File, IWriteOptions, FileEntry} from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { environment } from '../../environments/environment';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { ClientsPage } from '../clients/clients.page';

@Component({
  selector: 'app-buddyattendance',
  templateUrl: './buddyattendance.page.html',
  styleUrls: ['./buddyattendance.page.scss'],
  standalone: false,
})
export class BuddyattendancePage implements OnInit {

  version:any;
	
	userid:any;
  name:any;
  image:any;
  empcode:any;
  phone:any;
  department:any;
  designation:any;
  branchname:any;
  dob:any;
  doj:any;
  address:any;
  client:any;

lat:any;
long:any;
comment:any;
subject:any='';
  isLoading = false;
	slideOptsOne = {
	 initialSlide: 0,
	 slidesPerView: 1,
	 autoplay:true
	};


 optionsCamera: CameraOptions = {
    quality: 100,
    allowEdit : true,
    targetWidth: 800,
    cameraDirection:0,
    saveToPhotoAlbum: false,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.CAMERA
  };



	 options: CameraOptions = {
    quality: 100,
     targetWidth: 800,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  };

  url=environment.SERVER_URL;

  constructor(public menuCtrl: MenuController,public loadingCtrl: LoadingController,private  http:HttpClient,public toastCtrl: ToastController,private platform: Platform, private router: Router,public str:Storage,public popoverController:ModalController ,private file: File, private camera: Camera,private androidPermissions: AndroidPermissions,private geolocation: Geolocation) { 
  			
  		this.str.get('buddy_id').then((value) => { 
              		this.userid=value;
              this.getProfile(value); 

                });

              

            
  }

  optionSelected(){

  if (this.subject=='Reached Customer' || this.subject=='Going to Customer'){
  
   this.presentPop(this.userid);
  }
  }
async presentPop(id:any) {
  const popover = await this.popoverController.create({
    component: ClientsPage,
    cssClass: 'client-select-modal',
    componentProps: {head: 'Order Confirmation', header:'Order Uploaded Successfully.', userid: id} 
       
  });

popover.onDidDismiss()
    .then((result) => {
   // JSON.stringify(result['data']))
      
      this.client=result['data'].client;
    });

    return await popover.present();


  
}
getProfile(userid:any){
  let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json' );
       
        let datap = {staff_id:userid};
        this.http.post(this.url + 'get-staff' ,datap,{headers:headers}).subscribe((data:any)=>{
        
          if(data.status){
            this.name=data.data.name;
            this.empcode=data.data.employee_code;
        this.phone=data.data.phone;
        this.address=data.data.address;
        this.department=data.data.department;
        this.designation=data.data.designation;
        this.branchname=data.data.branch_name;
        this.dob=data.data.dob;
        this.doj=data.data.doj;
            if (data.image_path=='')
            {
            this.image='assets/profile.jpg';
            }
            else{
            //this.image="";
            this.image=data.image_path;
            }
            
          }else{
            //this.presentToast(res.message,3000,'middle')
          }
        }, err => {  })
}


readFile(file: any) {

	 this.presentLoading();
    const reader = new FileReader();
     
   // reader.onloadend = () => {
    //  const imgBlob = new Blob([reader.result], {
    //   type: file.type
    //  });
      
      let headers = new HttpHeaders(); 
	  headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json' );

      const formData = new FormData();
      formData.append('staff_id', this.userid);
       formData.append('lat',this.lat);
        formData.append('long',this.long);
         formData.append('position',this.subject);
        formData.append('client',this.client);
        formData.append('comment',this.comment);

   
       var fname= Math.floor(Math.random() * 100000); 
      formData.append('file', file );
    
      this.http.post(this.url + 'uploads-attendance-base', formData,{headers:headers}).subscribe((data:any)=>{
   
      if(data.status)
        console.log(data);
        this.client="";
        this.lat="";
        this.long="";
        this.comment="";
        this.subject="";
        this.dismiss();
   		//this.image=data.image;
        this.presentToast(data.message,4000,"bottom");
      },error => {
      
       this.presentToast('Please check your internet Connection.',3000,'middle')
      this.presentToast("Error uploading. Please try again.",4000,"bottom");
      //this.loader.dismiss();
      //this.toast.presentToast("Check internet connection");
    });
    //};
  //  reader.readAsArrayBuffer(file);
  }

readFileCamera(file: any) {

	 this.presentLoading();
    const reader = new FileReader();
     
    reader.onloadend = () => {
      const imgBlob = new Blob([reader.result as ArrayBuffer], {
        type: file.type
      });
       
      let headers = new HttpHeaders(); 
	  headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json' );

      const formData = new FormData();
      formData.append('staff_id', this.userid);
       formData.append('lat',this.lat);
        formData.append('long',this.long);
         formData.append('position',this.subject);
        formData.append('client',this.client);
        formData.append('comment',this.comment);
        
      formData.append('file', imgBlob, file.name);
    
      this.http.post(this.url + 'uploads-attendance', formData,{headers:headers}).subscribe((data:any)=>{
    
      if(data.status)
        console.log(data);
        this.client="";
        this.lat="";
        this.long="";
        this.comment="";
        this.subject="";
        this.dismiss();
   		//this.image=data.image;
        this.presentToast(data.message,4000,"bottom");
      },error => {
       this.presentToast('Please check your internet Connection.',3000,'middle')
      this.presentToast("Error uploading. Please try again.",4000,"bottom");
      //this.loader.dismiss();
      //this.toast.presentToast("Check internet connection");
    });
    };
    reader.readAsArrayBuffer(file);
  }



  takePictureFile() {
if(!this.subject){
 this.presentToast("Please select drop down option.",4000,"bottom");
return;
 }
    this.camera.getPicture(this.options).then((imageData:any) => {
   let base64Image = 'data:image/jpeg;base64,' + imageData;
this.readFile(base64Image);

    }, (err:any) => {
      // Handle error
    });
  }



   takePictureCamera() {
 if(!this.subject){
 this.presentToast("Please select drop down option.",4000,"bottom");
return;
 }
    this.camera.getPicture(this.optionsCamera).then((imageData:any) => {
      // this.file.resolveLocalFilesystemUrl(imageData).then((entry: FileEntry) => {
      //   entry.file(file => {
      //     console.log(file);
      //     this.readFileCamera(file);
      //   });
      // });
      this.file.resolveLocalFilesystemUrl(imageData).then((entry: any) => {
        if (entry.isFile) {
          const fileEntry = entry as FileEntry;
          fileEntry.file(file => {
            console.log('File object:', file);
            this.readFileCamera(file);
          }, error => {
            console.error('Error getting file:', error);
          });
        } else {
          console.error('Entry is not a file.');
        }
      }, error => {
        console.error('Error resolving file system URL', error);
      });
    }, (err) => {
      // Handle error
    });
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

  ngOnInit() {
	
	
  this.geolocation.getCurrentPosition().then((resp:any) => {
  this.lat=resp.coords.latitude;
  this.long=resp.coords.longitude;
	}).catch((error:any) => {
  this.presentToast("Please check your location is enabled.",4000,"bottom");
});


  }

  async getLocation(): Promise<boolean> {
    try {
      const locationStatus = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
      );
  
      if (!locationStatus.hasPermission) {
        const locationRequest = await this.androidPermissions.requestPermission(
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
        );
        if (!locationRequest.hasPermission) return false;
      }
      return true;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }


}
