import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarkattendancePage } from './markattendance.page';

const routes: Routes = [
  {
    path: '',
    component: MarkattendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarkattendancePageRoutingModule {}
