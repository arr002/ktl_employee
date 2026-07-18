import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditattendancePageRoutingModule } from './editattendance-routing.module';

import { EditattendancePage } from './editattendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditattendancePageRoutingModule
  ],
  declarations: [EditattendancePage]
})
export class EditattendancePageModule {}
