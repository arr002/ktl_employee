import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttandencePage } from './attandence.page';

const routes: Routes = [
  {
    path: '',
    component: AttandencePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttandencePageRoutingModule {}
