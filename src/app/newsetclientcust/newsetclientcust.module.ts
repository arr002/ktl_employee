import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewsetclientcustPageRoutingModule } from './newsetclientcust-routing.module';

import { NewsetclientcustPage } from './newsetclientcust.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewsetclientcustPageRoutingModule
  ],
  declarations: [NewsetclientcustPage]
})
export class NewsetclientcustPageModule {}
