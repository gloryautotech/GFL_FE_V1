import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ColorComponent } from './color.component';
import { AddEditColorComponent } from './add-edit-color/add-edit-color.component';
import { ColorGuard } from 'app/@theme/guards/color.guard';
import { IssueColorBoxComponent } from './issue-color-box/issue-color-box.component';

const routes: Routes = [
  {
    path:'',
    component:AddEditColorComponent,
    canActivate:[ColorGuard],
    canLoad:[ColorGuard],
    data: { PermissionName: ['add']}
  },
  {
    path:'view',
    component:ColorComponent,
    canActivate:[ColorGuard],
    canLoad:[ColorGuard],
    data: { PermissionName: ['view','view group','view all']}
  },
 
  {
    path:'edit/:id',
    component:AddEditColorComponent,
    canActivate:[ColorGuard],
    canLoad:[ColorGuard],
    data: { PermissionName: ['edit','edit group','edit all']}
  },
  {
    path:'issue-color-box',
    component:IssueColorBoxComponent,
    // canActivate:[ColorGuard],
    // canLoad:[ColorGuard],
    // data: { PermissionName: ['edit','edit group','edit all']}
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[ColorGuard]
})
export class ColorRoutingModule { }
