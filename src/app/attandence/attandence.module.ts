import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttandencePageRoutingModule } from './attandence-routing.module';

import { AttandencePage } from './attandence.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttandencePageRoutingModule
  ],
  declarations: [AttandencePage]
})
export class AttandencePageModule {}
