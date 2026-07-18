import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewattendancePage } from './viewattendance.page';

const routes: Routes = [
  {
    path: '',
    component: ViewattendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewattendancePageRoutingModule {}
