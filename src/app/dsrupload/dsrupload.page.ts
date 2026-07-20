import { Component, OnInit } from '@angular/core';
import { ToastController, NavController, ModalController, AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DsrpopupPage } from '../dsrpopup/dsrpopup.page';
import { TownPage } from '../town/town.page';
import { CustomerPage } from '../customer/customer.page';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';
import { ApiCacheService } from '../api-cache.service';

@Component({
  selector: 'app-dsrupload',
  templateUrl: './dsrupload.page.html',
  styleUrls: ['./dsrupload.page.scss'],
  standalone: false,
})
export class DsruploadPage implements OnInit {

  towndata = false;
  townlist = false;
  townselected: any;
  clientselected: any;
  towndatalist: any[] = [];
  customerdatalist: any[] = [];
  fieldtype: any;
  activity: any = 'Visit';
  userid: any;
  dateSelect: any;
  daterequest: any;
  dataadded: any[] = [];
  reqdate = false;
  datetime: any;
  mindate: any;
  username: any;
  maxdate: any;
  remarks: any = '';
  townname: any = '';
  customername: any = '';
  url = environment.SERVER_URL;
  recdata = {
    id: '',
    zip: '',
    thread: '',
    collection: '',
    issue: '',
    remarks: '',
    clientname: '',
  };

  constructor(
    private modalCtrl: ModalController,
    private navctrl: NavController,
    private http: HttpClient,
    public str: Storage,
    public toastCtrl: ToastController,
    public alertController: AlertController,
    private apiCache: ApiCacheService
  ) {
    this.str.get('id').then((value) => {
      this.userid = value;
      this.getTowns();
      this.getDateRequest();
    });

    this.str.get('username').then((value) => {
      this.username = value;
    });
  }

