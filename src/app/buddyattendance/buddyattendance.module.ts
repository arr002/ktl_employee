import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BuddyattendancePageRoutingModule } from './buddyattendance-routing.module';

import { BuddyattendancePage } from './buddyattendance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuddyattendancePageRoutingModule
  ],
  declarations: [BuddyattendancePage]
})
export class BuddyattendancePageModule {}
