import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderstatusPageRoutingModule } from './orderstatus-routing.module';

import { OrderstatusPage } from './orderstatus.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderstatusPageRoutingModule
  ],
  declarations: [OrderstatusPage]
})
export class OrderstatusPageModule {}
