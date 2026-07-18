import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, Platform, NavController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-setclient',
  templateUrl: './setclient.page.html',
  styleUrls: ['./setclient.page.scss'],
  standalone: false,
})
export class SetclientPage implements OnInit {
  userid: any;
  clientslist: any;
  isLoading = false;
  url = environment.SERVER_URL;
  data: any;
  manager_type: any;
  search: any;
  isSearch: boolean = false;
  clientslistManager: any;
  constructor(public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    private platform: Platform,
    private router: Router,
    public str: Storage,
    private route: ActivatedRoute) {
    this.str.get('id').then((value) => {
      this.userid = value;
      this.getClientList(value);
    });

    this.route.queryParams.subscribe(params => {

      if (params && params['special']) {
        this.data = JSON.parse(params['special']);
        console.log("DetailsDescCheck");
        this.manager_type = this.data.manager_type;
        if (this.manager_type == 'Branch Manager' || this.manager_type == 'Manager') {
          this.isSearch = true;
        }
        console.log(this.manager_type)
      }
    });
  }

  updateSearchResults(event:any) {

    console.log("Running udatasearchresult");

    this.presentLoading();
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let datap = { managerid: this.userid, search_key: this.search, manager_type: this.manager_type };

    this.http.post(this.url + 'search-appuser', datap, { headers: headers }).subscribe((data: any) => {
      console.log(data.result);
      this.dismiss();
      this.clientslistManager = data.result;

    },
      (error) => {
        this.dismiss();
        this.presentToast('There is error. Please check intenet connection.', 4000, "middle");
      }

    )
  }

  getClientList(appid:any) {
    console.log("Running getclientlist");
    this.presentLoading();
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let datap = { staff_id: appid, };

    this.http.post(this.url + 'employee-client-list', datap, { headers: headers }).subscribe((data: any) => {
      console.log(data);
      this.dismiss();
      console.log(data);
      this.clientslist = data.data;

    },
      (error) => {
        this.dismiss();
        this.presentToast('There is error. Please check intenet connection.', 4000, "middle");
      }

    )
  }


  radioTimeChange(event:any) {
    this.str.set('client_id', event.detail.value);
    this.
    router.navigateByUrl('/clientdashboard', { skipLocationChange: true });
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
  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
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
  ngOnInit() {
  }
}
