import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DrtradddatapopupPageRoutingModule } from './drtradddatapopup-routing.module';

import { DrtradddatapopupPage } from './drtradddatapopup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DrtradddatapopupPageRoutingModule
  ],
  declarations: [DrtradddatapopupPage]
})
export class DrtradddatapopupPageModule {}
