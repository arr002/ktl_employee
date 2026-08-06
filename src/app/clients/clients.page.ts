import { Component, OnInit} from '@angular/core';
import { MenuController,ToastController,Platform, NavController,ModalController  } from '@ionic/angular';
import {ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
  standalone: false,
})
export class ClientsPage implements OnInit {

  userid:any;
  head:any;
  header:any
  
  customers:any[] = [];
  filteredCustomers:any[] = [];
  searchTerm = '';
  url=environment.SERVER_URL;
  selectedRadioGroup:any;
  isLoading = true;

  constructor(
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private http:HttpClient,
    public toastCtrl: ToastController,
    private platform: Platform,
    private router: Router,
    public route: ActivatedRoute,
    public str:Storage,
    public popoverController:ModalController
  ) {
    this.str.get('id').then((value) => {
      this.userid = this.userid || value;
      this.clients(this.userid);
    });
  }

  clients(id:any){
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    // get-customers-data — appuser_id only (no town)
    let datap = { appuser_id: id };

    this.http.post(this.url + 'get-customers-data', datap, {headers:headers}).subscribe((data:any)=>{
      this.customers = data && data.data ? data.data : [];
      this.filteredCustomers = this.customers.slice();
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
      this.customers = [];
      this.filteredCustomers = [];
      this.presentToast('Unable to load clients. Please check your internet connection.', 3000, 'bottom');
    })
  }

  clientLabel(prod: any): string {
    return (prod && (prod.client_name || prod.customer_name)) || 'Unknown client';
  }

  clientInitial(prod: any): string {
    const name = this.clientLabel(prod).trim();
    return name ? name.charAt(0) : '?';
  }

  setFilterClients() {
    const term = (this.searchTerm || '').toLowerCase().trim();
    if (!term) {
      this.filteredCustomers = (this.customers || []).slice();
      return;
    }
    this.filteredCustomers = (this.customers || []).filter((item: any) => {
      const name = String(item.client_name || item.customer_name || '').toLowerCase();
      const code = String(item.masterid || item.customer_code || '').toLowerCase();
      return name.indexOf(term) !== -1 || code.indexOf(term) !== -1;
    });
  }

  selectClient(prod: any) {
    const name = this.clientLabel(prod);
    this.selectedRadioGroup = name;
    this.popoverController.dismiss({
      client: name
    });
  }

  close() {
    this.popoverController.dismiss();
  }

  presentToast(msg:any, durat:any, pos:any) {
    this.toastCtrl.create({
      message: msg,
      duration: durat,
      position: pos
    }).then((toastData) => {
      toastData.present();
    });
  }

  radioGroupChange(event:any) {
    this.popoverController.dismiss({
      'client': this.selectedRadioGroup
    });
  }

  ngOnInit() {
  }

}
