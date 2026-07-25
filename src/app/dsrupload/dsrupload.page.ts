import { Component, OnInit } from '@angular/core';
import { ToastController, NavController, ModalController, AlertController, ViewWillLeave } from '@ionic/angular';
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
export class DsruploadPage implements OnInit, ViewWillLeave {

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
  hasDraft = false;
  draftSavedAt: string | null = null;
  private draftTimer: any;
  /** Prevents ionViewWillLeave from re-saving draft after a successful upload. */
  private skipDraftSaveOnLeave = false;
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
    this.str.get('id').then(async (value) => {
      this.userid = value;
      this.getTowns();
      this.getDateRequest();
      await this.restoreDraft();
    });

    this.str.get('username').then((value) => {
      this.username = value;
    });
  }

  ionViewWillLeave() {
    if (this.skipDraftSaveOnLeave) {
      return;
    }
    this.saveDraft(false);
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
      this.getCustomerList(true);
      this.scheduleDraftSave();
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
      setTimeout(() => this.openModal(), 350);
    }
  }

  /** Add another customer record without changing town */
  addAnotherCustomer() {
    this.customername = '';
    this.clientselected = null;
    this.openPopOverCustomer();
  }

  getDateRequest() {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const datap = { appuser_id: this.userid, typerequest: 'DSR' };
    this.http.post(this.url + 'getdaterequested', datap, { headers }).subscribe((data: any) => {
      this.daterequest = data.data;
    }, () => { });
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

  dateChangeDrop() {
    this.checkReportDateAlreadyFilled('DSR');
  }

  checkReportDateAlreadyFilled(type: 'DSR' | 'DMRT') {
    if (!this.userid || !this.dateSelect) {
      return;
    }

    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const datap = {
      appuser_id: this.userid,
      date: this.dateSelect,
      type
    };

    this.http.post(this.url + 'checkreportdate', datap, { headers }).subscribe((data: any) => {
      if (data && data.already_filled) {
        const msg = data.message || (type + ' already submitted for this date');
        this.presentToast(msg, 4000, 'middle');
        this.dateSelect = null;
        this.scheduleDraftSave();
        return;
      }
      this.scheduleDraftSave();
    }, () => {
      // If check API is unavailable, still allow draft save
      this.scheduleDraftSave();
    });
  }

  async openModal() {
    if (!this.clientselected || !this.clientselected.client_name) {
      this.presentToast('Please select a customer first', 3000, 'bottom');
      return;
    }

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

    await modal.present();
    const result = await modal.onDidDismiss();

    if (result && result.data) {
      this.dataadded = [...this.dataadded, result.data];
      this.customername = '';
      this.clientselected = null;
      this.scheduleDraftSave();
      this.presentToast(
        'Added (' + this.dataadded.length + '). Draft auto-saved.',
        3000,
        'bottom'
      );
    }
  }

  getSealStatus() {
    if (this.fieldtype === 'InField' || this.fieldtype === 'InFieldandOffice') {
      this.towndata = true;
    } else {
      this.towndata = false;
      this.townlist = false;
      this.clearFieldVisitData();
    }
    this.scheduleDraftSave();
  }

  /** Clears town/customer/visit records so they stay blank for Office/Leave/Holiday */
  clearFieldVisitData() {
    this.activity = 'Visit';
    this.townname = '';
    this.townselected = null;
    this.customername = '';
    this.clientselected = null;
    this.customerdatalist = [];
    this.dataadded = [];
  }

  async delItem(i: any) {
    const name = this.dataadded[i]?.clientname || 'this record';
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to remove ' + name + '?',
      buttons: [
        { text: 'NO', role: 'cancel' },
        {
          text: 'YES',
          handler: () => {
            this.dataadded.splice(i, 1);
            this.dataadded = [...this.dataadded];
            this.scheduleDraftSave();
          }
        }
      ]
    });
    await alert.present();
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
        this.dataadded = [...this.dataadded];
        this.scheduleDraftSave();
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

  getCustomerList(openPicker = true) {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const town = this.normalizeTownName(this.townname || this.townselected);

    if (!town) {
      this.presentToast('Please select a town first', 3000, 'bottom');
      return;
    }

    const applyCustomers = (list: any[], shouldOpen: boolean) => {
      this.customerdatalist = list || [];
      this.townlist = true;
      if (!this.customerdatalist.length) {
        this.presentToast('No customers found for ' + town, 3000, 'bottom');
      } else if (shouldOpen) {
        this.openPopOverCustomer();
      }
      this.scheduleDraftSave();
    };

    const cacheKey = this.apiCache.customersKey(this.userid, town);

    this.apiCache.get<any[]>(cacheKey).then((cached) => {
      if (cached) {
        applyCustomers(cached, openPicker);
        return;
      }

      const datap = { appuser_id: this.userid, town };
      this.http.post(this.url + 'get-customers-data', datap, { headers }).subscribe((data: any) => {
        const list = data && data.data ? data.data : [];
        this.apiCache.set(cacheKey, list);
        applyCustomers(list, openPicker);
      }, () => {
        this.customerdatalist = [];
        this.townlist = false;
        this.presentToast('Unable to load customers', 3000, 'bottom');
      });
    });
  }

  // ----- Draft save / restore -----

  private draftStorageKey() {
    return this.apiCache.draftKey(this.userid);
  }

  hasDraftContent(): boolean {
    return !!(
      this.fieldtype ||
      this.dateSelect ||
      this.townname ||
      (this.dataadded && this.dataadded.length) ||
      (this.remarks && String(this.remarks).trim())
    );
  }

  scheduleDraftSave() {
    clearTimeout(this.draftTimer);
    this.draftTimer = setTimeout(() => this.saveDraft(false), 400);
  }

  async saveDraft(showToast = false) {
    if (!this.userid) {
      return;
    }

    if (!this.hasDraftContent()) {
      await this.clearDraft(false);
      return;
    }

    const draft = {
      fieldtype: this.fieldtype,
      activity: this.activity,
      dateSelect: this.dateSelect,
      townname: this.townname,
      townselected: this.townselected || this.townname,
      remarks: this.remarks || '',
      dataadded: this.dataadded || [],
      towndata: this.towndata,
      townlist: this.townlist,
      savedAt: new Date().toISOString()
    };

    const savedAt = await this.apiCache.saveDraftRemote(this.userid, 'dsr', draft);
    this.hasDraft = true;
    this.draftSavedAt = savedAt || draft.savedAt;

    if (showToast) {
      this.presentToast('Draft saved. You can submit later.', 2500, 'bottom');
    }
  }

  async restoreDraft() {
    if (!this.userid) {
      return;
    }

    const draft = await this.apiCache.getDraftRemote(this.userid, 'dsr');
    if (!draft) {
      return;
    }

    this.fieldtype = draft.fieldtype;
    this.activity = draft.activity || 'Visit';
    this.dateSelect = draft.dateSelect;
    this.townname = draft.townname || '';
    this.townselected = draft.townselected || draft.townname || null;
    this.remarks = draft.remarks || '';
    this.dataadded = Array.isArray(draft.dataadded) ? draft.dataadded : [];
    this.draftSavedAt = draft.savedAt || null;
    this.hasDraft = true;

    if (this.fieldtype === 'InField' || this.fieldtype === 'InFieldandOffice') {
      this.towndata = true;
      if (this.townname) {
        // Restore customer list for the town, but do not auto-open picker
        this.getCustomerList(false);
      } else {
        this.townlist = !!this.dataadded.length;
      }
    } else if (this.isRemarksOnlyType()) {
      this.towndata = false;
      this.townlist = false;
    }

    this.presentToast('Draft restored', 2500, 'bottom');

    if (this.dateSelect) {
      this.checkReportDateAlreadyFilled('DSR');
    }
  }

  async clearDraft(showToast = false) {
    if (!this.userid) {
      return;
    }
    await this.apiCache.clearDraftRemote(this.userid, 'dsr');
    this.hasDraft = false;
    this.draftSavedAt = null;
    if (showToast) {
      this.presentToast('Draft cleared', 2000, 'bottom');
    }
  }

  async clearDraftConfirm() {
    const alert = await this.alertController.create({
      header: 'Clear Draft',
      message: 'Remove saved draft and reset this form?',
      buttons: [
        { text: 'NO', role: 'cancel' },
        {
          text: 'YES',
          handler: () => {
            this.fieldtype = null;
            this.dateSelect = null;
            this.remarks = '';
            this.towndata = false;
            this.townlist = false;
            this.clearFieldVisitData();
            this.clearDraft(true);
          }
        }
      ]
    });
    await alert.present();
  }

  onRemarksChange() {
    this.scheduleDraftSave();
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
    const remarksOnly = this.isRemarksOnlyType();

    if (!this.fieldtype) {
      this.presentToast('Please select an option', 4000, 'bottom');
      return;
    }

    if (remarksOnly) {
      if (!this.remarks || !String(this.remarks).trim()) {
        this.presentToast('Please enter remarks', 4000, 'bottom');
        return;
      }
    } else if (
      (this.fieldtype === 'InField' || this.fieldtype === 'InFieldandOffice') &&
      (!this.dataadded || this.dataadded.length === 0)
    ) {
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

  isRemarksOnlyType(): boolean {
    return this.fieldtype === 'Office' || this.fieldtype === 'Leave' || this.fieldtype === 'Holiday';
  }

  proceedUploadDSR() {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const datap = this.isRemarksOnlyType()
      ? {
          appuser_id: this.userid,
          date: this.dateSelect,
          type: this.fieldtype,
          data: [],
          remarks: this.remarks || ''
        }
      : {
          appuser_id: this.userid,
          date: this.dateSelect,
          type: this.fieldtype,
          data: this.dataadded,
          remarks: this.remarks || ''
        };

    console.log('adddsrdata payload', datap);

    this.http.post(this.url + 'adddsrdata', datap, { headers }).subscribe(async (data: any) => {
      clearTimeout(this.draftTimer);
      this.skipDraftSaveOnLeave = true;
      this.resetFormAfterUpload();
      await this.clearDraft(false);
      this.presentToast(data.message, 4000, 'bottom');
      this.navctrl.navigateRoot('home');
    }, () => { });
  }

  private resetFormAfterUpload() {
    this.fieldtype = null;
    this.dateSelect = null;
    this.remarks = '';
    this.towndata = false;
    this.townlist = false;
    this.clearFieldVisitData();
  }
}
