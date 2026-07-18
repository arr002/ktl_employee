import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewsetclientPageRoutingModule } from './newsetclient-routing.module';

import { NewsetclientPage } from './newsetclient.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewsetclientPageRoutingModule
  ],
  declarations: [NewsetclientPage]
})
export class NewsetclientPageModule {}
