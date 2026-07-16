import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DsrpopupPageRoutingModule } from './dsrpopup-routing.module';

import { DsrpopupPage } from './dsrpopup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DsrpopupPageRoutingModule
  ],
  declarations: [DsrpopupPage]
})
export class DsrpopupPageModule {}
