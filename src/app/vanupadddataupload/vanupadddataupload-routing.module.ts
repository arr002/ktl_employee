import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VanupadddatauploadPage } from './vanupadddataupload.page';

const routes: Routes = [
  {
    path: '',
    component: VanupadddatauploadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VanupadddatauploadPageRoutingModule {}
