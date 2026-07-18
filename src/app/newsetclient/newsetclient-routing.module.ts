import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewsetclientPage } from './newsetclient.page';

const routes: Routes = [
  {
    path: '',
    component: NewsetclientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewsetclientPageRoutingModule {}
