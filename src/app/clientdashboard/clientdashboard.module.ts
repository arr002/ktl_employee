import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientdashboardPageRoutingModule } from './clientdashboard-routing.module';

import { ClientdashboardPage } from './clientdashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientdashboardPageRoutingModule
  ],
  declarations: [ClientdashboardPage]
})
export class ClientdashboardPageModule {}
