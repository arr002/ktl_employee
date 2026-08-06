import { Component, OnInit, NgZone, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MenuController, ToastController, Platform, NavController, ModalController, ActionSheetController, AlertController, ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { File, IWriteOptions, FileEntry } from '@awesome-cordova-plugins/file/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { environment } from '../../environments/environment';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { ClientsPage } from '../clients/clients.page';

@Component({
  selector: 'app-attandence',
  templateUrl: './attandence.page.html',
  styleUrls: ['./attandence.page.scss'],
  standalone: false,
})
export class AttandencePage implements OnInit, ViewWillEnter {
  @ViewChild('previewImg') previewImg?: ElementRef<HTMLImageElement>;

  version: any;

  userid: any;
  name: any;
  image: any;
  /** Selected camera/gallery photo (data URL) kept for upload. */
  previewImage: string | null = null;
  /** True once a photo is selected (controls preview UI). */
  hasPreview = false;
  /** On-page error message (camera / gallery / upload / preview). */
  pageError: string | null = null;
  /** On-page success message. */
  pageSuccess: string | null = null;
  empcode: any;
  phone: any;
  department: any;
  designation: any;
  branchname: any;
  dob: any;
  doj: any;
  address: any;
  client: any;

  lat: any;
  long: any;
  comment: any;
  subject: any = '';
  isLoading = false;
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: true
  };


  optionsGallery: CameraOptions = {
    // FILE_URI + convertFileSrc — same reliable preview path as camera (data: URLs break in WebView).
    quality: 50,
    targetWidth: 640,
    correctOrientation: true,
    destinationType: 1, // FILE_URI
    encodingType: 0, // JPEG
    mediaType: 0, // PICTURE
    sourceType: 0 // PHOTOLIBRARY
  };
  // Prefer FILE_URI so preview can use Ionic.WebView.convertFileSrc (reliable on Android).
  options: CameraOptions = {
    quality: 50,
    allowEdit: false,
    targetWidth: 640,
    cameraDirection: 1,
    saveToPhotoAlbum: false,
    correctOrientation: true,
    destinationType: 1, // FILE_URI
    encodingType: 0, // JPEG
    mediaType: 0, // PICTURE
    sourceType: 1 // CAMERA
  };

  url = environment.SERVER_URL;

  private uploadingPending = false;

  constructor(public menuCtrl: MenuController,
    public actionsheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    public toastCtrl: ToastController,
    private platform: Platform,
    private router: Router,
    public str: Storage,
    public popoverController: ModalController,
    private file: File,
    private camera: Camera,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private zone: NgZone,
    private cdr: ChangeDetectorRef) {

    this.initAttendanceSession();

    // pendingResult may arrive after this page already constructed (WebView kill).
    this.platform.resume.subscribe(() => {
      this.consumePendingCameraImage();
      this.restorePreviewFromStorage();
    });
    document.addEventListener('resume', (event: any) => {
      this.stashPendingCameraFromEvent(event);
      this.consumePendingCameraImage();
      this.restorePreviewFromStorage();
    }, false);
  }

  private stashPendingCameraFromEvent(event: any) {
    try {
      const pending = event && event.pendingResult;
      if (!pending || pending.pluginServiceName !== 'Camera') {
        return;
      }
      if (localStorage.getItem('ktl_camera_pending') !== 'attendance') {
        return;
      }
      if (pending.pluginStatus === 'OK' && pending.result != null && pending.result !== '') {
        localStorage.setItem('ktl_pending_image', String(pending.result));
      } else if (pending.pluginStatus && pending.pluginStatus !== 'OK') {
        this.showPageError(this.friendlyCameraError(pending.pluginStatus));
      }
    } catch (e) {
      this.showPageError('Could not recover photo after camera closed. Please try again.');
    }
  }

  /** Show a clear error banner on this page (also toast for visibility). */
  private showPageError(message: string) {
    if (!message) {
      return;
    }
    this.zone.run(() => {
      this.pageError = message;
      this.pageSuccess = null;
      this.cdr.detectChanges();
      this.presentToast(message, 4500, 'bottom');
    });
  }

  private showPageSuccess(message: string) {
    this.zone.run(() => {
      this.pageSuccess = message;
      this.pageError = null;
      this.cdr.detectChanges();
      this.presentToast(message, 3500, 'bottom');
    });
  }

  clearPageMessage() {
    this.pageError = null;
    this.pageSuccess = null;
  }

  /** Map Cordova/camera plugin errors to user-friendly text. */
  private friendlyCameraError(err: any, source: 'camera' | 'gallery' = 'camera'): string {
    const raw = String(err == null ? '' : err);
    const lower = raw.toLowerCase();
    if (!raw || lower === 'null' || lower === 'undefined') {
      return source === 'gallery'
        ? 'Could not open gallery. Please try again.'
        : 'Could not open camera. Please try again.';
    }
    if (lower.indexOf('cancel') !== -1 || lower.indexOf('no image selected') !== -1) {
      return ''; // user cancelled — no error banner
    }
    if (lower.indexOf('permission') !== -1 || lower.indexOf('access') !== -1 || lower.indexOf('denied') !== -1) {
      return source === 'gallery'
        ? 'Gallery permission denied. Allow Photos/Storage in Phone Settings > Apps > KTL Plus > Permissions.'
        : 'Camera permission denied. Allow Camera in Phone Settings > Apps > KTL Plus > Permissions.';
    }
    if (lower.indexOf('unavailable') !== -1 || lower.indexOf('not available') !== -1) {
      return source === 'gallery'
        ? 'Gallery is not available on this device.'
        : 'Camera is not available on this device.';
    }
    return (source === 'gallery' ? 'Gallery error: ' : 'Camera error: ') + raw;
  }

  private isUserCancel(err: any): boolean {
    const lower = String(err == null ? '' : err).toLowerCase();
    return lower.indexOf('cancel') !== -1 || lower.indexOf('no image selected') !== -1;
  }

  /** Restore session + draft after camera WebView kills on some phones. */
  private async initAttendanceSession() {
    this.restoreAttendanceDraft();
    const id = await this.ensureSessionReady();
    if (id) {
      this.userid = id;
      this.getProfile(id);
      this.getLocation();
    }
    // If WebView was killed during camera, Cordova stashes the photo for us.
    await this.consumePendingCameraImage();
  }

  /** Show photo recovered from Cordova resume.pendingResult (do not upload until Submit). */
  private async consumePendingCameraImage() {
    const pending = localStorage.getItem('ktl_pending_image');
    if (!pending || this.uploadingPending) {
      return;
    }
    this.uploadingPending = true;
    localStorage.removeItem('ktl_pending_image');
    localStorage.removeItem('ktl_camera_pending');
    localStorage.removeItem('ktl_return_route');
    this.restoreAttendanceDraft();
    await this.ensureSessionReady();

    // FILE_URI path (file:// or content://)
    if (pending.indexOf('file:') === 0 || pending.indexOf('content:') === 0 || pending.indexOf('/') === 0) {
      this.uploadingPending = false;
      this.showSelectedImageFromFileUri(pending);
      return;
    }

    // DATA_URL result is raw base64 (sometimes already prefixed)
    const base64Image = pending.indexOf('data:image') === 0
      ? pending
      : 'data:image/jpeg;base64,' + pending;
    this.uploadingPending = false;
    this.showSelectedImage(base64Image);
  }

  private showSelectedImage(dataUrl: string) {
    // Cordova camera/gallery callbacks run outside NgZone — force UI refresh.
    this.zone.run(() => {
      void this.applyPreview(dataUrl);
    });
  }

  /**
   * Cordova Ionic WebView cannot reliably paint large data:/blob: URLs in <img>.
   * Write JPEG to cache, convert with Ionic.WebView.convertFileSrc, set img.src natively.
   */
  private async applyPreview(dataUrl: string) {
    try {
      if (!dataUrl || dataUrl.length < 32) {
        this.showPageError('Could not read photo. Please take or choose again.');
        return;
      }

      let normalized = dataUrl;
      if (normalized.indexOf('data:image') !== 0) {
        normalized = 'data:image/jpeg;base64,' + normalized.replace(/^data:image\/\w+;base64,/, '');
      }

      this.previewImage = normalized;
      this.hasPreview = true;
      this.pageError = null;
      try {
        localStorage.setItem('ktl_att_preview', normalized);
      } catch (e) {}
      this.saveAttendanceDraft();
      this.cdr.detectChanges();

      let displaySrc = normalized;
      try {
        if (this.platform.is('cordova') && this.file && this.file.cacheDirectory) {
          const blob = this.dataUrlToBlob(normalized);
          const fileName = 'ktl_att_preview_' + Date.now() + '.jpg';
          await this.file.writeFile(this.file.cacheDirectory, fileName, blob, { replace: true });
          displaySrc = this.toWebViewSrc(this.file.cacheDirectory + fileName);
        }
      } catch (e) {
        console.log('cache preview write failed', e);
        displaySrc = normalized;
      }

      this.paintPreviewElement(displaySrc, normalized);
      this.showPageSuccess('Photo ready — tap Submit Attendance.');
    } catch (e) {
      console.log('applyPreview error', e);
      this.showPageError('Failed to show photo preview. Please try again.');
    }
  }

  private toWebViewSrc(filePath: string): string {
    try {
      const Ionic = (window as any).Ionic;
      if (Ionic && Ionic.WebView && typeof Ionic.WebView.convertFileSrc === 'function') {
        return Ionic.WebView.convertFileSrc(filePath);
      }
      if ((window as any).wkWebView && (window as any).wkWebView.convertFilePath) {
        return (window as any).wkWebView.convertFilePath(filePath);
      }
    } catch (e) {}
    return filePath;
  }

  /** Assign img src natively with cache-bust so Change photo always refreshes. */
  private paintPreviewElement(displaySrc: string, fallbackDataUrl?: string | null) {
    setTimeout(() => {
      const el = this.previewImg && this.previewImg.nativeElement;
      if (!el) {
        this.cdr.detectChanges();
        return;
      }
      const bust = (displaySrc.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
      const src = displaySrc + bust;
      el.onload = () => this.cdr.detectChanges();
      el.onerror = () => {
        if (fallbackDataUrl && el.getAttribute('data-fallback') !== '1') {
          el.setAttribute('data-fallback', '1');
          // Last resort: try writing a tiny canvas-backed approach via object URL from data URL
          try {
            const blob = this.dataUrlToBlob(fallbackDataUrl);
            const obj = URL.createObjectURL(blob);
            el.src = obj;
          } catch (e) {
            console.log('preview paint fallback failed', e);
          }
        }
      };
      el.removeAttribute('data-fallback');
      el.removeAttribute('src');
      // Force decode of new image even when replacing gallery selection
      el.src = src;
      this.cdr.detectChanges();
    }, 80);
  }

  /** Show preview from a native file:// or content:// URI (camera/gallery FILE_URI). */
  private showSelectedImageFromFileUri(fileUri: string) {
    this.zone.run(() => {
      void this.applyPreviewFromFileUri(fileUri);
    });
  }

  private async applyPreviewFromFileUri(fileUri: string) {
    try {
      if (!fileUri) {
        this.showPageError('No photo returned. Please try again.');
        return;
      }

      this.hasPreview = true;
      this.pageError = null;
      this.cdr.detectChanges();

      let displaySrc = this.toWebViewSrc(fileUri);
      let uploadDataUrl: string | null = null;

      try {
        if (this.platform.is('cordova') && this.file && this.file.cacheDirectory) {
          const cached = await this.copyUriToCache(fileUri);
          if (cached) {
            displaySrc = this.toWebViewSrc(cached.path);
            uploadDataUrl = cached.dataUrl;
          }
        }
      } catch (e) {
        console.log('copyUriToCache failed', e);
      }

      if (!uploadDataUrl) {
        try {
          uploadDataUrl = await this.readUriAsDataUrl(fileUri);
        } catch (e) {
          console.log('readUriAsDataUrl failed', e);
        }
      }

      if (uploadDataUrl) {
        this.previewImage = uploadDataUrl;
        try {
          localStorage.setItem('ktl_att_preview', uploadDataUrl);
        } catch (e) {}
        this.saveAttendanceDraft();
      } else {
        this.showPageError('Photo selected but could not be prepared for upload. Please try another photo.');
      }

      this.paintPreviewElement(displaySrc, uploadDataUrl);
      if (uploadDataUrl) {
        this.showPageSuccess('Photo ready — tap Submit Attendance.');
      }
    } catch (e) {
      console.log('applyPreviewFromFileUri error', e);
      this.showPageError('Failed to show gallery/camera photo. Please try again.');
    }
  }

  /** Copy camera/gallery URI into cache; returns local file path + data URL. */
  private async copyUriToCache(fileUri: string): Promise<{ path: string; dataUrl: string } | null> {
    const fileName = 'ktl_att_preview_' + Date.now() + '.jpg';
    const destPath = this.file.cacheDirectory + fileName;

    // Prefer fetch via WebView-converted URL (works for content:// and file:// on Android).
    try {
      const webSrc = this.toWebViewSrc(fileUri);
      const resp = await fetch(webSrc);
      if (resp.ok) {
        const blob = await resp.blob();
        await this.file.writeFile(this.file.cacheDirectory, fileName, blob, { replace: true });
        const dataUrl = await this.blobToDataUrl(blob);
        return { path: destPath, dataUrl };
      }
    } catch (e) {
      console.log('fetch copyUriToCache failed', e);
    }

    // Fallback: File plugin resolve
    try {
      const entry: any = await this.file.resolveLocalFilesystemUrl(fileUri);
      if (entry && entry.isFile) {
        const fileEntry = entry as FileEntry;
        const dataUrl = await new Promise<string | null>((resolve) => {
          fileEntry.file((f) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(f);
          }, () => resolve(null));
        });
        if (dataUrl) {
          const blob = this.dataUrlToBlob(dataUrl);
          await this.file.writeFile(this.file.cacheDirectory, fileName, blob, { replace: true });
          return { path: destPath, dataUrl };
        }
      }
    } catch (e) {
      console.log('resolve copyUriToCache failed', e);
    }
    return null;
  }

  private async readUriAsDataUrl(fileUri: string): Promise<string | null> {
    try {
      const webSrc = this.toWebViewSrc(fileUri);
      const resp = await fetch(webSrc);
      if (resp.ok) {
        return await this.blobToDataUrl(await resp.blob());
      }
    } catch (e) {}
    try {
      const entry: any = await this.file.resolveLocalFilesystemUrl(fileUri);
      if (entry && entry.isFile) {
        const fileEntry = entry as FileEntry;
        return await new Promise<string | null>((resolve) => {
          fileEntry.file((f) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(f);
          }, () => resolve(null));
        });
      }
    } catch (e) {}
    return null;
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('blobToDataUrl failed'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',');
    const meta = parts[0] || '';
    const base64 = parts[1] || '';
    const mimeMatch = meta.match(/data:([^;]+);/);
    const mime = (mimeMatch && mimeMatch[1]) ? mimeMatch[1] : 'image/jpeg';
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  private restorePreviewFromStorage() {
    if (this.hasPreview && this.previewImage) {
      return;
    }
    try {
      const preview = localStorage.getItem('ktl_att_preview');
      if (preview) {
        this.showSelectedImage(preview);
      }
    } catch (e) {}
  }

  private setPreviewFromFile(file: Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.showSelectedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  /** Submit marks attendance only after user confirms the visible photo. */
  async submitAttendance() {
    try {
      this.clearPageMessage();
      if (!this.subject) {
        this.showPageError('Please select an option from the dropdown.');
        return;
      }
      if (!this.previewImage) {
        this.showPageError('Please take or choose a photo first.');
        return;
      }
      await this.readFileGallery(this.previewImage);
    } catch (e) {
      console.log('submitAttendance error', e);
      this.showPageError('Could not submit attendance. Please check internet and try again.');
    }
  }

  clearSelectedPhoto() {
    this.zone.run(() => {
      this.previewImage = null;
      this.hasPreview = false;
      localStorage.removeItem('ktl_att_preview');
      const el = this.previewImg && this.previewImg.nativeElement;
      if (el) {
        el.removeAttribute('src');
      }
      this.cdr.detectChanges();
    });
  }

  /** Ensure staff id exists in Ionic Storage and localStorage before camera opens. */
  private async ensureSessionReady(): Promise<any> {
    await this.str.create();
    let id = await this.str.get('id');
    if (!id || id === 'null') {
      id = localStorage.getItem('ktl_id');
      if (id && id !== 'null') {
        await this.str.set('id', id);
        for (const key of ['username', 'empid', 'otp', 'mobile']) {
          const v = localStorage.getItem('ktl_' + key);
          if (v != null && v !== '' && v !== 'null') {
            await this.str.set(key, v);
          }
        }
      }
    }
    if (id && id !== 'null') {
      this.userid = id;
      localStorage.setItem('ktl_id', String(id));
      // Mirror remaining session keys so a process kill during camera keeps login.
      for (const key of ['username', 'empid', 'otp', 'mobile']) {
        const v = await this.str.get(key);
        if (v != null && v !== '' && v !== 'null') {
          localStorage.setItem('ktl_' + key, String(v));
        }
      }
      return id;
    }
    return null;
  }

  private saveAttendanceDraft() {
    try {
      localStorage.setItem('ktl_att_draft', JSON.stringify({
        subject: this.subject || '',
        client: this.client || '',
        comment: this.comment || '',
        userid: this.userid || localStorage.getItem('ktl_id') || ''
      }));
    } catch (e) {}
  }

  private restoreAttendanceDraft() {
    try {
      const raw = localStorage.getItem('ktl_att_draft');
      if (!raw) {
        return;
      }
      const draft = JSON.parse(raw);
      if (draft.subject) {
        this.subject = draft.subject;
      }
      if (draft.client) {
        this.client = draft.client;
      }
      if (draft.comment) {
        this.comment = draft.comment;
      }
      if (draft.userid && !this.userid) {
        this.userid = draft.userid;
      }
      if (!this.previewImage) {
        const preview = localStorage.getItem('ktl_att_preview');
        if (preview) {
          this.previewImage = preview;
          this.hasPreview = true;
          setTimeout(() => void this.applyPreview(preview), 0);
        }
      }
    } catch (e) {}
  }

  private clearAttendanceDraft() {
    localStorage.removeItem('ktl_att_draft');
    localStorage.removeItem('ktl_att_preview');
    this.previewImage = null;
    this.hasPreview = false;
    const el = this.previewImg && this.previewImg.nativeElement;
    if (el) {
      el.removeAttribute('src');
    }
  }

  private prepareForCamera() {
    this.saveAttendanceDraft();
    localStorage.setItem('ktl_return_route', this.router.url || '/attandence');
    // Marks that the next Camera pendingResult belongs to Mark Attendance.
    localStorage.setItem('ktl_camera_pending', 'attendance');
    localStorage.removeItem('ktl_pending_image');
  }

  private clearCameraPending() {
    localStorage.removeItem('ktl_camera_pending');
    localStorage.removeItem('ktl_pending_image');
    localStorage.removeItem('ktl_return_route');
  }

  optionSelected() {

    if (this.subject == 'Reached Customer' || this.subject == 'Going to Customer') {

      this.presentPop(this.userid);
    }
  }


  async openePicChooser() {
    try {
      this.clearPageMessage();
      if (!this.subject) {
        this.showPageError('Please select an option from the dropdown first.');
        return;
      }
      const actionSheet = await this.actionsheetCtrl.create({
        header: 'Option',
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: 'Take photo',
            role: 'destructive',
            icon: !this.platform.is('ios') ? 'ios-camera-outline' : '',
            handler: () => {
              this.takePicture();
            }
          },
          {
            text: 'Choose photo from Gallery',
            icon: !this.platform.is('ios') ? 'ios-images-outline' : '',
            handler: () => {
               this.takePictureFile();
            }
          },
        ]
      });
      await actionSheet.present();
    } catch (e) {
      console.log('openePicChooser error', e);
      this.showPageError('Could not open photo options. Please try again.');
    }
  }

  async takePictureFile() {
    try {
      this.clearPageMessage();
      if (!this.subject) {
        this.showPageError('Please select an option from the dropdown.');
        return;
      }

      if (!this.platform.is('cordova')) {
        this.pickImageInBrowser(false);
        return;
      }

      const sessionOk = await this.ensureSessionReady();
      if (!sessionOk) {
        this.showPageError('Session expired. Please login again.');
        this.router.navigate(['/login']);
        return;
      }

      this.prepareForCamera();

      try {
        const imageData = await this.camera.getPicture(this.optionsGallery);
        this.clearCameraPending();
        const uri = String(imageData || '');
        if (!uri) {
          this.showPageError('No photo selected from gallery. Please try again.');
          return;
        }
        if (uri.indexOf('file:') === 0 || uri.indexOf('content:') === 0 || uri.indexOf('/') === 0) {
          this.showSelectedImageFromFileUri(uri);
        } else {
          this.showSelectedImage(uri.indexOf('data:image') === 0 ? uri : 'data:image/jpeg;base64,' + uri);
        }
      } catch (err) {
        this.clearCameraPending();
        if (this.isUserCancel(err)) {
          return;
        }
        this.showPageError(this.friendlyCameraError(err, 'gallery'));
      }
    } catch (e) {
      this.clearCameraPending();
      console.log('takePictureFile error', e);
      this.showPageError(this.friendlyCameraError(e, 'gallery'));
    }
  }

  // Gallery: standard file picker. Camera: live webcam overlay (works on laptop + phone browsers).
  pickImageInBrowser(useCamera: boolean) {
    if (useCamera) {
      this.openLaptopCamera();
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        this.setPreviewFromFile(input.files[0]);
      }
    };
    input.click();
  }

  async openLaptopCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.showPageError('Camera is not supported in this browser.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
    } catch (err) {
      this.showPageError('Please allow camera access in the browser, then try again.');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'ktl-camera-overlay';
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
    captureBtn.style.cssText = 'padding:12px 28px;border:0;border-radius:24px;background:#279CFF;color:#fff;font-size:16px;cursor:pointer;';

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
      const previewDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      this.showSelectedImage(previewDataUrl);
      stopCamera();
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(captureBtn);
    overlay.appendChild(video);
    overlay.appendChild(btnRow);
    document.body.appendChild(overlay);
  }

  async readFileGallery(file: any) {
    try {
      this.presentLoading();
      const sessionId = await this.ensureSessionReady();
      this.restoreAttendanceDraft();
      if (!sessionId && !this.userid) {
        this.dismiss();
        this.showPageError('Session expired. Please login again.');
        this.router.navigate(['/login']);
        return;
      }

      try {
        const resp = await this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        this.lat = resp.coords.latitude;
        this.long = resp.coords.longitude;
      } catch (error) {
        console.log('Error getting location', error);
        // Continue upload; location optional but warn on page
        this.pageError = 'Location not available. Submitting without GPS — enable Location for accurate attendance.';
        this.cdr.detectChanges();
      }

      let headers = new HttpHeaders();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');

      const formData = new FormData();
      formData.append('staff_id', this.userid || localStorage.getItem('ktl_id') || '');
      formData.append('lat', this.lat || '');
      formData.append('long', this.long || '');
      formData.append('position', this.subject || '');
      formData.append('client', this.client || '');
      formData.append('comment', this.comment || '');
      formData.append('file', file);

      this.http.post(this.url + 'uploads-attendance-base', formData, { headers: headers }).subscribe((data: any) => {
        try {
          this.clearAttendanceDraft();
          this.client = "";
          this.lat = "";
          this.long = "";
          this.comment = "";
          this.subject = "";
          this.dismiss();
          if (data && (data.status === false || data.status === 0)) {
            this.showPageError(data.message || 'Attendance upload failed. Please try again.');
          } else {
            this.showPageSuccess(data && data.message ? data.message : 'Attendance marked successfully.');
          }
        } catch (e) {
          this.dismiss();
          this.showPageError('Attendance response error. Please check My Attendance.');
        }
      }, error => {
        this.dismiss();
        console.log('upload error', error);
        this.showPageError('Upload failed. Please check your internet connection and try again.');
      });
    } catch (e) {
      try { this.dismiss(); } catch (ignore) {}
      console.log('readFileGallery error', e);
      this.showPageError('Could not upload attendance. Please try again.');
    }
  }






  async presentPop(id: any) {
    const popover = await this.popoverController.create({
      component: ClientsPage,
      componentProps: { head: 'Order Confirmation', header: 'Order Uploaded Successfully.', userid: id }

    });

    popover.onDidDismiss()
      .then((result) => {
        if (result && result['data'] && result['data'].client) {
          this.client = result['data'].client;
        } else {
          // Modal was closed without choosing a client; reset the dropdown
          this.client = '';
          this.subject = '';
        }
      });

    return await popover.present();

  }
  getProfile(userid:any) {
    let headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');

    let datap = { staff_id: userid };
    this.http.post(this.url + 'get-staff', datap, { headers: headers }).subscribe((data: any) => {

      if (data.status) {
        this.name = data.data.name;
        this.empcode = data.data.employee_code;
        this.phone = data.data.phone;
        this.address = data.data.address;
        this.department = data.data.department;
        this.designation = data.data.designation;
        this.branchname = data.data.branch_name;
        this.dob = data.data.dob;
        this.doj = data.data.doj;
        if (data.image_path == '') {
          this.image = 'assets/profile.jpg';
        }
        else {
          //this.image="";
          this.image = data.image_path;
        }

      } else {
        //this.presentToast(res.message,3000,'middle')
      }
    }, err => { })
  }


  readFile(file: any) {

    this.presentLoading();
    const reader = new FileReader();

    reader.onloadend = async () => {
      await this.ensureSessionReady();
      this.restoreAttendanceDraft();

      const imgBlob = new Blob([reader.result as ArrayBuffer], {
        type: file.type
      });

      try {
        const resp = await this.geolocation.getCurrentPosition({ enableHighAccuracy: true });
        this.lat = resp.coords.latitude;
        this.long = resp.coords.longitude;
      } catch (error) {
        console.log('Error getting location', error);
      }

      let headers = new HttpHeaders();
      headers.append("Accept", 'application/json');
      headers.append('Content-Type', 'application/json');

      const formData = new FormData();
      formData.append('staff_id', this.userid || localStorage.getItem('ktl_id') || '');
      formData.append('lat', this.lat || '');
      formData.append('long', this.long || '');
      formData.append('position', this.subject || '');
      formData.append('client', this.client || '');
      formData.append('comment', this.comment || '');

      formData.append('file', imgBlob, file.name);

      this.http.post(this.url + 'uploads-attendance', formData, { headers: headers }).subscribe((data: any) => {

        if (data.status)
          console.log(data);
        this.clearAttendanceDraft();
        this.client = "";
        this.lat = "";
        this.long = "";
        this.comment = "";
        this.subject = "";
        this.dismiss();
        this.presentToast(data.message, 4000, "bottom");
      }, error => {
        this.dismiss();
        this.presentToast('Please check your internet Connection.', 3000, 'middle')
        this.presentToast("Error uploading. Please try again.", 4000, "bottom");
      });
    };
    reader.readAsArrayBuffer(file);
  }

  async takePicture() {
    try {
      this.clearPageMessage();
      if (!this.subject) {
        this.showPageError('Please select an option from the dropdown.');
        return;
      }

      if (!this.platform.is('cordova')) {
        this.pickImageInBrowser(true);
        return;
      }

      const sessionOk = await this.ensureSessionReady();
      if (!sessionOk) {
        this.showPageError('Session expired. Please login again.');
        this.router.navigate(['/login']);
        return;
      }

      const allowed = await this.ensureCameraPermission();
      if (!allowed) {
        this.showPageError('Camera permission is required. Allow Camera in Phone Settings > Apps > KTL Plus > Permissions.');
        return;
      }

      this.options.cameraDirection = this.camera.Direction.FRONT;
      this.prepareForCamera();

      try {
        const imageData = await this.camera.getPicture(this.options);
        this.clearCameraPending();
        if (!imageData) {
          this.showPageError('Camera did not return a photo. Please try again.');
          return;
        }
        if (String(imageData).indexOf('file:') === 0 || String(imageData).indexOf('content:') === 0 || String(imageData).indexOf('/') === 0) {
          this.showSelectedImageFromFileUri(String(imageData));
        } else {
          this.showSelectedImage('data:image/jpeg;base64,' + imageData);
        }
      } catch (err) {
        this.clearCameraPending();
        if (this.isUserCancel(err)) {
          return;
        }
        this.showPageError(this.friendlyCameraError(err, 'camera'));
      }
    } catch (e) {
      this.clearCameraPending();
      console.log('takePicture error', e);
      this.showPageError(this.friendlyCameraError(e, 'camera'));
    }
  }

  async showCameraError(errText: string) {
    this.showPageError(this.friendlyCameraError(errText, 'camera'));
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

  async presentLoading() {
    this.isLoading = true;
    return await this.loadingCtrl.create({
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
  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }

  ngOnInit() {


    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.long = resp.coords.longitude;
    }).catch((error) => {
      this.showPageError('Location is off or unavailable. Enable Location for accurate attendance.');
    });

    this.restorePreviewFromStorage();
  }

  ionViewWillEnter() {
    this.restorePreviewFromStorage();
    this.consumePendingCameraImage();
  }


  // Checks CAMERA permission and keeps insisting until the user grants it.
  async ensureCameraPermission(): Promise<boolean> {
    try {
      const status = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.CAMERA
      );
      if (status.hasPermission) {
        return true;
      }

      const request = await this.androidPermissions.requestPermission(
        this.androidPermissions.PERMISSION.CAMERA
      );
      if (request.hasPermission) {
        return true;
      }

      // User denied: keep insisting with a blocking alert until granted
      return await this.showCameraPermissionAlert();
    } catch (error) {
      console.error('Camera permission check error:', error);
      // If the permission plugin itself fails, let the camera plugin try anyway
      return true;
    }
  }

  showCameraPermissionAlert(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: 'Camera Permission Required',
        message: 'Attendance photo cannot be taken without camera access. ' +
          'Please allow the camera permission. If no permission popup appears, enable it manually: ' +
          'Phone Settings > Apps > KTL Plus > Permissions > Camera > Allow.',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.presentToast('Camera permission is required to upload attendance.', 4000, 'bottom');
              resolve(false);
            }
          },
          {
            text: 'Allow Camera',
            handler: () => {
              this.androidPermissions.requestPermission(
                this.androidPermissions.PERMISSION.CAMERA
              ).then((result) => {
                if (result.hasPermission) {
                  resolve(true);
                } else {
                  // Still denied: insist again
                  this.showCameraPermissionAlert().then(resolve);
                }
              }, () => {
                this.showCameraPermissionAlert().then(resolve);
              });
            }
          }
        ]
      });
      await alert.present();
    });
  }

  async getLocation(): Promise<boolean> {
    try {
      const locationStatus = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
      );
  
      if (!locationStatus.hasPermission) {
        const locationRequest = await this.androidPermissions.requestPermission(
          this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
        );
        if (!locationRequest.hasPermission) return false;
      }
  
      const storageStatus = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
      );
  
      if (!storageStatus.hasPermission) {
        const storageRequest = await this.androidPermissions.requestPermission(
          this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        );
        if (!storageRequest.hasPermission) return false;
      }
  
      return true;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }
  

}
