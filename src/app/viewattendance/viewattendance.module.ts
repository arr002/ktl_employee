import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewattendancePageRoutingModule } from './viewattendance-routing.module';

import { ViewattendancePage } from './viewattendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewattendancePageRoutingModule
  ],
  declarations: [ViewattendancePage]
})
export class ViewattendancePageModule {}
