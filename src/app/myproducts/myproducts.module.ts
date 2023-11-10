import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyMaterialModule } from '../mymaterial.module';
import { HttpClientModule } from '@angular/common/http';
import { MyproductsComponent } from './myproducts.component';

@NgModule({
  declarations: [MyproductsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MyMaterialModule,
    HttpClientModule,
    RouterModule.forChild([{ path: '', component: MyproductsComponent }]),
  ],
})
export class MyproductsModule {}
