import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pendingindent',
  templateUrl: './pendingindent.page.html',
  styleUrls: ['./pendingindent.page.scss'],
  standalone: false,
})
export class PendingindentPage implements OnInit {
  userid: any;
  fromdate = '';
  todate = '';
  role = '';
  tabs: { name: string; rows: any[] }[] = [];
  isLoading = false;
  loaded = false;
  unauthorized = false;
  showColumnPicker = false;
  url = environment.SERVER_URL;
  private readonly COLS_KEY = 'ktl_pending_indent_cols';

  columns: { key: string; label: string; visible: boolean; numeric?: boolean }[] = [
    { key: 'indent_num', label: 'Indent', visible: true },
    { key: 'created_at', label: 'Date', visible: true },
    { key: 'purchase_order_no', label: 'PO', visible: true },
    { key: 'client_name', label: 'Client', visible: true },
    { key: 'article_name', label: 'Article', visible: true },
    { key: 'shade_name', label: 'Shade', visible: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'remarks', label: 'Remarks', visible: true },
    { key: 'total_order', label: 'Order', visible: true, numeric: true },
    { key: 'transit_qty', label: 'Transit', visible: true, numeric: true },
    { key: 'total_dispatch', label: 'Dispatch', visible: true, numeric: true },
    { key: 'total_pending', label: 'Pending', visible: true, numeric: true },
    { key: 'days', label: 'Days', visible: true, numeric: true },
  ];

  constructor(
    private http: HttpClient,
    private str: Storage,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    const today = this.toIsoDate(new Date());
    const from = new Date();
    from.setMonth(from.getMonth() - 3);
    this.todate = today;
    this.fromdate = this.toIsoDate(from);

    this.str.get('id').then((value) => {
      this.userid = value || localStorage.getItem('ktl_id');
    });
    this.restoreColumnPrefs();
  }

  visibleColumns() {
    return this.columns.filter((c) => c.visible);
  }

  toggleColumnPicker() {
    this.showColumnPicker = !this.showColumnPicker;
  }

  toggleColumn(col: { key: string; visible: boolean }) {
    col.visible = !col.visible;
    if (!this.columns.some((c) => c.visible)) {
      col.visible = true;
    }
    this.saveColumnPrefs();
  }

  showAllColumns() {
    this.columns.forEach((c) => (c.visible = true));
    this.saveColumnPrefs();
  }

  private restoreColumnPrefs() {
    try {
      const raw = localStorage.getItem(this.COLS_KEY);
      if (!raw) {
        return;
      }
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') {
        return;
      }
      this.columns.forEach((c) => {
        if (typeof saved[c.key] === 'boolean') {
          c.visible = saved[c.key];
        }
      });
      if (!this.columns.some((c) => c.visible)) {
        this.columns.forEach((c) => (c.visible = true));
      }
    } catch {
      // ignore
    }
  }

  private saveColumnPrefs() {
    const prefs: Record<string, boolean> = {};
    this.columns.forEach((c) => {
      prefs[c.key] = c.visible;
    });
    localStorage.setItem(this.COLS_KEY, JSON.stringify(prefs));
  }

  loadReport() {
    if (!this.userid) {
      this.presentToast('Please login again.', 3000, 'middle');
      return;
    }
    if (!this.fromdate || !this.todate) {
      this.presentToast('Select From and To date.', 2500, 'middle');
      return;
    }

    this.presentLoading();
    this.unauthorized = false;
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const datap = {
      staffid: this.userid,
      appuser_id: this.userid,
      fromdate: this.fromdate,
      todate: this.todate
    };

    this.http.post(this.url + 'pending-indent-report', datap, { headers }).subscribe((data: any) => {
      this.dismiss();
      this.loaded = true;
      if (data?.status === false) {
        this.unauthorized = (data?.message || '').toString().toLowerCase().includes('not authorized');
        this.tabs = [];
        this.presentToast(data?.message || 'Could not load pending indent.', 3000, 'middle');
        return;
      }
      this.role = data?.role || '';
      const raw = data?.tabs || {};
      this.tabs = [
        { name: 'Direct', rows: Array.isArray(raw.Direct) ? raw.Direct : [] },
        { name: 'LAPDIP/SAMPLE', rows: Array.isArray(raw['LAPDIP-SAMPLE']) ? raw['LAPDIP-SAMPLE'] : [] }
      ];
    }, (err) => {
      this.dismiss();
      this.loaded = true;
      this.tabs = [];
      if (err?.status === 403) {
        this.unauthorized = true;
        this.presentToast(err?.error?.message || 'Not authorized', 3000, 'middle');
        return;
      }
      this.presentToast('Please check your internet connection.', 3000, 'middle');
    });
  }

  cellValue(row: any, key: string) {
    if (!row) {
      return '';
    }
    return row[key];
  }

  hasRows(): boolean {
    return this.tabs.some((t) => t.rows && t.rows.length > 0);
  }

  doRefresh(event: any) {
    if (this.fromdate && this.todate) {
      this.loadReport();
    }
    setTimeout(() => event?.target?.complete?.(), 600);
  }

  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async presentLoading() {
    this.isLoading = true;
    await this.loadingCtrl.create({ message: 'Loading pending indent...' }).then(a => {
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
      // ignore
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
