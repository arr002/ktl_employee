import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountstatementPage } from './accountstatement.page';

const routes: Routes = [
  {
    path: '',
    component: AccountstatementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountstatementPageRoutingModule {}
