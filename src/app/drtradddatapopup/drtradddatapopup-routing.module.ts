import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DrtradddatapopupPage } from './drtradddatapopup.page';

const routes: Routes = [
  {
    path: '',
    component: DrtradddatapopupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DrtradddatapopupPageRoutingModule {}
