import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DrtruploadPageRoutingModule } from './drtrupload-routing.module';

import { DrtruploadPage } from './drtrupload.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DrtruploadPageRoutingModule
  ],
  declarations: [DrtruploadPage]
})
export class DrtruploadPageModule {}

