import { NgModule } from '@angular/core';
import { CartComponent } from './cart.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MyMaterialModule } from '../mymaterial.module';

@NgModule({
  declarations: [CartComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MyMaterialModule,
    RouterModule.forChild([{ path: '', component: CartComponent }]),
  ],
})
export class CartModule {}
