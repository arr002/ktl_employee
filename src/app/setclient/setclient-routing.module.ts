import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetclientPage } from './setclient.page';

const routes: Routes = [
  {
    path: '',
    component: SetclientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetclientPageRoutingModule {}
