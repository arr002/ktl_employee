import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DrtradddataPage } from './drtradddata.page';

const routes: Routes = [
  {
    path: '',
    component: DrtradddataPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DrtradddataPageRoutingModule {}
