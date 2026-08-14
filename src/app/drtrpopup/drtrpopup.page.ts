import { Component, OnInit, NgZone } from '@angular/core';
import {
  ModalController,
  NavParams,
  ToastController,
  AlertController,
  Platform,
  ActionSheetController
} from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { ApiCacheService } from '../api-cache.service';

interface DataItem {
  brands: any;
  article: any;
  qty: any;
  itemvalue: any;
  price: any;
}

@Component({
  selector: 'app-drtrpopup',
  templateUrl: './drtrpopup.page.html',
  styleUrls: ['./drtrpopup.page.scss'],
  standalone: false,
})
export class DrtrpopupPage implements OnInit {
  data: DataItem[] = [];
  qty: any = 0;
  itemvalue: any = '';
  price: any;
  article: any;
  brands: any;
  addarticle: any = '';
  reqarticle: any = false;
  filedata: any;
  imgBlob: any = '';
  photoPreview: SafeUrl | null = null;
  dealername: any = '';
  GT: any = 0;
  GTKTL: any = 0;
  maindata: any = [
    [true, '2/180 M', '', 70, ''], [true, '3/135 M', '', 70, ''], [true, '2/800 M', '', 110, ''], [true, '2/10000 M', '', 110, ''], [true, '2/200 G', '', 100, ''],
    [true, '2/170 G', '', 100, ''], [true, '2/300 M', '', 120, ''], [true, 'CFC-8"', '', 4, ''], [true, 'LFC-8"', '', 4, ''], [true, 'CINC', '', 5, ''], [true, 'Others', '', '1', ''], [true, '2/130M', '', 85, '']
  ];
  articlesdata: any = [
    [true, '2/180 M', '', 70, ''], [true, '3/135 M', '', 70, ''], [true, '2/800 M', '', 110, ''], [true, '2/10000 M', '', 110, ''], [true, '2/200 G', '', 100, ''],
    [true, '2/170 G', '', 100, ''], [true, '2/300 M', '', 120, ''], [true, 'CFC-8"', '', 4, ''], [true, 'LFC-8"', '', 4, ''], [true, 'CINC', '', 5, ''], [true, 'Others', '', '1', ''], [true, '2/130M', '', 85, '']
  ];

  articlesktl: any = [
    [true, '2/180 M', '', 70, ''], [true, '3/135 M', '', 70, ''], [true, '2/800 M', '', 110, ''], [true, '2/10000 M', '', 110, ''], [true, '2/200 G', '', 100, ''],
    [true, '2/170 G', '', 100, ''], [true, '2/300 M', '', 120, ''], [true, 'CFC-8"', '', 4, ''], [true, 'LFC-8"', '', 4, ''], [true, 'CINC', '', 5, ''], [true, 'Others', '', '1', ''], [true, '2/130M', '', 85, '']
  ];
  mode: any;
  clientname: any;
  lat: any = '';
  lang: any = '';
  userid: any;
  hasDraft = false;
  /** When true (existing customer from API), hide brand articles and make shop photo optional */
  existingCustomer = false;
  private draftTimer: any;
  private skipDraftSaveOnClose = false;

  optionsGallery: CameraOptions = {
    quality: 60,
    targetWidth: 640,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    correctOrientation: true
  };
  options: CameraOptions = {
    quality: 60,
    allowEdit: false,
    targetWidth: 640,
    cameraDirection: 0,
    saveToPhotoAlbum: false,
    // DATA_URL keeps Samsung scoped-storage working; keep size small to avoid WebView OOM
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.CAMERA,
    correctOrientation: true
  };

  constructor(
    private modalController: ModalController,
    public toastCtrl: ToastController,
    private navParams: NavParams,
    private file: File,
    private camera: Camera,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private apiCache: ApiCacheService,
    public alertController: AlertController,
    private platform: Platform,
    private actionsheetCtrl: ActionSheetController,
    private sanitizer: DomSanitizer,
    private zone: NgZone,
  ) {
    this.mode = this.navParams.get('mode');
    this.userid = this.navParams.get('userid');
    this.existingCustomer = !!this.navParams.get('existingCustomer');
  }

