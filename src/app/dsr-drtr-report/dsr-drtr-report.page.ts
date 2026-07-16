import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, MenuController, NavController, Platform, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-dsr-drtr-report',
  templateUrl: './dsr-drtr-report.page.html',
  styleUrls: ['./dsr-drtr-report.page.scss'],
  standalone: false,
})
export class DsrDrtrReportPage implements OnInit {
  userid: any;
  clientslist: any;
  isLoading = false;
  datesearch: any;
  caldate: number = 0;
  disable: any;

  url = environment.SERVER_URL;
  month: any;
  months: any = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  data: any;

  constructor(public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    private platform: Platform,
    private router: Router,
    public str: Storage,
    private route: ActivatedRoute) {

    this.route.queryParams.subscribe(params => {

      if (params && params['special']) {
        this.data = JSON.parse(params['special']);
        console.log("DetailsDescCheck");        
        this.disable = this.data.disable;
        this.userid = this.data.userid;
        // alert(this.disable);       
         
      }

      this.str.get('id').then((value) => {
        // this.userid = value;
        this.getdsrstatus();
        var d = new Date();
        this.month = this.months[d.getMonth()];
      });
      this.datesearch = new Date();
    });

  }

  ngOnInit() {
  }

  cal(val:any) {
    if (val == 0) {
      this.caldate = 0;
    }
    else {
      this.caldate = this.caldate + val;
    }
    let date = new Date();
    date.setMonth(date.getMonth() + this.caldate);

    this.month = this.months[date.getMonth()];

    this.getdsrstatus();
  }

  async presentLoading() {
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

  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }

  getdsrstatus() {
    this.presentLoading();
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    let datap = { userid: this.userid, month: this.caldate }; //use this format to get month wise data
    // let datap = { userid: this.userid};
    console.log(datap);
    this.http.post(this.url + 'get-drtr-datewise', datap, { headers: headers }).subscribe((data: any) => {
      console.log(data);
      this.dismiss();

      this.clientslist = data.data;

    },
      (error) => {
        this.dismiss();
        this.presentToast('There is error. Please check intenet connection.', 4000, "middle");
      }

    )
  }

}
