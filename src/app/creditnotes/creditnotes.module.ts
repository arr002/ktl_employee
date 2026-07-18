import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreditnotesPageRoutingModule } from './creditnotes-routing.module';

import { CreditnotesPage } from './creditnotes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreditnotesPageRoutingModule
  ],
  declarations: [CreditnotesPage]
})
export class CreditnotesPageModule {}
