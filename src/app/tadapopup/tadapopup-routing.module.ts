import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TadapopupPage } from './tadapopup.page';

const routes: Routes = [
  {
    path: '',
    component: TadapopupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TadapopupPageRoutingModule {}