  // Open town picker → on select load customers for that town
  async openPopOver() {
    const modal = await this.modalCtrl.create({
      component: TownPage,
      componentProps: {
        title: 'Select Town',
        items: this.towndatalist || [],
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    const selectedTown = this.normalizeTownName(data);
    if (selectedTown) {
      this.townselected = selectedTown;
      this.townname = selectedTown;
      this.customername = '';
      this.clientselected = null;
      this.customerdatalist = [];
      this.dataadded = [];
      this.getCustomerList();
    }
  }

  /** Ensures town is always a plain string for API calls */
  normalizeTownName(value: any): string {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      return value.selectedItem || value.town || value.name || '';
    }
    return String(value);
  }

  // Open customer picker → on select open DSR detail form
  async openPopOverCustomer() {
    if (!this.customerdatalist?.length) {
      this.presentToast('No customers found for this town', 3000, 'bottom');
      return;
    }

    const modal = await this.modalCtrl.create({
      component: CustomerPage,
      componentProps: {
        title: 'Select Customer',
        items: this.customerdatalist || [],
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data && data.client_name) {
      this.clientselected = data;
      this.customername = data.client_name;
      this.openModal();
    }
  }

  getDateRequest() {
    const applyDates = (list: any) => {
      this.daterequest = list;
    };

    const loadFromApi = () => {
      const headers = new HttpHeaders();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');

      const datap = { appuser_id: this.userid, typerequest: 'DSR' };
      this.http.post(this.url + 'getdaterequested', datap, { headers }).subscribe((data: any) => {
        this.daterequest = data.data;
        this.apiCache.set(this.apiCache.datesKey(this.userid), this.daterequest);
      }, () => { });
    };

    this.apiCache.get<any>(this.apiCache.datesKey(this.userid)).then((cached) => {
      if (cached) {
        applyDates(cached);
        return;
      }
      loadFromApi();
    });
  }

  ngOnInit() {
    this.datetime = new Date().toISOString();
    const date = new Date();
    const daten = new Date();
    date.setDate(date.getDate() - 1);
    daten.setDate(daten.getDate() - 3);
    this.mindate = daten.toISOString();
    this.maxdate = date.toISOString();
  }

  openCal() {
    this.reqdate = true;
  }

  dateChangeDrop() { }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: DsrpopupPage,
      cssClass: 'dsrmodal',
      componentProps: {
        value: this.clientselected.client_name,
        mode: 'add',
        id: this.clientselected.id,
        activity: this.activity
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result && result.data) {
        this.dataadded.push(result.data);
      }
    });

    await modal.present();
  }

  getSealStatus() {
    if (this.fieldtype === 'InField' || this.fieldtype === 'InFieldandOffice') {
      this.towndata = true;
    } else {
      this.towndata = false;
      this.townlist = false;
    }
  }

  delItem(i: any) {
    this.dataadded.splice(i, 1);
  }

  editItem(i: any) {
    this.openModalEdit(i);
  }

  async openModalEdit(i: any) {
    const modal = await this.modalCtrl.create({
      component: DsrpopupPage,
      cssClass: 'dsrmodal',
      componentProps: {
        data: this.dataadded[i],
        id: i,
        mode: 'edit',
        activity: this.activity
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((result) => {
      if (result && result.data) {
        this.recdata = result.data;
        const recid: number = parseInt(this.recdata.id, 10);
        this.dataadded[recid as number] = this.recdata;
      }
    });

    await modal.present();
  }

  getTowns() {
    const applyTowns = (list: any[]) => {
      this.towndatalist = list || [];
    };

    const loadFromApi = () => {
      const headers = new HttpHeaders();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');

      const datap = { appuser_id: this.userid };
      this.http.post(this.url + 'getcustomertown', datap, { headers }).subscribe((data: any) => {
        const list = data && data.data ? data.data : [];
        this.towndatalist = list.map((item: any) => ({
          ...item,
          town: item.town || item.name
        }));
        this.apiCache.set(this.apiCache.townsKey(this.userid), this.towndatalist);
      }, () => { });
    };

    this.apiCache.get<any[]>(this.apiCache.townsKey(this.userid)).then((cached) => {
      if (cached && cached.length) {
        applyTowns(cached);
        return;
      }
      loadFromApi();
    });
  }

  getCustomerList() {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const town = this.normalizeTownName(this.townname || this.townselected);
    console.log('getCustomerList payload', { appuser_id: this.userid, town });

    if (!town) {
      this.presentToast('Please select a town first', 3000, 'bottom');
      return;
    }

    const applyCustomers = (list: any[], openPicker: boolean) => {
      this.customerdatalist = list || [];
      this.townlist = true;
      if (!this.customerdatalist.length) {
        this.presentToast('No customers found for ' + town, 3000, 'bottom');
      } else if (openPicker) {
        this.openPopOverCustomer();
      }
    };

    const cacheKey = this.apiCache.customersKey(this.userid, town);

    this.apiCache.get<any[]>(cacheKey).then((cached) => {
      if (cached) {
        applyCustomers(cached, true);
        return;
      }

      const datap = { appuser_id: this.userid, town };
      this.http.post(this.url + 'get-customers-data', datap, { headers }).subscribe((data: any) => {
        const list = data && data.data ? data.data : [];
        this.apiCache.set(cacheKey, list);
        applyCustomers(list, true);
      }, () => {
        this.customerdatalist = [];
        this.townlist = false;
        this.presentToast('Unable to load customers', 3000, 'bottom');
      });
    });
  }

  presentToast(msg: any, durat: any, pos: any) {
    this.toastCtrl.create({
      message: msg,
      duration: durat,
      position: pos
    }).then((toastData) => {
      toastData.present();
    });
  }

  async uploadDSR() {
    if (this.fieldtype === 'InField' && (!this.dataadded || this.dataadded.length === 0)) {
      this.presentToast('Please enter customer details', 4000, 'bottom');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to upload this data?',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        },
        {
          text: 'YES',
          handler: () => {
            this.proceedUploadDSR();
          }
        }
      ]
    });

    await alert.present();
  }

  proceedUploadDSR() {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const datap = {
      appuser_id: this.userid,
      date: this.dateSelect,
      type: this.fieldtype,
      data: this.dataadded,
      remarks: this.remarks
    };

    this.http.post(this.url + 'adddsrdata', datap, { headers }).subscribe((data: any) => {
      this.presentToast(data.message, 4000, 'bottom');
      this.navctrl.navigateRoot('home');
    }, () => { });
  }
}
