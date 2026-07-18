import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DsrDrtrReportPageRoutingModule } from './dsr-drtr-report-routing.module';

import { DsrDrtrReportPage } from './dsr-drtr-report.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DsrDrtrReportPageRoutingModule
  ],
  declarations: [DsrDrtrReportPage]
})
export class DsrDrtrReportPageModule {}
