import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PopupPageRoutingModule } from './popup-routing.module';

import { PopupPage } from './popup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PopupPageRoutingModule
  ],
  declarations: [PopupPage]
})
export class PopupPageModule {}
