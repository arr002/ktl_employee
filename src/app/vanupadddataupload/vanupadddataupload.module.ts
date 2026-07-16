import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VanupadddatauploadPageRoutingModule } from './vanupadddataupload-routing.module';

import { VanupadddatauploadPage } from './vanupadddataupload.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VanupadddatauploadPageRoutingModule
  ],
  declarations: [VanupadddatauploadPage]
})
export class VanupadddatauploadPageModule {}
