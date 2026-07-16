import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewsetclientcustPage } from './newsetclientcust.page';

const routes: Routes = [
  {
    path: '',
    component: NewsetclientcustPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewsetclientcustPageRoutingModule {}
