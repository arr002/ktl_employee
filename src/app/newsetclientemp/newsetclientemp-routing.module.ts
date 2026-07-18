import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewsetclientempPage } from './newsetclientemp.page';

const routes: Routes = [
  {
    path: '',
    component: NewsetclientempPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewsetclientempPageRoutingModule {}
