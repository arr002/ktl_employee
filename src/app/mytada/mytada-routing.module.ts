import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MytadaPage } from './mytada.page';

const routes: Routes = [
  {
    path: '',
    component: MytadaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MytadaPageRoutingModule {}
