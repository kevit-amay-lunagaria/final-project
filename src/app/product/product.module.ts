import { NgModule } from '@angular/core';
import { ProductComponent } from './product.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MyMaterialModule } from '../mymaterial.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [ProductComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MyMaterialModule,
    HttpClientModule,
    RouterModule.forChild([{ path: '', component: ProductComponent }]),
  ],
})
export class ProductModule {}
