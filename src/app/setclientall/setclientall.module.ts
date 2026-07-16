import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetclientallPageRoutingModule } from './setclientall-routing.module';

import { SetclientallPage } from './setclientall.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetclientallPageRoutingModule
  ],
  declarations: [SetclientallPage]
})
export class SetclientallPageModule {}
