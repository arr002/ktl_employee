import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DrtrpopupPageRoutingModule } from './drtrpopup-routing.module';

import { DrtrpopupPage } from './drtrpopup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DrtrpopupPageRoutingModule
  ],
  declarations: [DrtrpopupPage]
})
export class DrtrpopupPageModule {}
