import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarkattendancePageRoutingModule } from './markattendance-routing.module';

import { MarkattendancePage } from './markattendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarkattendancePageRoutingModule
  ],
  declarations: [MarkattendancePage]
})
export class MarkattendancePageModule {}
