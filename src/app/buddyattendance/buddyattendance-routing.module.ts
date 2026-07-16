import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BuddyattendancePage } from './buddyattendance.page';

const routes: Routes = [
  {
    path: '',
    component: BuddyattendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuddyattendancePageRoutingModule {}
