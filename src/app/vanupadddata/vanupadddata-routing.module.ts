import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VanupadddataPage } from './vanupadddata.page';

const routes: Routes = [
  {
    path: '',
    component: VanupadddataPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VanupadddataPageRoutingModule {}
