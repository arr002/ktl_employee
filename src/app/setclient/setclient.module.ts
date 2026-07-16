import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetclientPageRoutingModule } from './setclient-routing.module';

import { SetclientPage } from './setclient.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetclientPageRoutingModule
  ],
  declarations: [SetclientPage]
})
export class SetclientPageModule {}
