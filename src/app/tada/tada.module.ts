import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TadaPageRoutingModule } from './tada-routing.module';

import { TadaPage } from './tada.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TadaPageRoutingModule
  ],
  declarations: [TadaPage]
})
export class TadaPageModule {}
