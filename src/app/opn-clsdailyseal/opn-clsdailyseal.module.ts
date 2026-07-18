import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OpnClsdailysealPageRoutingModule } from './opn-clsdailyseal-routing.module';

import { OpnClsdailysealPage } from './opn-clsdailyseal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpnClsdailysealPageRoutingModule
  ],
  declarations: [OpnClsdailysealPage]
})
export class OpnClsdailysealPageModule {}
