import { NgModule } from '@angular/core';
import { CheckoutComponent } from './checkout.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [CheckoutComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: CheckoutComponent }]),
  ],
})
export class CheckoutModule {}
