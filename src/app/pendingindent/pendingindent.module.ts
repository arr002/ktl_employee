import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PendingindentPageRoutingModule } from './pendingindent-routing.module';
import { PendingindentPage } from './pendingindent.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PendingindentPageRoutingModule
  ],
  declarations: [PendingindentPage]
})
export class PendingindentPageModule {}
