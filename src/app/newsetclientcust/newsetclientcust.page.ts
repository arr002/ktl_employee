import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LoadingController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-newsetclientcust',
  templateUrl: './newsetclientcust.page.html',
  styleUrls: ['./newsetclientcust.page.scss'],
  standalone: false,
})
export class NewsetclientcustPage implements OnInit {
  data: any;
  statecode: any;
  url = environment.SERVER_URL;
  customerList: any;
  isLoadMore: boolean = false;
  id: any = 0;
  loading: any = null;
  message: any = '';
  success: any;
  user_id: any;
  isLoading = false;
  search: any;

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private loadCtrl: LoadingController,
    public str: Storage,
    private router:Router,
    public toastCtrl:ToastController) {

    this.route.queryParams.subscribe(params => {

      if (params && params['special']) {
        this.data = JSON.parse(params['special']);
        console.log("DetailsDescCheck");
        this.statecode = this.data.statecode;  // state code

        this.getCustomers(this.statecode, this.id);
      }
    });
  }

  
  updateSearchResults(event:any){

this.getCustomers(this.statecode,this.id);
console.log(event);
  }

  


  async presentLoading() {
    this.isLoading = true;
    return await this.loadCtrl.create({
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

  // updateSearchResults(event) {

  //   console.log("Running udatasearchresult");

  //   this.presentLoading();
  //   let headers = new HttpHeaders();
  //   headers.append("Accept", 'application/json');
  //   headers.append('Content-Type', 'application/json');
  //   let datap = { managerid: this.userid, search_key: this.search };

  //   this.http.post(this.url + 'search-appuser', datap, { headers: headers }).subscribe((data: any) => {
  //     console.log(data.result);
  //     this.dismiss();
  //     this.customerList = data.result;

  //   },
  //     (error) => {
  //       this.dismiss();
  //       this.presentToast('There is error. Please check intenet connection.', 4000, "middle");
  //     }

  //   )
  // }

  testcancel(){

    // alert("cancel")
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
  getCustomers(statecode:any, id:any, load:any=null) {
    // alert(this.customerList);
    // alert("load data" + load);
   

    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    const formData = new FormData();
    formData.append('branchcode', statecode);
    formData.append('id', this.id);
    formData.append('name', this.search);    

    if (!load) {
      this.presentLoading();
    }

    this.isLoadMore = true;
    this.http.post(this.url + 'get-branch-client-pagewise', formData, { headers: headers }).subscribe((res: any) => {
      console.log('===getCustomers===', res);

      if (!id) {
        this.customerList = [];       
      }

      
    if(this.search==''){
      // alert("empty")
      this.customerList=[];
      this.id=0;
    }
      this.addInList(res.client);
      if (load) {
        load.target.complete();
      } else {
        this.dismiss();
      }
      this.isLoadMore = false;
    }, err => {
      console.log('===getCustomerList Error===', err);
      this.isLoadMore = false;
      this.dismiss();
      if (load) {
        load.target.complete();
      } else {
        this.dismiss();
      }
    });


  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadCtrl.dismiss().then(() => console.log('dismissed'));
  }

  radioTimeChange(event:any) {
    this.str.set('client_id', event.detail.value);
    this.
    router.navigateByUrl('/clientdashboard', { skipLocationChange: true });
  }


  loadMoreData(event:any) {

    console.log(event);

    if (!this.isLoadMore && this.id) {
      // alert("u r in loadmore if")
      // alert(this.id);
      this.getCustomers(this.statecode, this.id, event);
     
    } else {
      // alert("u r in loadmore else")
      event.target.complete();
    }

    if(this.search==''){

      this.customerList=[];
      this.id=0;
    }
   

  }

  addInList(data:any) {
    let len = data.length;
    console.log("before customer list"+this.customerList)
    
    for (let i = 0; i < len; i++) {

      this.customerList.push(data[i]);
      this.id = parseInt(data[i].id);
    }
    if(this.search==''){

      this.customerList=[];
      this.id=0;
    }
    console.log("After customer list"+this.customerList)

  }


  ngOnInit() {
  }
}
