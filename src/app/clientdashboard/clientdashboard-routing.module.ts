import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientdashboardPage } from './clientdashboard.page';

const routes: Routes = [
  {
    path: '',
    component: ClientdashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientdashboardPageRoutingModule {}
