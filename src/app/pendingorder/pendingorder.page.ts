import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pendingorder',
  templateUrl: './pendingorder.page.html',
  styleUrls: ['./pendingorder.page.scss'],
  standalone: false,
})
export class PendingorderPage implements OnInit {
  userid: any;
  fromdate = '';
  todate = '';
  role = '';
  rows: any[] = [];
  page = 1;
  readonly pageSize = 50;
  total = 0;
  hasMore = false;
  loadProgress = 0;
  isLoadingMore = false;
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
  private readonly COLS_KEY = 'ktl_pending_order_cols';

  columns: { key: string; label: string; visible: boolean; numeric?: boolean }[] = [
    { key: 'client_name', label: 'Customer', visible: true },
    { key: 'created_at', label: 'Date', visible: true },
    { key: 'po_number', label: 'PO', visible: true },
    { key: 'po_date', label: 'PO Date', visible: true },
    { key: 'article', label: 'Article', visible: true },
    { key: 'shade', label: 'Shade', visible: true },
    { key: 'ordered_qty', label: 'Order Qty', visible: true, numeric: true },
    { key: 'pending', label: 'Pending', visible: true, numeric: true },
    { key: 'branch_stock', label: 'Branch Stock', visible: true, numeric: true },
    { key: 'factory_pending', label: 'Factory Pending', visible: true, numeric: true },
    { key: 'days', label: 'Days', visible: true, numeric: true },
    { key: 'rate', label: 'Rate', visible: false, numeric: true },
    { key: 'value', label: 'Value', visible: false, numeric: true },
    { key: 'branch', label: 'Branch', visible: true },
  ];

  constructor(
    private http: HttpClient,
    private str: Storage,
    public toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    const today = this.toIsoDate(new Date());
    const from = new Date();
    from.setDate(from.getDate() - 30);
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

    this.unauthorized = false;
    this.loaded = false;
    this.rows = [];
    this.page = 1;
    this.total = 0;
    this.hasMore = false;
    this.loadProgress = 0;
    this.isLoading = true;
    this.isLoadingMore = false;
    this.fetchPage(1, false);
  }

  onTableScroll(event: any) {
    const el = event?.target;
    if (!el || this.isLoading || this.isLoadingMore || !this.hasMore) {
      return;
    }
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      this.fetchPage(this.page + 1, true);
    }
  }

  private fetchPage(page: number, append: boolean) {
    if (append) {
      this.isLoadingMore = true;
    } else {
      this.isLoading = true;
      this.loadProgress = 0;
    }

    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const datap: any = {
      staffid: this.userid,
      appuser_id: this.userid,
      fromdate: this.fromdate,
      todate: this.todate,
      page,
      limit: this.pageSize
    };
    if (this.selectedBranch) {
      datap.branch = this.selectedBranch;
    }
    if (this.selectedClient) {
      datap.client_id = this.selectedClient;
    }

    this.http.post(this.url + 'pending-order-report', datap, { headers }).subscribe((data: any) => {
      this.loaded = true;
      this.isLoading = false;
      this.isLoadingMore = false;
      if (data?.status === false) {
        this.unauthorized = (data?.message || '').toString().toLowerCase().includes('not authorized');
        this.rows = [];
        this.hasMore = false;
        this.loadProgress = 0;
        this.presentToast(data?.message || 'Could not load pending order.', 3000, 'middle');
        return;
      }
      this.role = data?.role || '';
      const nextRows = Array.isArray(data?.rows) ? data.rows : [];
      this.page = Number(data?.page || page);
      this.total = Number(data?.total || 0);
      this.hasMore = !!data?.has_more;
      this.rows = append ? this.rows.concat(nextRows) : nextRows;
      this.loadProgress = this.total > 0 ? Math.min(1, this.rows.length / this.total) : 1;
    }, (err) => {
      this.loaded = true;
      this.isLoading = false;
      this.isLoadingMore = false;
      this.loadProgress = 0;
      if (!append) {
        this.rows = [];
      }
      this.hasMore = false;
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
    if (this.selectedBranch) {
      this.searchClients();
    }
  }

  pickClient(item: { id: string; name: string } | null) {
    this.selectedClient = item ? item.id : '';
    this.selectedClientLabel = item ? item.name : '';
    this.clientOpen = false;
    this.clientSearch = '';
  }

  cellValue(row: any, key: string) {
    if (!row) {
      return '';
    }
    return row[key];
  }

  hasRows(): boolean {
    return this.rows.length > 0;
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

  presentToast(msg: any, durat: any, pos: any) {
    this.toastCtrl.create({
      message: msg,
      duration: durat,
      position: pos
    }).then((toastData) => toastData.present());
  }
}
