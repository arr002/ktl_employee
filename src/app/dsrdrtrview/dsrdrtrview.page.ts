import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dsrdrtrview',
  templateUrl: './dsrdrtrview.page.html',
  styleUrls: ['./dsrdrtrview.page.scss'],
  standalone: false,
})
export class DsrdrtrviewPage implements OnInit {
  url = environment.SERVER_URL;
  managers: any;
  userid: any;
  type: any;
  Managerstates: any;

  constructor(public loadingCtrl: LoadingController,
    private http: HttpClient,
    public str: Storage,
    private navctrl: NavController,
    public router: Router) {
    this.str.get('id').then((value) => {
      this.userid = value;
      this.checkUserType(this.userid);
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

  navigateTo(statecode:any) {
    // alert(statecode);

    let navigationExtras: NavigationExtras = {

      queryParams: {
        special: JSON.stringify({ type: this.type, userid: this.userid, statecode: statecode })
      }
    }
    this.router.navigate(['branchmanagers'], navigationExtras);

  }

  checkUserType(userid:any) {
    // alert(this.userid)
    console.log("get Managers branch");
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    const formData = new FormData();
    formData.append('managerid', userid);

    this.http.post(this.url + 'get-manager-branch', formData, { headers: headers }).subscribe((data: any) => {

      this.type = data.type;
      var disable = false;
      if (this.type == "Sales Person") {
        // alert("sales");
        let navigationExtras: NavigationExtras = {


          queryParams: {
            special: JSON.stringify({userid: this.userid,  disable: disable })
          }
        }
        this.router.navigate(['dsr-drtr-report'], navigationExtras);

        // alert("Branch Manager");

      }
      if (this.type == "Branch Manager") {
        // this.navctrl.navigateForward('salespersonlist');
        disable = true;

        let navigationExtras: NavigationExtras = {


          queryParams: {
            special: JSON.stringify({ managerid: this.userid, disable: disable })
          }
        }
        this.router.navigate(['salespersonlist'], navigationExtras);

        // alert("Branch Manager");

      }

      if (this.type == "Manager") {

        this.Managerstates = data.data;
        // alert(this.Managerstates);

      }


      console.log(data);
      this.managers = data.managerData;
    })

  }


}
