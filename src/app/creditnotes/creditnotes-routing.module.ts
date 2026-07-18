import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreditnotesPage } from './creditnotes.page';

const routes: Routes = [
  {
    path: '',
    component: CreditnotesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditnotesPageRoutingModule {}
