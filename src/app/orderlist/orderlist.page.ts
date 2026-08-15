import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-orderlist',
  templateUrl: './orderlist.page.html',
  styleUrls: ['./orderlist.page.scss'],
  standalone: false,
})
export class OrderlistPage implements OnInit {
  userid: any;
  orders: any[] = [];
  isLoading = false;
  url = environment.SERVER_URL;
  previewUrl: string | null = null;
  previewTitle = '';

  constructor(
    private http: HttpClient,
    private str: Storage,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.str.get('id').then((value) => {
      this.userid = value;
      if (this.userid) {
        this.loadOrders();
      }
    });
  }

  loadOrders() {
    this.presentLoading();
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const datap = { appuser_id: this.userid, staffid: this.userid, user_id: this.userid };
    this.http.post(this.url + 'get-employee-orders', datap, { headers }).subscribe((data: any) => {
      this.dismiss();
      const rows = data?.data || data?.result || data?.orders || [];
      this.orders = Array.isArray(rows) ? rows.map((row: any) => this.normalizeRow(row)) : [];
      if (!data?.status && data?.success === false && !this.orders.length) {
        this.presentToast(data?.message || 'Could not load orders.', 3000, 'bottom');
      }
    }, () => {
      this.dismiss();
      this.presentToast('Please check your internet connection.', 3000, 'middle');
    });
  }

  private normalizeRow(row: any) {
    const clientName = row.client_name || row.clientname || row.customer_name || row.company || row.name || '—';
    const rawDate = row.order_date || row.created_at || row.date || row.orderdate || row.uploaded_at || '';
    const imageName = row.image || row.order_image || row.picture || row.photo || row.file || '';
    // Folder for uploads/order/{folder}/{file} — prefer client_id (same as Order Status)
    const folder = row.client_id || row.clientid || row.customer_id || row.orderno || row.order_id || row.id;
    const imageUrl = this.buildImageUrl(imageName, folder, row.image_url || row.imageUrl || row.photo_url);
    return {
      ...row,
      clientName,
      orderDate: this.formatOrderDate(rawDate),
      imageUrl,
      imageFallbacks: this.buildImageFallbacks(imageName, folder, imageUrl)
    };
  }

  /** Show a clean date like 15 Aug 2026 (and time if present). */
  private formatOrderDate(value: any): string {
    if (value == null || value === '') {
      return '—';
    }

    const raw = String(value).trim();
    // Already a short date like 15-08-2026 / 15/08/2026
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(raw)) {
      return raw.replace(/-/g, '/');
    }

    // MySQL / ISO: 2026-08-15 10:30:00 or 2026-08-15T10:30:00.000000Z
    const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
    const d = new Date(normalized);
    if (isNaN(d.getTime())) {
      // Fallback: take date part only if "YYYY-MM-DD ..."
      const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        return `${m[3]}/${m[2]}/${m[1]}`;
      }
      return raw.length > 16 ? raw.slice(0, 16) : raw;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate().toString().padStart(2, '0');
    const mon = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours();
    const mins = d.getMinutes();
    const hasTime = hours !== 0 || mins !== 0 || /T|\d{2}:\d{2}/.test(raw);
    if (!hasTime) {
      return `${day} ${mon} ${year}`;
    }
    const hh = hours.toString().padStart(2, '0');
    const mm = mins.toString().padStart(2, '0');
    return `${day} ${mon} ${year}, ${hh}:${mm}`;
  }

  private uploadHosts(): string[] {
    const fromEnv = this.url.replace(/\/api\/?$/, '');
    const hosts = [fromEnv, 'https://test.ktl.in', 'https://manage.ktl.in'];
    return [...new Set(hosts.filter(Boolean))];
  }

  private buildImageUrl(image: any, folder: any, absolute?: any): string {
    if (absolute) {
      const abs = String(absolute).trim();
      if (abs.startsWith('http')) {
        return abs;
      }
      if (abs.startsWith('/')) {
        return this.uploadHosts()[0] + abs;
      }
      if (abs.includes('uploads/')) {
        return this.uploadHosts()[0] + '/' + abs.replace(/^\//, '');
      }
    }

    if (!image) {
      return '';
    }

    let path = String(image).trim();
    if (!path) {
      return '';
    }
    if (path.startsWith('http')) {
      return path;
    }
    if (path.startsWith('/')) {
      return this.uploadHosts()[0] + path;
    }
    // Already a relative upload path
    if (path.startsWith('uploads/')) {
      return this.uploadHosts()[0] + '/' + path;
    }

    const base = this.uploadHosts()[0] + '/uploads/order';
    // image may already be "{clientId}/{file}.jpg"
    if (path.includes('/')) {
      return `${base}/${path.replace(/^\/+/, '')}`;
    }
    if (folder != null && folder !== '') {
      return `${base}/${folder}/${path}`;
    }
    return `${base}/${path}`;
  }

  private buildImageFallbacks(image: any, folder: any, primary: string): string[] {
    if (!image && !primary) {
      return [];
    }
    const pathPart = (() => {
      const p = String(image || '').trim();
      if (!p || p.startsWith('http')) {
        return '';
      }
      if (p.includes('/')) {
        return p.replace(/^\/+/, '').replace(/^uploads\/order\//, '');
      }
      if (folder != null && folder !== '') {
        return `${folder}/${p}`;
      }
      return p;
    })();

    const urls: string[] = [];
    if (primary) {
      urls.push(primary);
    }
    for (const host of this.uploadHosts()) {
      if (pathPart) {
        urls.push(`${host}/uploads/order/${pathPart}`);
      }
      // Also try without folder if we used one
      if (image && !String(image).includes('/') && folder) {
        urls.push(`${host}/uploads/order/${String(image).trim()}`);
      }
    }
    return [...new Set(urls.filter(Boolean))];
  }

  openImage(row: any) {
    if (!row?.imageUrl) {
      this.presentToast('No order picture available.', 2500, 'bottom');
      return;
    }
    this.previewTitle = row.clientName || 'Order picture';
    this.previewUrl = row.imageUrl;
  }

  onThumbError(event: Event, row: any) {
    const el = event?.target as HTMLImageElement | null;
    if (!el || !row) {
      return;
    }
    const tried = Number(el.dataset['try'] || 0);
    const fallbacks: string[] = row.imageFallbacks || [];
    const next = tried + 1;
    if (next < fallbacks.length) {
      el.dataset['try'] = String(next);
      el.src = fallbacks[next];
      row.imageUrl = fallbacks[next];
      return;
    }
    el.style.opacity = '0.3';
  }

  onPreviewError(event: Event) {
    // keep viewer open; thumb fallback already updates row.imageUrl when possible
    const el = event?.target as HTMLImageElement | null;
    if (el) {
      el.alt = 'Image not available';
    }
  }

  closePreview() {
    this.previewUrl = null;
    this.previewTitle = '';
  }

  doRefresh(event: any) {
    this.loadOrders();
    setTimeout(() => event?.target?.complete?.(), 600);
  }

  async presentLoading() {
    this.isLoading = true;
    await this.loadingCtrl.create({ message: 'Loading orders...' }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss();
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    try {
      await this.loadingCtrl.dismiss();
    } catch {
      // ignore if no loader
    }
  }

  presentToast(msg: any, durat: any, pos: any) {
    this.toastCtrl.create({
      message: msg,
      duration: durat,
      position: pos
    }).then((toastData) => toastData.present());
  }
}
