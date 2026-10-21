import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PendingindentPage } from './pendingindent.page';

const routes: Routes = [
  {
    path: '',
    component: PendingindentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingindentPageRoutingModule {}
