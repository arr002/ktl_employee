import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalespersonlistPage } from './salespersonlist.page';

const routes: Routes = [
  {
    path: '',
    component: SalespersonlistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalespersonlistPageRoutingModule {}
