import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TadapopupPageRoutingModule } from './tadapopup-routing.module';

import { TadapopupPage } from './tadapopup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TadapopupPageRoutingModule
  ],
  declarations: [TadapopupPage]
})
export class TadapopupPageModule {}
