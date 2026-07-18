import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DsruploadPage } from './dsrupload.page';

const routes: Routes = [
  {
    path: '',
    component: DsruploadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DsruploadPageRoutingModule {}
