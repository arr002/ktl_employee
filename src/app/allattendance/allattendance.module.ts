import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AllattendancePageRoutingModule } from './allattendance-routing.module';

import { AllattendancePage } from './allattendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AllattendancePageRoutingModule
  ],
  declarations: [AllattendancePage]
})
export class AllattendancePageModule {}
