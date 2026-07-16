import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DsruploadPageRoutingModule } from './dsrupload-routing.module';

import { DsruploadPage } from './dsrupload.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DsruploadPageRoutingModule
  ],
  declarations: [DsruploadPage]
})
export class DsruploadPageModule {}
