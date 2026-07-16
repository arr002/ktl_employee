import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BanneruploadPage } from './bannerupload.page';

const routes: Routes = [
  {
    path: '',
    component: BanneruploadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BanneruploadPageRoutingModule {}
