import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-branchmanagers',
  templateUrl: './branchmanagers.page.html',
  styleUrls: ['./branchmanagers.page.scss'],
  standalone: false,
})
export class BranchmanagersPage implements OnInit {
  data: any;
  usertype: any;
  userid: any;
  statecode: any;
  url = environment.SERVER_URL;
  branchManagerList: any;

  constructor(private route: ActivatedRoute,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public str: Storage,
    private navctrl: NavController,
    public router: Router) {
    this.route.queryParams.subscribe(params => {
      console.log("==params==",params);
      if (params && params['special']) {
        this.data = JSON.parse(params['special']);
        console.log("DetailsDescCheck");
        this.usertype = this.data.type;  // type of manager
        this.statecode = this.data.statecode; // selected state by manager 
        this.userid = this.data.userid;//user id of manager
        // alert(this.usertype);
        this.getBranchManager(this.statecode);

      }
    });
  }

  ngOnInit() {
  }

  navigateTo(managerid:any){
    
    let navigationExtras: NavigationExtras = {

      queryParams: {
        special: JSON.stringify({ managerid: managerid })
      }
    }
    this.router.navigate(['salespersonlist'], navigationExtras);
    
  }

  getBranchManager(statecode:any) {
    // alert(this.userid)
    console.log("get sales person");
    let headers = new HttpHeaders();

    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    const formData = new FormData();
    formData.append('branchcode', statecode);  

    this.http.post(this.url + 'get-branch-manager', formData, { headers: headers }).subscribe((data: any) => {
      this.branchManagerList = data.branchmanager;
      console.log(this.branchManagerList);     
    })

  }

}
