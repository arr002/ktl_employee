import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PendingorderPage } from './pendingorder.page';

const routes: Routes = [
  {
    path: '',
    component: PendingorderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingorderPageRoutingModule {}
