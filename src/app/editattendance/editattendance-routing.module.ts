import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditattendancePage } from './editattendance.page';

const routes: Routes = [
  {
    path: '',
    component: EditattendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditattendancePageRoutingModule {}
