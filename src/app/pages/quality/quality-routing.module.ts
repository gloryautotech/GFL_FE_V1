import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QualityComponent } from './quality.component';
import { AddEditQualityComponent } from './add-edit-quality/add-edit-quality.component';
import { QualityGuard } from 'app/@theme/guards/quality.guard';
import { PrintLayoutComponent } from 'app/@theme/components/print-Layout/print-layout.component';

const routes: Routes = [
  {
    path: '',
    component: QualityComponent,
    canActivate: [QualityGuard],
    canLoad: [QualityGuard],
    data: { PermissionName: ['view'] }
  },
  {
    path: 'add',
    component: AddEditQualityComponent,
    canActivate: [QualityGuard],
    //canLoad: [QualityGuard],
    data: { PermissionName: ['add'] }
  }, {
    path: 'edit/:id',
    component: AddEditQualityComponent,
    canActivate: [QualityGuard],
    canLoad: [QualityGuard],
    data: { PermissionName: ['edit'] }
  },
  {
    path: 'export/invoice',
    component: PrintLayoutComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [QualityGuard]
})
export class QualityRoutingModule { }
