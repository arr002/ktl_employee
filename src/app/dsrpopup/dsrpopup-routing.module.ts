import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DsrpopupPage } from './dsrpopup.page';

const routes: Routes = [
  {
    path: '',
    component: DsrpopupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DsrpopupPageRoutingModule {}
