import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import {
  ToastController,
  Platform,
  NavController,
  LoadingController,
  ModalController,
  PopoverController,
  AlertController,
  ViewWillLeave
} from '@ionic/angular';
import { DrtrpopupPage } from '../drtrpopup/drtrpopup.page';
import { File, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { TownPage } from '../town/town.page';
import { ApiCacheService } from '../api-cache.service';

interface Customer {
  name: string;
  phone: string;
  visittype: string;
  town: string;
  file: any;
  data: any;
  comment: string;
  consumption: any;
  dealer: any;
}

@Component({
  selector: 'app-drtrupload',
  templateUrl: './drtrupload.page.html',
  styleUrls: ['./drtrupload.page.scss'],
  standalone: false,
})
export class DrtruploadPage implements OnInit, ViewWillLeave {

  dateSelect: any;
  visitType: any;
  name: any;
  phone: any = '';
  phoneTouched = false;
  phoneError = '';
  brands: any;
  article: any;
  userid: any;
  customer: Customer[] = [];
  filedata: any;
  imgBlob: any = '';
  comment: any = '';
  daterequest: any;
  hotelnote: any;
  towndatalist: any;
  townselected: any;
  townname: any = '';
  isLoading = false;
  reqdate = false;
  datetime: any;
  mindate: any;
  maxdate: any;
  hasDraft = false;
  draftSavedAt: string | null = null;
  private draftTimer: any;
  private skipDraftSaveOnLeave = false;

  optionsGallery: CameraOptions = {
    quality: 100,
    targetWidth: 800,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
  };
  options: CameraOptions = {
    quality: 100,
    allowEdit: false,
    targetWidth: 800,
    cameraDirection: 0,
    saveToPhotoAlbum: false,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.CAMERA
  };

  url = environment.SERVER_URL;
  username: any;

  constructor(
    private modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    private navctrl: NavController,
    private platform: Platform,
    private router: Router,
    public str: Storage,
    public popoverController: PopoverController,
    private file: File,
    private camera: Camera,
    public alertController: AlertController,
    private androidPermissions: AndroidPermissions,
    private apiCache: ApiCacheService,
  ) {
    this.str.get('id').then(async (value) => {
      this.userid = value;
      this.getDateRequest();
      this.getTowns();
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

  openCal() {
    this.reqdate = true;
  }

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

    if (data && data.selectedItem) {
      this.townselected = data.selectedItem;
      this.townname = data.selectedItem;
      this.scheduleDraftSave();
    }
  }

  get isPhoneValid(): boolean {
    return /^[6-9]\d{9}$/.test(this.phone || '');
  }

  onPhoneInput(event: any) {
    const raw = String(event?.detail?.value ?? '');
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    this.phone = digits;
    this.phoneTouched = true;
    this.phoneError = this.getPhoneError(digits);
    this.scheduleDraftSave();
  }

  onPhoneBlur() {
    this.phoneTouched = true;
    this.phoneError = this.getPhoneError(this.phone || '');
    if (this.isPhoneValid) {
      this.getclientname();
    }
  }

  private getPhoneError(phone: string): string {
    if (!phone) {
      return 'Please enter mobile number.';
    }
    if (phone.length < 10) {
      return `Enter ${10 - phone.length} more digit${10 - phone.length === 1 ? '' : 's'}.`;
    }
    if (!/^[6-9]/.test(phone)) {
      return 'Mobile number must start with 6, 7, 8, or 9.';
    }
    return '';
  }

  getclientname() {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const datap = { phone: this.phone };
    this.http.post(this.url + 'getdrtrcustomername', datap, { headers }).subscribe((data: any) => {
      this.name = data.data;
      this.scheduleDraftSave();
    }, () => { });
  }

  getTowns() {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const datap = { appuser_id: this.userid };
    this.http.post(this.url + 'getcustomertown', datap, { headers }).subscribe((data: any) => {
      this.towndatalist = data.data;
    }, () => { });
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

  addDrtr() { }

  async openModal() {
    if (!this.name || this.name.length < 4) {
      this.presentToast('Please check name . It should be min 3 chars', 4000, 'bottom');
      return;
    }

    this.phoneTouched = true;
    this.phoneError = this.getPhoneError(this.phone || '');
    if (!this.isPhoneValid) {
      this.presentToast(this.phoneError || 'Please check phone no', 4000, 'bottom');
      return;
    }

    // Save current form fields to draft before opening popup
    await this.saveDraft(false);

    const modal = await this.modalCtrl.create({
      component: DrtrpopupPage,
      cssClass: 'dsrmodal',
      componentProps: { value: 0, mode: 'add', userid: this.userid }
    });

    modal.onDidDismiss().then(async (data) => {
      if (!data?.data) {
        return;
      }

      const newdata = {
        name: this.name,
        phone: this.phone,
        visittype: this.visitType,
        town: this.townname,
        file: data.data.file,
        data: data.data.data,
        comment: data.data.comment,
        consumption: data.data.consumption,
        dealer: data.data.dealer,
        lat: data.data.lat,
        lang: data.data.lang
      };
      this.customer.push(newdata);
      this.name = '';
      this.phone = '';
      this.phoneTouched = false;
      this.phoneError = '';
      this.imgBlob = '';
      this.townname = '';
      await this.saveDraft(false);
    });
    modal.present();
  }

  delItem(i: any) {
    this.customer.splice(i, 1);
    this.scheduleDraftSave();
  }

  dateChangeDrop() {
    this.checkReportDateAlreadyFilled('DMRT');
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
      this.scheduleDraftSave();
    });
  }

  private draftStorageKey() {
    return this.apiCache.draftDrmtKey(this.userid);
  }

  hasDraftContent(): boolean {
    return !!(
      this.dateSelect ||
      this.visitType ||
      this.townname ||
      this.phone ||
      this.name ||
      (this.customer && this.customer.length) ||
      (this.comment && String(this.comment).trim())
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

    // Strip shop photo base64 from draft customers — large writes crash WebView after camera
    const customerDraft = (this.customer || []).map((c: any) => ({
      ...c,
      file: c?.file ? '__photo_omitted__' : ''
    }));

    const draft = {
      dateSelect: this.dateSelect,
      visitType: this.visitType,
      townname: this.townname,
      townselected: this.townselected || this.townname,
      phone: this.phone || '',
      name: this.name || '',
      comment: this.comment || '',
      customer: customerDraft,
      savedAt: new Date().toISOString()
    };

    // Server draft (with local fallback) so camera/WebView kills don't lose form data
    const savedAt = await this.apiCache.saveDraftRemote(this.userid, 'drmt', draft);
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

    const draft = await this.apiCache.getDraftRemote(this.userid, 'drmt');
    if (!draft) {
      return;
    }

    this.dateSelect = draft.dateSelect;
    this.visitType = draft.visitType;
    this.townname = draft.townname || '';
    this.townselected = draft.townselected || draft.townname || null;
    this.phone = draft.phone || '';
    this.name = draft.name || '';
    this.comment = draft.comment || '';
    this.customer = Array.isArray(draft.customer)
      ? draft.customer.map((c: any) => ({
          ...c,
          // Draft never keeps real photo bytes; force retake if needed on submit
          file: c?.file && c.file !== '__photo_omitted__' ? c.file : ''
        }))
      : [];
    this.draftSavedAt = draft.savedAt || null;
    this.hasDraft = true;

    if (this.phone) {
      this.phoneTouched = true;
      this.phoneError = this.getPhoneError(this.phone);
    }

    this.presentToast('Draft restored', 2500, 'bottom');

    if (this.dateSelect) {
      this.checkReportDateAlreadyFilled('DMRT');
    }
  }

  async clearDraft(showToast = false) {
    if (!this.userid) {
      return;
    }
    await this.apiCache.clearDraftRemote(this.userid, 'drmt');
    this.hasDraft = false;
    this.draftSavedAt = null;
    if (showToast) {
      this.presentToast('Draft cleared', 2000, 'bottom');
    }
  }

  private resetFormAfterUpload() {
    this.dateSelect = null;
    this.visitType = null;
    this.townname = '';
    this.townselected = null;
    this.phone = '';
    this.phoneTouched = false;
    this.phoneError = '';
    this.name = '';
    this.comment = '';
    this.customer = [];
    this.imgBlob = '';
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
            this.resetFormAfterUpload();
            this.clearDraft(true);
          }
        }
      ]
    });
    await alert.present();
  }

  async uploadDRMT() {
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
            this.proceedUploadDRMT();
          }
        }
      ]
    });

    await alert.present();
  }

  proceedUploadDRMT() {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const formData = new FormData();
    formData.append('appuser_id', this.userid);
    formData.append('date', this.dateSelect);
    formData.append('data', JSON.stringify(this.customer));
    formData.append('comment', this.comment);

    this.http.post(this.url + 'adddmrtdata', formData, { headers }).subscribe(async (data: any) => {
      clearTimeout(this.draftTimer);
      this.skipDraftSaveOnLeave = true;
      this.resetFormAfterUpload();
      await this.clearDraft(false);
      this.presentToast(data.message, 4000, 'bottom');
      this.navctrl.navigateRoot('home');
    }, () => { });
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

  async presentLoading() {
    this.isLoading = true;
    return await this.loadingCtrl.create({
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss().then(() => { });
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => { });
  }

  takePicture() {
    this.camera.getPicture(this.options).then((imageData) => {
      this.file.resolveLocalFilesystemUrl(imageData).then((entry: any) => {
        if (entry.isFile) {
          const fileEntry = entry as FileEntry;
          fileEntry.file(file => {
            this.readFile(file);
          }, error => {
            console.error('Error getting file:', error);
          });
        }
      }, error => {
        console.error('Error resolving file system URL', error);
      });
    }, () => { });
  }

  readFile(files: any) {
    const reader = new FileReader();

    reader.onloadend = () => {
      const imgBlobs = new Blob([reader.result as ArrayBuffer], {
        type: files.type
      });
      this.imgBlob = imgBlobs;
      this.filedata = files;
      reader.readAsArrayBuffer(files);
    };
  }
}
