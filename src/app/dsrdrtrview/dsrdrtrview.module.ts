import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DsrdrtrviewPageRoutingModule } from './dsrdrtrview-routing.module';

import { DsrdrtrviewPage } from './dsrdrtrview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DsrdrtrviewPageRoutingModule
  ],
  declarations: [DsrdrtrviewPage]
})
export class DsrdrtrviewPageModule {}
