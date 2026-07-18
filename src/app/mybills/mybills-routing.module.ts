import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MybillsPage } from './mybills.page';

const routes: Routes = [
  {
    path: '',
    component: MybillsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MybillsPageRoutingModule {}
