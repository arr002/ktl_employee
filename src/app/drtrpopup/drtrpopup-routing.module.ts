import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DrtrpopupPage } from './drtrpopup.page';

const routes: Routes = [
  {
    path: '',
    component: DrtrpopupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DrtrpopupPageRoutingModule {}
