import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DsrdrtrviewPage } from './dsrdrtrview.page';

const routes: Routes = [
  {
    path: '',
    component: DsrdrtrviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DsrdrtrviewPageRoutingModule {}
