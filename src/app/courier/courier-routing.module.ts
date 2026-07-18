import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourierPage } from './courier.page';

const routes: Routes = [
  {
    path: '',
    component: CourierPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourierPageRoutingModule {}
