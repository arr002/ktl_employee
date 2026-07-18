import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BranchmanagersPage } from './branchmanagers.page';

const routes: Routes = [
  {
    path: '',
    component: BranchmanagersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchmanagersPageRoutingModule {}
