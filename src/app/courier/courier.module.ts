import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CourierPageRoutingModule } from './courier-routing.module';

import { CourierPage } from './courier.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CourierPageRoutingModule
  ],
  declarations: [CourierPage]
})
export class CourierPageModule {}
