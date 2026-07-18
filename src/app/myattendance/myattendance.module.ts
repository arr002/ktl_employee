import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyattendancePageRoutingModule } from './myattendance-routing.module';

import { MyattendancePage } from './myattendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyattendancePageRoutingModule
  ],
  declarations: [MyattendancePage]
})
export class MyattendancePageModule {}
