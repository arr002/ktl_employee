import { Component, OnInit } from '@angular/core';
import { MenuController, ToastController, Platform, NavController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';
//import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
//import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-markattendance',
  templateUrl: './markattendance.page.html',
  styleUrls: ['./markattendance.page.scss'],
  standalone: false,
})
export class MarkattendancePage implements OnInit {

 
	userid: any;
	clientslist: any;
	isLoading = false;
	url = environment.SERVER_URL;
	constructor(public menuCtrl: MenuController, public loadingCtrl: LoadingController, private http: HttpClient, public toastCtrl: ToastController, private platform: Platform, private router: Router, public str: Storage
		//, private photoViewer: PhotoViewer
	//	, private lightbox: Lightbox
	) {
		this.str.get('id').then((value) => {
			this.userid = value;
			this.getClientList(value);
		});
	}

	getClientList(appid:any) {
		this.presentLoading();
		let headers = new HttpHeaders();
		headers.append("Accept", 'application/json');
		headers.append('Content-Type', 'application/json');
		let datap = { staffid: appid };

		this.http.post(this.url + 'attendance-list', datap, { headers: headers }).subscribe((data: any) => {
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
	openImg(urlimg:any) {
		//this.photoViewer.show(urlimg);
		//this.lightbox.open([urlimg], 0);
	}
	mark(id:any, attend:any) {

		this.presentLoading();
		let headers = new HttpHeaders();
		headers.append("Accept", 'application/json');
		headers.append('Content-Type', 'application/json');
		let datap = { rowid: id, status: attend };
		this.http.post(this.url + 'mark-attendance', datap, { headers: headers }).subscribe((data: any) => {
			console.log(data);
			this.dismiss();
			this.getClientList(this.userid);

		},
			(error) => {
				console.log(error);
				this.dismiss();
				this.presentToast('There is error. Please check intenet connection.', 4000, "middle");
			}

		)






	}
	radioTimeChange(event:any) {
		this.str.set('buddy_id', event.detail.value);
		this.router.navigateByUrl('/buddyattendance', { skipLocationChange: true });
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
