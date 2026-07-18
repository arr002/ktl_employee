import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DrtruploadPage } from './drtrupload.page';

const routes: Routes = [
  {
    path: '',
    component: DrtruploadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DrtruploadPageRoutingModule {}
