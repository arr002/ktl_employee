import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MybillsPageRoutingModule } from './mybills-routing.module';

import { MybillsPage } from './mybills.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MybillsPageRoutingModule
  ],
  declarations: [MybillsPage]
})
export class MybillsPageModule {}
