import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, Platform, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-notices',
  templateUrl: './notices.page.html',
  styleUrls: ['./notices.page.scss'],
  standalone: false,
})
export class NoticesPage implements OnInit {

	offers: any = [];
	userid: any;
	url = environment.SERVER_URL;
	constructor(public menuCtrl: MenuController,
		public loadingCtrl: LoadingController,
		private http: HttpClient,
		public str: Storage,
		public toastCtrl: ToastController,
		private platform: Platform,
		private router: Router,
		private navctrl: NavController) {

		this.str.get('id').then((value) => {
			this.userid = value;
			this.callCirculars(value);

		});


	}

	callCirculars(value:any) {
		this.presentLoading();
		let headers = new HttpHeaders();
		headers.append("Accept", 'application/json');
		headers.append('Content-Type', 'application/json');
		let datap = { staffid: value };
		this.http.post(this.url + 'get-circular', datap, { headers: headers }).subscribe((data: any) => {
			console.log("notic call circular")
			console.log(data)

			if (data.status) {
				this.offers = data.data;

			} else {
				this.navctrl.navigateRoot('home');

			}
		})

	}

	accept(circularid:any) {

		this.presentLoading();
		let headers = new HttpHeaders();
		headers.append("Accept", 'application/json');
		headers.append('Content-Type', 'application/json');
		let datap = { uid: this.userid, circular_id: circularid };
		console.log("accept test")
		this.http.post(this.url + 'accept-circular', datap, { headers: headers }).subscribe((data: any) => {

			this.callCirculars(this.userid)
			console.log("accept test")
			console.log(data)
			this.presentToast(data.status, 2000, "middle");
		})

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

	async presentLoading() {

		const loading = await this.loadingCtrl.create({
			message: 'Please wait...',
			duration: 1000
		});

		await loading.present();

	}

	ngOnInit() {
	}

}
