import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TownPageRoutingModule } from './town-routing.module';

import { TownPage } from './town.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TownPageRoutingModule
  ],
  declarations: [TownPage]
})
export class TownPageModule {}
