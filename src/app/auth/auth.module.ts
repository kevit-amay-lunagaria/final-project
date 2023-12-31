import { NgModule } from '@angular/core';
import { AuthComponent } from './auth.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyMaterialModule } from '../mymaterial.module';

@NgModule({
  declarations: [AuthComponent],
  imports: [
    MyMaterialModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forChild([{ path: '', component: AuthComponent }]),
  ],
})
export class AuthModule {}
