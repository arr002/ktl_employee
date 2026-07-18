import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetclientallPage } from './setclientall.page';

const routes: Routes = [
  {
    path: '',
    component: SetclientallPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetclientallPageRoutingModule {}
