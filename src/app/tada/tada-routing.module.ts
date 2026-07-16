import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TadaPage } from './tada.page';

const routes: Routes = [
  {
    path: '',
    component: TadaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TadaPageRoutingModule {}
