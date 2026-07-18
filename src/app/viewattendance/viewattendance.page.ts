import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
//import { computeStackId } from '@ionic/angular/directives/navigation/stack-utils';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-viewattendance',
  templateUrl: './viewattendance.page.html',
  styleUrls: ['./viewattendance.page.scss'],
  standalone: false,
})
export class ViewattendancePage implements OnInit {
  managers: any = [];
  url = environment.SERVER_URL;
  manager: any;
  date: any;
  userid: any;
  teamattendacne: any;
  constructor(public loadingCtrl: LoadingController,
    public str: Storage,
    private http: HttpClient) {
    this.str.get('id').then((value) => {
      this.userid = value;

    });
    this.getManagers();
  }

  ngOnInit() {
  }

  viewattendace() {
    console.log("u r in attendacnce");
    this.presentLoading();
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    const formData = new FormData();
    console.log(this.manager);
    formData.append('managerid', this.manager);
    formData.append('date', this.date);
    formData.append('staffid', this.userid);
    console.log(this.manager)

    this.http.post(this.url + 'attendance-all-list', formData, { headers: headers }).subscribe((data: any) => {
      

      this.teamattendacne = data.data;
      console.log(this.teamattendacne )
    })

  }

  getManagers() {
    console.log("get Managers")
    this.presentLoading();
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    this.http.get(this.url + 'get-manager', { headers: headers }).subscribe((data: any) => {
      console.log(data)

      this.managers = data.managerData;
    })

  }

  async presentLoading() {

    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 1000
    });

    await loading.present();

  }

}
