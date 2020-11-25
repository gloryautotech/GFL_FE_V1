import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { AddEditUserComponent } from './add-edit-user/add-edit-user.component';
import { SharedModule } from '../../@theme/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [UserComponent, AddEditUserComponent],
  imports: [
    CommonModule,
    SharedModule,
    UserRoutingModule,
    FormsModule
  ]
})
export class UserModule { }
