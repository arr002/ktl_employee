import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastController, NavController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-opn-clsdailyseal',
  templateUrl: './opn-clsdailyseal.page.html',
  styleUrls: ['./opn-clsdailyseal.page.scss'],
  standalone: false,
})
export class OpnClsdailysealPage implements OnInit {

  Closing: any;
  Opening: any;
  sealstatus: any="Closing";
  branches: any = [];
  branch:any;

  url = environment.SERVER_URL;
  sealdata: any;
  userid: any;
  sealtimestamp: any;
  cntcadmnsts: boolean=false;
  branchstatus:Boolean=false;

  constructor(private http: HttpClient,
    public toastCtrl: ToastController,
    public str: Storage,
    public navctrl: NavController,
    public router: Router,
    public loadingCtrl: LoadingController) {

    this.str.get('id').then((value) => {
      this.userid = value;
      // this.getSealStatus();
      // this.checkSeal();

    });
    this.callBranch();

  }

  ngOnInit() {
  }

  async presentLoading() {

    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 1000
    });

    await loading.present();

  }

  callBranch() {


    this.presentLoading();
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let datap = { id: '' };
    this.http.get(this.url + 'get-branch', { headers: headers }).subscribe((data: any) => {

      this.branches = data.data;


    })

  }

  checkSeal() {

 
    console.log("seal clicked");

    var Difference_In_Time = new Date(this.sealtimestamp).getTime() - new Date().getTime();
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    
    if ((Difference_In_Days) > 1 || (Difference_In_Days)< -1) {

      this.cntcadmnsts=true;
      alert("please contact admin");
      
     
    } else {
      // here if the seal status is opening then we are closing and vice versa
      if (this.sealstatus == "Opening") {
        this.sealstatus = "Closing";
      } else
       {
        this.sealstatus = "Opening";
      }
          
      let navigationExtras: NavigationExtras = {

        queryParams: {
          special: JSON.stringify({ "sealstatus": this.sealstatus ,"branchname":this.branch})
        }
      }
      this.router.navigate(['dailyreport'], navigationExtras);
      this.getSealStatus();


    }


  }

  getSealStatus() {
  this.branchstatus=true;
  this.cntcadmnsts=false;
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    // alert(this.branch);
    // "userid": this.userid

    this.http.post(this.url + 'get-seal-status', { "branch": this.branch }, { headers: headers }).subscribe((data: any) => {
      console.log("u r in get seal");
      console.log(data.data);
      this.sealstatus = data.data.seal;
      this.sealtimestamp = data.data.time_stamp;
        
      // if(data == null || data=="undefined" || data==""){
      //   alert("u r in null");
      //   this.sealtimestamp="Closing";
      // }
     


    }, error => {
      this.presentToast('Please check your internet Connection.', 3000, 'middle');
    });
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

  }

}
