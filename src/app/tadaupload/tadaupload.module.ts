import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TadauploadPageRoutingModule } from './tadaupload-routing.module';

import { TadauploadPage } from './tadaupload.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TadauploadPageRoutingModule
  ],
  declarations: [TadauploadPage]
})
export class TadauploadPageModule {}
