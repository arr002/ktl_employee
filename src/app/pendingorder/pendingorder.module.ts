import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PendingorderPageRoutingModule } from './pendingorder-routing.module';
import { PendingorderPage } from './pendingorder.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PendingorderPageRoutingModule
  ],
  declarations: [PendingorderPage]
})
export class PendingorderPageModule {}