  async ngOnInit() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lang = resp.coords.longitude;
    }).catch(() => {
      this.presentToast('Please check your location is enabled.', 4000, 'bottom');
    });

    await this.restoreDraft();
  }

  openCal() {
    this.reqarticle = true;
  }

  async close() {
    if (!this.skipDraftSaveOnClose) {
      await this.saveDraft(false);
    }
    this.modalController.dismiss();
  }

  addArticleData() {
    if (this.addarticle == '') {
      this.presentToast('Please enter article', 4000, 'bottom');
      return;
    }
    this.articlesdata.push([true, this.addarticle, '', 1, '']);
    this.addarticle = '';
    this.reqarticle = false;
    this.scheduleDraftSave();
  }

  /** Only rows with a real positive qty should be added / submitted */
  private hasValidQty(qty: any): boolean {
    if (qty === null || qty === undefined) {
      return false;
    }
    const raw = String(qty).trim();
    if (raw === '') {
      return false;
    }
    const n = Number(raw);
    return !isNaN(n) && n > 0;
  }

  calculate(index: any) {
    let tval = 0;

    if (this.articlesdata[index][0] == true && this.hasValidQty(this.articlesdata[index][2])) {
      const qty = parseFloat(this.articlesdata[index][2]) || 0;
      const rate = parseFloat(this.articlesdata[index][3]) || 0;
      this.articlesdata[index][4] = qty * rate;
    } else {
      this.articlesdata[index][4] = '';
    }
    for (let i = 0; i < this.articlesdata.length; i++) {
      tval += parseFloat(this.articlesdata[i][4]) || 0;
    }
    this.GT = tval;
    this.scheduleDraftSave();
  }

  calculatektl(index: any) {
    let tval = 0;

    if (this.articlesktl[index][0] == true && this.hasValidQty(this.articlesktl[index][2])) {
      const qty = parseFloat(this.articlesktl[index][2]) || 0;
      const rate = parseFloat(this.articlesktl[index][3]) || 0;
      this.articlesktl[index][4] = qty * rate;
    } else {
      this.articlesktl[index][4] = '';
    }
    for (let i = 0; i < this.articlesktl.length; i++) {
      tval += parseFloat(this.articlesktl[i][4]) || 0;
    }
    this.GTKTL = tval;
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

  async addDrtr() {
    if (this.brands == '' || this.brands == null) {
      this.presentToast('Please check Brands', 4000, 'bottom');
      return;
    }

    let added = 0;
    for (let i = 0; i < this.articlesdata.length; i++) {
      if (this.articlesdata[i][0] == true && this.hasValidQty(this.articlesdata[i][2])) {
        const qtyNum = Number(String(this.articlesdata[i][2]).trim());
        const rate = parseFloat(this.articlesdata[i][3]) || 0;
        const dataval: DataItem = {
          brands: this.brands,
          article: this.articlesdata[i][1],
          qty: qtyNum,
          itemvalue: this.articlesdata[i][3],
          price: this.articlesdata[i][4] !== '' && this.articlesdata[i][4] != null
            ? this.articlesdata[i][4]
            : qtyNum * rate
        };
        this.data.push(dataval);
        added++;
      }
    }

    if (added === 0) {
      this.presentToast('Enter qty for at least one article', 4000, 'bottom');
      return;
    }

    this.articlesdata = this.maindata.map((row: any) => [...row]);
    this.brands = '';
    this.GT = 0;
    await this.saveDraft(false);
  }

  async postData() {
    if (!this.existingCustomer && this.imgBlob == '') {
      this.presentToast('Please take a photo of the shop', 4000, 'bottom');
      return;
    }

    for (let i = 0; i < this.articlesktl.length; i++) {
      if (this.articlesktl[i][0] == true && this.hasValidQty(this.articlesktl[i][2])) {
        const qtyNum = Number(String(this.articlesktl[i][2]).trim());
        const rate = parseFloat(this.articlesktl[i][3]) || 0;
        const dataval: DataItem = {
          brands: 'KTL',
          article: this.articlesktl[i][1],
          qty: qtyNum,
          itemvalue: this.articlesktl[i][3],
          price: this.articlesktl[i][4] !== '' && this.articlesktl[i][4] != null
            ? this.articlesktl[i][4]
            : qtyNum * rate
        };
        this.data.push(dataval);
      }
    }

    // Drop any previously saved lines that have no qty (bad draft / old bug)
    this.data = (this.data || []).filter((row: DataItem) => this.hasValidQty(row.qty));

    const lastdata = {
      file: this.imgBlob,
      data: this.data,
      comment: this.itemvalue,
      consumption: this.qty,
      dealer: this.dealername,
      lat: this.lat,
      lang: this.lang
    };

    clearTimeout(this.draftTimer);
    this.skipDraftSaveOnClose = true;
    await this.clearDraft(false);
    await this.modalController.dismiss(lastdata);
  }

  delItem(i: any) {
    this.data.splice(i, 1);
    this.scheduleDraftSave();
  }

  async openPicChooser() {
    const actionSheet = await this.actionsheetCtrl.create({
      header: 'Shop Photo',
      buttons: [
        {
          text: 'Take photo',
          icon: 'camera-outline',
          handler: () => {
            this.takePicture();
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images-outline',
          handler: () => {
            this.takePictureFile();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  takePictureFile() {
    // Camera plugin only works inside the native app; use a file input in the browser
    if (!this.platform.is('cordova')) {
      this.pickImageInBrowser(false);
      return;
    }

    localStorage.setItem('ktl_return_route', '/drtrupload');
    this.camera.getPicture(this.optionsGallery).then((imageData: any) => {
      localStorage.removeItem('ktl_return_route');
      this.setShopPhoto(imageData);
    }, (err: any) => {
      localStorage.removeItem('ktl_return_route');
      const errText = String(err || '');
      if (errText && errText.toLowerCase().indexOf('cancel') === -1 && errText.indexOf('No Image Selected') === -1) {
        this.presentToast('Could not open gallery: ' + errText, 4000, 'bottom');
      }
    });
  }

  // Gallery: file picker. Camera: live webcam overlay (works on laptop + phone browsers).
  pickImageInBrowser(useCamera: boolean) {
    if (useCamera) {
      this.openBrowserCamera();
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        this.readBrowserFile(input.files[0]);
      }
    };
    input.click();
  }

  async openBrowserCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.presentToast('Camera is not supported in this browser.', 4000, 'bottom');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
    } catch (err) {
      this.presentToast('Please allow camera access in the browser, then try again.', 5000, 'bottom');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'ktl-drmt-camera-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;';

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.srcObject = stream;
    video.style.cssText = 'max-width:100%;max-height:70vh;width:100%;object-fit:cover;';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:16px;margin-top:20px;';

    const captureBtn = document.createElement('button');
    captureBtn.textContent = 'Capture';
    captureBtn.style.cssText = 'padding:12px 28px;border:0;border-radius:24px;background:#0f6e8c;color:#fff;font-size:16px;cursor:pointer;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'padding:12px 28px;border:0;border-radius:24px;background:#666;color:#fff;font-size:16px;cursor:pointer;';

    const stopCamera = () => {
      stream.getTracks().forEach(t => t.stop());
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };

    cancelBtn.onclick = () => stopCamera();

    captureBtn.onclick = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        stopCamera();
        this.presentToast('Could not capture photo. Please try again.', 4000, 'bottom');
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stopCamera();
      this.setShopPhoto(canvas.toDataURL('image/jpeg', 0.9));
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(captureBtn);
    overlay.appendChild(video);
    overlay.appendChild(btnRow);
    document.body.appendChild(overlay);
  }

  readBrowserFile(file: any) {
    const reader = new FileReader();
    reader.onloadend = () => {
      this.setShopPhoto(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  }

  setShopPhoto(base64Image: string) {
    if (!base64Image) {
      this.presentToast('Could not capture photo. Please try again.', 3000, 'bottom');
      return;
    }

    // Normalize: Cordova may return raw base64 or a full data URL
    let photo = String(base64Image).trim();
    if (photo && !photo.startsWith('data:') && !photo.startsWith('http') && !photo.startsWith('file:') && !photo.startsWith('content:')) {
      photo = 'data:image/jpeg;base64,' + photo;
    }

    this.zone.run(() => {
      this.imgBlob = photo;
      this.photoPreview = this.sanitizer.bypassSecurityTrustUrl(photo);
      this.scheduleDraftSave();
      this.presentToast('Shop photo added', 2000, 'bottom');
    });
  }

  private applyPhotoPreview(photo: string) {
    if (!photo) {
      this.photoPreview = null;
      return;
    }
    let normalized = String(photo).trim();
    if (normalized && !normalized.startsWith('data:') && !normalized.startsWith('http') && !normalized.startsWith('file:') && !normalized.startsWith('content:')) {
      normalized = 'data:image/jpeg;base64,' + normalized;
      this.imgBlob = normalized;
    }
    this.photoPreview = this.sanitizer.bypassSecurityTrustUrl(normalized);
  }

  takePicture() {
    // Camera plugin only works inside the native app; use browser camera in web
    if (!this.platform.is('cordova')) {
      this.pickImageInBrowser(true);
      return;
    }

    // If Android kills WebView during camera, cold-start should reopen DRMT upload
    localStorage.setItem('ktl_return_route', '/drtrupload');
    this.camera.getPicture(this.options).then((imageData: any) => {
      localStorage.removeItem('ktl_return_route');
      this.setShopPhoto(imageData);
    }, (err: any) => {
      localStorage.removeItem('ktl_return_route');
      const errText = String(err || '');
      if (errText && errText.toLowerCase().indexOf('cancel') === -1 && errText.indexOf('No Image Selected') === -1) {
        this.presentToast('Could not open camera: ' + errText, 4000, 'bottom');
      }
    });
  }

  onFieldChange() {
    this.scheduleDraftSave();
  }

  // ----- Draft -----

  private draftStorageKey() {
    return this.apiCache.draftDrmtPopupKey(this.userid);
  }

  hasDraftContent(): boolean {
    const hasArticleQty = (this.articlesdata || []).some((row: any) => row[2] !== '' && row[2] != null);
    const hasKtlQty = (this.articlesktl || []).some((row: any) => row[2] !== '' && row[2] != null);
    return !!(
      this.brands ||
      (this.data && this.data.length) ||
      hasArticleQty ||
      hasKtlQty ||
      this.itemvalue ||
      this.dealername ||
      this.imgBlob ||
      (this.qty && this.qty !== 0 && this.qty !== '0')
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

    // Never persist full shop photo base64 in drafts — it OOMs WebView / wipes session after camera
    const draft = {
      brands: this.brands,
      articlesdata: this.articlesdata,
      articlesktl: this.articlesktl,
      data: this.data || [],
      qty: this.qty,
      itemvalue: this.itemvalue || '',
      dealername: this.dealername || '',
      hasPhoto: !!this.imgBlob,
      GT: this.GT || 0,
      GTKTL: this.GTKTL || 0,
      reqarticle: this.reqarticle,
      addarticle: this.addarticle || '',
      savedAt: new Date().toISOString()
    };

    await this.apiCache.saveDraftRemote(this.userid, 'drmt_popup', draft);
    this.hasDraft = true;

    if (showToast) {
      this.presentToast('Draft saved. You can continue later.', 2500, 'bottom');
    }
  }

  async restoreDraft() {
    if (!this.userid) {
      return;
    }

    const draft = await this.apiCache.getDraftRemote(this.userid, 'drmt_popup');
    if (!draft) {
      return;
    }

    this.brands = draft.brands;
    this.articlesdata = Array.isArray(draft.articlesdata)
      ? draft.articlesdata.map((row: any) => [...row])
      : this.articlesdata;
    this.articlesktl = Array.isArray(draft.articlesktl)
      ? draft.articlesktl.map((row: any) => [...row])
      : this.articlesktl;
    this.data = Array.isArray(draft.data) ? draft.data : [];
    this.qty = draft.qty ?? 0;
    this.itemvalue = draft.itemvalue || '';
    this.dealername = draft.dealername || '';
    // Photos are kept in memory only (not in draft) to avoid storage crash after camera
    this.imgBlob = '';
    this.photoPreview = null;
    this.GT = draft.GT || 0;
    this.GTKTL = draft.GTKTL || 0;
    this.reqarticle = !!draft.reqarticle;
    this.addarticle = draft.addarticle || '';
    this.hasDraft = true;

    this.presentToast('Draft restored', 2500, 'bottom');
  }

  async clearDraft(showToast = false) {
    if (!this.userid) {
      return;
    }
    await this.apiCache.clearDraftRemote(this.userid, 'drmt_popup');
    this.hasDraft = false;
    if (showToast) {
      this.presentToast('Draft cleared', 2000, 'bottom');
    }
  }

  private resetForm() {
    this.brands = '';
    this.articlesdata = this.maindata.map((row: any) => [...row]);
    this.articlesktl = this.maindata.map((row: any) => [...row]);
    this.data = [];
    this.qty = 0;
    this.itemvalue = '';
    this.dealername = '';
    this.imgBlob = '';
    this.photoPreview = null;
    this.GT = 0;
    this.GTKTL = 0;
    this.reqarticle = false;
    this.addarticle = '';
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
            this.resetForm();
            this.clearDraft(true);
          }
        }
      ]
    });
    await alert.present();
  }
}
