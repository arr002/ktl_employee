import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewsetstatePageRoutingModule } from './newsetstate-routing.module';

import { NewsetstatePage } from './newsetstate.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewsetstatePageRoutingModule
  ],
  declarations: [NewsetstatePage]
})
export class NewsetstatePageModule {}
