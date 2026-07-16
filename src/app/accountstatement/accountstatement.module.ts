import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountstatementPageRoutingModule } from './accountstatement-routing.module';

import { AccountstatementPage } from './accountstatement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountstatementPageRoutingModule
  ],
  declarations: [AccountstatementPage]
})
export class AccountstatementPageModule {}
