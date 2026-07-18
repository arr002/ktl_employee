import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AllattendancePage } from './allattendance.page';

const routes: Routes = [
  {
    path: '',
    component: AllattendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllattendancePageRoutingModule {}
