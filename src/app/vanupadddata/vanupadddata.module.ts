import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VanupadddataPageRoutingModule } from './vanupadddata-routing.module';

import { VanupadddataPage } from './vanupadddata.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VanupadddataPageRoutingModule
  ],
  declarations: [VanupadddataPage]
})
export class VanupadddataPageModule {}
