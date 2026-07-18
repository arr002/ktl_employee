import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewsetstatePage } from './newsetstate.page';

const routes: Routes = [
  {
    path: '',
    component: NewsetstatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewsetstatePageRoutingModule {}
