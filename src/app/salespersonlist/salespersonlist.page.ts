import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-salespersonlist',
  templateUrl: './salespersonlist.page.html',
  styleUrls: ['./salespersonlist.page.scss'],
  standalone: false,
})
export class SalespersonlistPage implements OnInit {

  data: any;
  usertype: any;
  managerid: any;
  url = environment.SERVER_URL;
  salesPersonList: any;
  disable: any;

  constructor(public loadingCtrl: LoadingController,
    private http: HttpClient,
    public str: Storage,
    private navctrl: NavController,
    public router:Router,
    private route: ActivatedRoute) {

      this.route.queryParams.subscribe(params => {

        if (params && params['special']) {
          this.data = JSON.parse(params['special']);
          console.log("DetailsDescCheck");
         
          this.managerid = this.data.managerid;   
          this.disable=this.data.disable;
          // alert(this.disable);
          // alert("salesperson"+this.managerid)     
        
          this.getSalesman(this.managerid );
  
        }
      });
     }

  ngOnInit() {
  }

  navigateTo(salesmanid:any) {
    // alert("salesmanid"+salesmanid);

    let navigationExtras: NavigationExtras = {

      queryParams: {
        special: JSON.stringify({ userid : salesmanid })
      }
    }
    this.router.navigate(['dsr-drtr-report'], navigationExtras);

  }


  getSalesman(managerid:any) {
    // alert(managerid)
    console.log("get sales person");
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    const formData = new FormData();
    formData.append('usertype', "Branch Manager");
    // formData.append('branch', statecode);
    formData.append('appuserid', managerid);

    this.http.post(this.url + 'get-sales-person', formData, { headers: headers }).subscribe((data: any) => {

      this.salesPersonList = data.salesperson;
      console.log(data);
    
    })
  }

}
