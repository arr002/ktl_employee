import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewsetclientempPageRoutingModule } from './newsetclientemp-routing.module';

import { NewsetclientempPage } from './newsetclientemp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewsetclientempPageRoutingModule
  ],
  declarations: [NewsetclientempPage]
})
export class NewsetclientempPageModule {}
