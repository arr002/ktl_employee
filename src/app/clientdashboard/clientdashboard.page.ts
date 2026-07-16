import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, Platform, NavController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-clientdashboard',
  templateUrl: './clientdashboard.page.html',
  styleUrls: ['./clientdashboard.page.scss'],
  standalone: false,
})
export class ClientdashboardPage implements OnInit {

  banners: any = [];

	bal: any = 0.00;
	clientid: any;
	bdate: any;
	company: any;
	contactname: any;
	mobile: any;
	masterid: any;


	url = environment.SERVER_URL;
	isLoading = false;
	mycreditcount: any = 0;
	mybillscount: any = 0;
	

	constructor(public menuCtrl: MenuController, public loadingCtrl: LoadingController, private http: HttpClient, public toastCtrl: ToastController, private platform: Platform, private router: Router, public str: Storage) {

		this.str.get('client_id').then((value) => {

			this.clientid = value;
			this.getBalance(value);
			this.callContact(value);
		});
	}


	getBalance(userid:any) {
		let headers = new HttpHeaders();
		headers.append("Accept", 'application/json');
		headers.append('Content-Type', 'application/json');
		let datap = { client_id: userid };
		this.http.post(this.url + 'get-balance', datap, { headers: headers }).subscribe((data: any) => {

			if (data.success) {
				this.bal = data.balance;
				this.bdate = data.baldate;
			}

		})
	}

	callContact(userid:any) {

		let headers = new HttpHeaders();
		headers.append("Accept", 'application/json');
		headers.append('Content-Type', 'application/json');
		let datap = { client_id: userid };

		this.http.post(this.url + 'get-callprofile', datap, { headers: headers }).subscribe((data: any) => {

			if (data.status) {
				this.company = data.company;
				this.contactname = data.contactname;
				this.mobile = data.mobile;
				this.masterid = data.masterid;

				this.str.set('company', data.company);
				this.str.set('masterid', data.masterid);

			}

		})
	}
	ngOnInit() {
	}
}
