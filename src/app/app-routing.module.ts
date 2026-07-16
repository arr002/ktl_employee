import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'accountstatement',
    loadChildren: () => import('./accountstatement/accountstatement.module').then( m => m.AccountstatementPageModule)
  },
  {
    path: 'adminseal',
    loadChildren: () => import('./adminseal/adminseal.module').then( m => m.AdminsealPageModule)
  },
  {
    path: 'allattendance',
    loadChildren: () => import('./allattendance/allattendance.module').then( m => m.AllattendancePageModule)
  },
  {
    path: 'attandence',
    loadChildren: () => import('./attandence/attandence.module').then( m => m.AttandencePageModule)
  },
  {
    path: 'branchmanagers',
    loadChildren: () => import('./branchmanagers/branchmanagers.module').then( m => m.BranchmanagersPageModule)
  },
  {
    path: 'buddy',
    loadChildren: () => import('./buddy/buddy.module').then( m => m.BuddyPageModule)
  },
  {
    path: 'buddyattendance',
    loadChildren: () => import('./buddyattendance/buddyattendance.module').then( m => m.BuddyattendancePageModule)
  },
  {
    path: 'clientdashboard',
    loadChildren: () => import('./clientdashboard/clientdashboard.module').then( m => m.ClientdashboardPageModule)
  },
  {
    path: 'clients',
    loadChildren: () => import('./clients/clients.module').then( m => m.ClientsPageModule)
  },
  {
    path: 'courier',
    loadChildren: () => import('./courier/courier.module').then( m => m.CourierPageModule)
  },
  {
    path: 'creditnotes',
    loadChildren: () => import('./creditnotes/creditnotes.module').then( m => m.CreditnotesPageModule)
  },
  {
    path: 'customer',
    loadChildren: () => import('./customer/customer.module').then( m => m.CustomerPageModule)
  },
  {
    path: 'dailyreport',
    loadChildren: () => import('./dailyreport/dailyreport.module').then( m => m.DailyreportPageModule)
  },
  {
    path: 'drtrpopup',
    loadChildren: () => import('./drtrpopup/drtrpopup.module').then( m => m.DrtrpopupPageModule)
  },
  {
    path: 'drtrupload',
    loadChildren: () => import('./drtrupload/drtrupload.module').then( m => m.DrtruploadPageModule)
  },
  {
    path: 'dsr-drtr-report',
    loadChildren: () => import('./dsr-drtr-report/dsr-drtr-report.module').then( m => m.DsrDrtrReportPageModule)
  },
  {
    path: 'dsrdrtrview',
    loadChildren: () => import('./dsrdrtrview/dsrdrtrview.module').then( m => m.DsrdrtrviewPageModule)
  },
  {
    path: 'dsrpopup',
    loadChildren: () => import('./dsrpopup/dsrpopup.module').then( m => m.DsrpopupPageModule)
  },
  {
    path: 'dsrupload',
    loadChildren: () => import('./dsrupload/dsrupload.module').then( m => m.DsruploadPageModule)
  },
  {
    path: 'editattendance',
    loadChildren: () => import('./editattendance/editattendance.module').then( m => m.EditattendancePageModule)
  },
  {
    path: 'industrial',
    loadChildren: () => import('./industrial/industrial.module').then( m => m.IndustrialPageModule)
  },
  {
    path: 'inventory',
    loadChildren: () => import('./inventory/inventory.module').then( m => m.InventoryPageModule)
  },
  {
    path: 'markattendance',
    loadChildren: () => import('./markattendance/markattendance.module').then( m => m.MarkattendancePageModule)
  },
  {
    path: 'myattendance',
    loadChildren: () => import('./myattendance/myattendance.module').then( m => m.MyattendancePageModule)
  },
  {
    path: 'mybills',
    loadChildren: () => import('./mybills/mybills.module').then( m => m.MybillsPageModule)
  },
  {
    path: 'mytada',
    loadChildren: () => import('./mytada/mytada.module').then( m => m.MytadaPageModule)
  },
  {
    path: 'newsetclient',
    loadChildren: () => import('./newsetclient/newsetclient.module').then( m => m.NewsetclientPageModule)
  },
  {
    path: 'newsetclientcust',
    loadChildren: () => import('./newsetclientcust/newsetclientcust.module').then( m => m.NewsetclientcustPageModule)
  },
  {
    path: 'newsetclientemp',
    loadChildren: () => import('./newsetclientemp/newsetclientemp.module').then( m => m.NewsetclientempPageModule)
  },
  {
    path: 'newsetstate',
    loadChildren: () => import('./newsetstate/newsetstate.module').then( m => m.NewsetstatePageModule)
  },
  {
    path: 'notices',
    loadChildren: () => import('./notices/notices.module').then( m => m.NoticesPageModule)
  },
  {
    path: 'opn-clsdailyseal',
    loadChildren: () => import('./opn-clsdailyseal/opn-clsdailyseal.module').then( m => m.OpnClsdailysealPageModule)
  },
  {
    path: 'orderstatus',
    loadChildren: () => import('./orderstatus/orderstatus.module').then( m => m.OrderstatusPageModule)
  },
  {
    path: 'payroll',
    loadChildren: () => import('./payroll/payroll.module').then( m => m.PayrollPageModule)
  },
  {
    path: 'popup',
    loadChildren: () => import('./popup/popup.module').then( m => m.PopupPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'salespersonlist',
    loadChildren: () => import('./salespersonlist/salespersonlist.module').then( m => m.SalespersonlistPageModule)
  },
  {
    path: 'setclient',
    loadChildren: () => import('./setclient/setclient.module').then( m => m.SetclientPageModule)
  },
  {
    path: 'setclientall',
    loadChildren: () => import('./setclientall/setclientall.module').then( m => m.SetclientallPageModule)
  },
  {
    path: 'suggestion',
    loadChildren: () => import('./suggestion/suggestion.module').then( m => m.SuggestionPageModule)
  },
  {
    path: 'tada',
    loadChildren: () => import('./tada/tada.module').then( m => m.TadaPageModule)
  },
  {
    path: 'tadapopup',
    loadChildren: () => import('./tadapopup/tadapopup.module').then( m => m.TadapopupPageModule)
  },
  {
    path: 'tadaupload',
    loadChildren: () => import('./tadaupload/tadaupload.module').then( m => m.TadauploadPageModule)
  },
  {
    path: 'town',
    loadChildren: () => import('./town/town.module').then( m => m.TownPageModule)
  },
  {
    path: 'viewattendance',
    loadChildren: () => import('./viewattendance/viewattendance.module').then( m => m.ViewattendancePageModule)
  },
  {
    path: 'ccsreportupload',
    loadChildren: () => import('./drtradddata/drtradddata.module').then( m => m.DrtradddataPageModule)
  },
  {
    path: 'drtradddatapopup',
    loadChildren: () => import('./drtradddatapopup/drtradddatapopup.module').then( m => m.DrtradddatapopupPageModule)
  },
  {
    path: 'vanupadddata',
    loadChildren: () => import('./vanupadddata/vanupadddata.module').then( m => m.VanupadddataPageModule)
  },
  {
    path: 'vanupadddataupload',
    loadChildren: () => import('./vanupadddataupload/vanupadddataupload.module').then( m => m.VanupadddatauploadPageModule)
  },
  {
    path: 'shopbanner',
    loadChildren: () => import('./bannerupload/bannerupload.module').then( m => m.BanneruploadPageModule)
  },
  {
    path: 'order',
    loadChildren: () => import('./order/order.module').then( m => m.OrderPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
