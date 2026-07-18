import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, Platform, NavController, PopoverController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { environment } from '../../environments/environment';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
//import { Market } from '@awesome-cordova-plugins/market/ngx';
import { PopupPage } from '../popup/popup.page';

@Component({
  selector: 'app-allattendance',
  templateUrl: './allattendance.page.html',
  styleUrls: ['./allattendance.page.scss'],
  standalone: false,
})
export class AllattendancePage implements OnInit {
  userid: any;
  url = environment.SERVER_URL;
  homescreendata: any;
  version: any; 
  name: any;
  image: any;
  mobile: any;
  empmanager: any;
  empcode: any;
  phone: any;
  department: any;
  designation: any;
  branchname: any;
  dob: any;
  doj: any;
  address: any;
  client: any;
  isLoading = false;
  manager_type: any;  
  buddyattendacne: any;

  constructor(public menuCtrl: MenuController,
    private navctrl: NavController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    private platform: Platform, private router: Router, public str: Storage, public popoverController: PopoverController, private file: File, private camera: Camera, private androidPermissions: AndroidPermissions
   // , private market: Market
  )  {

    this.str.get('id').then((value) => {
      this.userid = value;   
      this.getProfile(this.userid);  
      this.getHomescreen(this.userid);  // Looping screen through api

    });
  }

  ngOnInit() {
  }

  checkmanagerid() {

    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    let datap = { managerid: this.userid };
    this.http.post(this.url + 'check-manager', datap, { headers: headers }).subscribe((data: any) => {
      if (data.status) {
        this.navctrl.navigateRoot('viewattendance');

      } else {
        this.presentToast("Not Authenticated User", 3000, 'middle')
      }
    }, err => { this.presentToast('Please check your internet Connection.', 3000, 'middle') })



  }

  presentToast(msg: any, durat: any, pos: any) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: durat,
      position: pos
    }).then((toastData) => {
      console.log(toastData);
      toastData.present();
    });
    //await this.toastCtrl.create({ message:msg, duration:durat, position:pos }).present();
  }

  getProfile(userid:any) {
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    let datap = { staff_id: userid };
    this.http.post(this.url + 'get-staff', datap, { headers: headers }).subscribe((data: any) => {
     
      console.log("buddy")
      console.log(data)
      console.log("buddy")
      if (data.status) {

        this.name = data.data.name;
        this.empcode = data.data.employee_code;
        this.phone = data.data.phone;
        this.address = data.data.address;
        this.department = data.data.department;
        this.designation = data.data.designation;
        this.branchname = data.data.branch_name;
        this.dob = data.data.dob;
        this.doj = data.data.doj;
        this.empmanager = data.data.emp_manager;
        this.manager_type = data.manager_type;
        this.buddyattendacne=data.buddy_attendance;

        if (data.image_path == '') {
          this.image = 'assets/profile.jpg';
        }
        else {
          this.image = data.image_path;
        }

      } else {
        //this.presentToast(res.message,3000,'middle')
      }
    }, err => { this.presentToast('Please check your internet Connection.', 3000, 'middle') })
  }

  getHomescreen(value:any) {

    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    let datap = { staffid: value };

    this.http.post(this.url + 'get-homescreen', datap, { headers: headers }).subscribe((data: any) => {
      console.log("department11");

      if (data.status) {

        this.homescreendata = data.result;
        console.log(this.homescreendata)
      } else {

      }
    }, err => { this.presentToast('Please check your internet Connection.', 3000, 'middle') })
  }


}
