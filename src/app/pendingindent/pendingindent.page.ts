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
  allTabs: { name: string; rows: any[] }[] = [];
  tabs: { name: string; rows: any[] }[] = [];
  selectedBranch = '';
  selectedClient = '';
  selectedBranchLabel = '';
  selectedClientLabel = '';
  allBranches: { code: string; name: string }[] = [];
  branchOptions: { code: string; name: string }[] = [];
  clientOptions: { id: string; name: string; branch: string }[] = [];
  branchSearch = '';
  clientSearch = '';
  branchOpen = false;
  clientOpen = false;
  clientLoading = false;
  private clientSearchTimer: any = null;
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
    { key: 'branch', label: 'Branch', visible: true },
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
      this.loadLookups();
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
        this.allTabs = [];
        this.tabs = [];
        this.presentToast(data?.message || 'Could not load pending indent.', 3000, 'middle');
        return;
      }
      this.role = data?.role || '';
      const raw = data?.tabs || {};
      this.allTabs = [
        { name: 'Direct', rows: Array.isArray(raw.Direct) ? raw.Direct : [] },
        { name: 'LAPDIP/SAMPLE', rows: Array.isArray(raw['LAPDIP-SAMPLE']) ? raw['LAPDIP-SAMPLE'] : [] }
      ];
      this.applyFilters();
    }, (err) => {
      this.dismiss();
      this.loaded = true;
      this.allTabs = [];
      this.tabs = [];
      if (err?.status === 403) {
        this.unauthorized = true;
        this.presentToast(err?.error?.message || 'Not authorized', 3000, 'middle');
        return;
      }
      this.presentToast('Please check your internet connection.', 3000, 'middle');
    });
  }

  loadLookups() {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    this.http.get(this.url + 'get-branch', { headers }).subscribe((data: any) => {
      const rows = data?.data || data?.branches || [];
      if (Array.isArray(rows) && rows.length) {
        this.allBranches = rows.map((row: any) => ({
          code: String(row.branch_code || row.code || row.branch || ''),
          name: String(row.branch_name || row.name || row.branch_code || row.code || '')
        })).filter((row: any) => row.code);
        this.filterBranchOptions();
      }
    });
  }

  toggleBranchSelect() {
    this.branchOpen = !this.branchOpen;
    this.clientOpen = false;
    this.branchSearch = '';
    this.filterBranchOptions();
  }

  toggleClientSelect() {
    this.clientOpen = !this.clientOpen;
    this.branchOpen = false;
    this.clientSearch = '';
    if (this.clientOpen) {
      this.searchClients();
    }
  }

  filterBranchOptions() {
    const q = this.branchSearch.trim().toLowerCase();
    this.branchOptions = this.allBranches.filter((b) =>
      !q || b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)
    );
  }

  onClientSearchChange() {
    clearTimeout(this.clientSearchTimer);
    this.clientSearchTimer = setTimeout(() => this.searchClients(), 300);
  }

  searchClients() {
    const search = this.clientSearch.trim();
    const branch = this.selectedBranch;
    if (search.length < 2 && !branch) {
      this.clientOptions = [];
      this.clientLoading = false;
      return;
    }

    this.clientLoading = true;
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const applyRows = (rows: any[]) => {
      this.clientOptions = (Array.isArray(rows) ? rows : []).map((row: any) => ({
        id: String(row.id || row.client_id || row.clientid || ''),
        name: String(row.name || row.client_name || row.clientname || ''),
        branch: String(row.branch || row.branch_code || '')
      })).filter((row: any) => row.id && row.name).slice(0, 20);
    };

    const fail = () => {
      if (!branch) {
        this.clientLoading = false;
        this.clientOptions = [];
        return;
      }
      this.http.post(this.url + 'get-branch-client-pagewise', {
        branchcode: branch,
        name: search,
        id: 0
      }, { headers }).subscribe((data: any) => {
        this.clientLoading = false;
        applyRows(data?.client || data?.clients || []);
      }, () => {
        this.clientLoading = false;
        this.clientOptions = [];
      });
    };

    this.http.post(this.url + 'pending-indent-clients', {
      search,
      name: search,
      branch,
      branchcode: branch
    }, { headers }).subscribe((data: any) => {
      this.clientLoading = false;
      applyRows(data?.clients || data?.client || data?.data || []);
    }, fail);
  }

  pickBranch(item: { code: string; name: string } | null) {
    this.selectedBranch = item ? item.code : '';
    this.selectedBranchLabel = item ? (item.name + (item.code && item.name !== item.code ? ' (' + item.code + ')' : '')) : '';
    this.branchOpen = false;
    this.branchSearch = '';
    this.selectedClient = '';
    this.selectedClientLabel = '';
    this.clientOptions = [];
    this.applyFilters();
    if (this.selectedBranch) {
      this.searchClients();
    }
  }

  pickClient(item: { id: string; name: string } | null) {
    this.selectedClient = item ? item.id : '';
    this.selectedClientLabel = item ? item.name : '';
    this.clientOpen = false;
    this.clientSearch = '';
    this.applyFilters();
  }

  applyFilters() {
    this.tabs = this.allTabs.map((tab) => ({
      name: tab.name,
      rows: (tab.rows || []).filter((row) => this.rowMatches(row))
    }));
  }

  private rowMatches(row: any): boolean {
    const branch = (row.branch || row.from_branch_code || row.branch_code || '').toString().trim();
    if (this.selectedBranch && branch !== this.selectedBranch) {
      return false;
    }
    if (this.selectedClient) {
      const id = String(row.client_id || '');
      const name = (row.client_name || '').toString();
      if (id !== this.selectedClient && name !== this.selectedClient) {
        return false;
      }
    }
    return true;
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
