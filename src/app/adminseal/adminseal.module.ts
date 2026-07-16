import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminsealPageRoutingModule } from './adminseal-routing.module';

import { AdminsealPage } from './adminseal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminsealPageRoutingModule
  ],
  declarations: [AdminsealPage]
})
export class AdminsealPageModule {}
