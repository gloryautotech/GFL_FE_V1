import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QualityRoutingModule } from './quality-routing.module';
import { SharedModule } from '../../@theme/shared.module';
import { QualityComponent } from './quality.component';
import { AddEditQualityComponent } from './add-edit-quality/add-edit-quality.component';


@NgModule({
  declarations: [QualityComponent, AddEditQualityComponent],
  imports: [
    CommonModule,
    SharedModule,
    QualityRoutingModule
  ]
})
export class QualityModule { }
