import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpnClsdailysealPage } from './opn-clsdailyseal.page';

const routes: Routes = [
  {
    path: '',
    component: OpnClsdailysealPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpnClsdailysealPageRoutingModule {}
