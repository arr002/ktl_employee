import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-newsetstate',
  templateUrl: './newsetstate.page.html',
  styleUrls: ['./newsetstate.page.scss'],
  standalone: false,
})
export class NewsetstatePage implements OnInit {
  userid: any;
  url = environment.SERVER_URL;
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

  Managerstatess:any=[]; searchTerm:any="";
  setFilterTown() {
    this.Managerstates = this.Managerstatess.filter((towns: any) => {
      return towns.branch_name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
    });
  }

  navigateTo(statecode:any) {
    // alert(statecode);

    let navigationExtras: NavigationExtras = {

      queryParams: {
        special: JSON.stringify({ statecode: statecode })
      }
    }
    this.router.navigate(['inventory'], navigationExtras);

  }


  checkUserType(userid:any) {
    // alert(this.userid)
    console.log("get Managers branch");
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    const formData = new FormData();
    formData.append('managerid', '27');

    this.http.post(this.url + 'get-manager-branch', formData, { headers: headers }).subscribe((data: any) => {

      this.type = data.type;
      var disable = false;

      if (this.type == "Manager") {

        this.Managerstates = data.data;
         this.Managerstatess = data.data;
        // alert(this.Managerstates);

      }


      console.log(data);

    })

  }

}
