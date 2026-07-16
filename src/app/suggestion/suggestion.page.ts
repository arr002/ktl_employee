import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-suggestion',
  templateUrl: './suggestion.page.html',
  styleUrls: ['./suggestion.page.scss'],
  standalone: false,
})
export class SuggestionPage implements OnInit {

  subject: any;
  complaint: any;
  userid: any;
  url = environment.SERVER_URL;
  constructor(public loadingCtrl: LoadingController,
    private http: HttpClient,
    public str: Storage,
    public toastCtrl: ToastController) {

    this.str.get('id').then((value) => {
      this.userid = value;
      
    });

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

  send() {
    console.log(this.userid)
    console.log(this.subject);
    console.log(this.complaint);
    this.presentLoading();
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let datap = { client_id: this.userid,subject: this.subject,complaint:this.complaint};
    this.http.post(this.url + 'staff-complaint', datap, { headers: headers }).subscribe((data: any) => {
      console.log("suggestion call circular")
      console.log(data)

      if (data.success) {
        this.presentToast(data.message, 2000, "middle");
      } 
    })

  }

}
