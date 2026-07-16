import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DsrDrtrReportPage } from './dsr-drtr-report.page';

const routes: Routes = [
  {
    path: '',
    component: DsrDrtrReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DsrDrtrReportPageRoutingModule {}
