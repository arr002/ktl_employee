import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminsealPage } from './adminseal.page';

const routes: Routes = [
  {
    path: '',
    component: AdminsealPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminsealPageRoutingModule {}
