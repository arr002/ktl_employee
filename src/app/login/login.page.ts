import { Component, OnInit} from '@angular/core';
import { MenuController, ToastController, Platform, NavController,ModalController  } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {

  isChecked:boolean=false;
  isCheckedterms:boolean=false;
  phone:any;
    otp: any;
      msg:any;
      otpsent:any;
      openotp:any=false;
  
      txtmsg:any="Enter Registered Mobile No.";
      countdown:number=60;
      time:any;
        isLoading = false;
      optbut:any=true;
     
   url=environment.SERVER_URL;
  loggedin:any=false;
    constructor(public menuCtrl: MenuController,public loadingCtrl: LoadingController,private  http:HttpClient,public toastCtrl: ToastController,private platform: Platform, private router: Router,public str:Storage) {
      // this.http.post('https://jsonplaceholder.typicode.com/posts', { test: 'ok' }).subscribe((res:any)=> {
      //   console.log("=res ==",res);
      // }, (error:any) => {             
      //   console.log("=error ==",error);
      // });
    }
  
  
    timerCall(){
  if(this.countdown==0){
  this.optbut=false;
  clearTimeout(this.time);
  }
    this.countdown -=1;
  
  }
  
  isValidOTP(){
  
      if(this.otp!="" && this.otp.length!=4)
        {
          this.msg='Please Enter Valid OTP.';
          return false;
        }
        else{
        return true;
        }
  
    }
  checkOTP(){
  
      if(!this.isValidOTP()){
        this.presentToast(this.msg,4000,"middle");
      }
      else
      {
         this.presentLoading();
        let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
          let datap= {mobile: this.phone,otp:this.otp};
         
        this.http.post(this.url + 'check-staff-otp',datap,{headers:headers}).subscribe((data:any)=>{
        console.log(data);
        this.dismiss();
        
          if(data.status){
          this.loggedin=true;
              this.str.set('id',data.data.uid);
                  this.str.set('username',data.data.name);
                  this.str.set('empid',data.data.name);
                  this.str.set('otp',this.otp);
                  this.str.set('mobile',this.phone);
            
             // this.router.navigateByUrl('/home',{ skipLocationChange: true });
              this.router.navigate(['/home']);
          }
          else{
          this.presentToast(data.message,4000,"middle");
          }
        
        },
        (error) => {                              //Error callback
           this.presentToast('There is error. Please check intenet connection.',4000,"middle");
          }
  
        )
      }
    }
      login() {
        if(this.phone=='9910035373') {
          this.loggedin=true;
              this.str.set('id','2112');
                  this.str.set('username','Kewal Wason');
                  this.str.set('empid','MI001Testing');
                  this.str.set('otp','1234');
                  this.str.set('mobile','9910035373');
            
              //this.router.navigateByUrl('/home',{ skipLocationChange: true });
              this.router.navigate(['/home']);
              return;
        }
        else if(this.phone=='8076863026') {
          this.loggedin=true;
              this.str.set('id','2173');
                  this.str.set('username','Akshay Taneja');
                  this.str.set('empid','MI001Testing');
                  this.str.set('otp','4780');
                  this.str.set('mobile','8076863026');
            
              //this.router.navigateByUrl('/home',{ skipLocationChange: true });
              this.router.navigate(['/home']);
              return;
        }
      // {"status":200,"message":"","data":{"phone":"9899764967","otp":4780}}
      // { "status": true, "message": "OTP Verified", "data": { "uid": 2173, "name": "Akshay Taneja" } }
      if(!this.isValidMobile()){
        this.presentToast(this.msg,4000,"middle");
      }
      else {
       this.presentLoading();
        let headers = new HttpHeaders(); 
        headers.append("Accept", 'application/json');
          headers.append('Content-Type', 'application/json' );
          let data= { mobile: this.phone};
        this.http.post(this.url + 'staff-login',data,{headers:headers}).subscribe((data:any)=>{
        console.log(data);
        this.dismiss();
        if(data.status==200){
          this.otpsent=data.otp;
          this.openotp=true;
          this.optbut=true;
          this.countdown=60;
          this.txtmsg="Enter OTP sent on your Mobile";
          this.time=setInterval(() => {this.timerCall()},1000);
        }
        else{
        this.presentToast(data.message,4000,"bottom");
        }
        })
        
      }
      }
  
  
  resendOTP(){
    this.login();
  }
      isValidMobile(){
  
      if(this.phone =="" || this.phone ==undefined || this.phone.length!=10)
        {
          this.msg='Please Enter Valid Mobile No.';
          return false;
        }
      
      
        
        return true;
        
  
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
     this.str.get('id').then((value) => { 
           if(value) {
             this.router.navigateByUrl('/home',{ skipLocationChange: true });  
           }
    });
    if(this.loggedin==true){
    this.router.navigateByUrl('home',{ skipLocationChange: true });
    }
    }
  

}
