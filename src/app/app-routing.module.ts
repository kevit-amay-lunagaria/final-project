import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ErrorPageComponent } from './error-page/error-page.component';
import { AuthGuard } from './auth/auth-guard';

const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then((am) => am.AuthModule),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./product/product.module').then((pdt) => pdt.ProductModule),
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./cart/cart.module').then((crt) => crt.CartModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./checkout/checkout.module').then((chkt) => chkt.CheckoutModule),
    canActivate: [AuthGuard],
  },
  { path: '**', component: ErrorPageComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
