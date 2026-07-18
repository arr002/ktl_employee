import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DrtradddataPageRoutingModule } from './drtradddata-routing.module';

import { DrtradddataPage } from './drtradddata.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DrtradddataPageRoutingModule
  ],
  declarations: [DrtradddataPage]
})
export class DrtradddataPageModule {}
