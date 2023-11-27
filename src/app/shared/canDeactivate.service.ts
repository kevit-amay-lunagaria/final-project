import { inject } from '@angular/core';
import { CanDeactivateFn, Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../auth/auth.service';
import { ProductService } from '../product/product.service';
import { ProductComponent, objCheck } from '../product/product.component';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

export const hasUnsavedChanges: CanDeactivateFn<CanComponentDeactivate> = (
  component: ProductComponent
): Observable<boolean> | Promise<boolean> | boolean => {
  const authed = inject(AuthService);
  const productService = inject(ProductService);
  // const router = inject(Router);

  if (authed.isAuthenticated && objCheck) {
    return Swal.fire({
      title: 'Some changes were detected...',
      text: 'Are you sure that you want to discard the changes?',
      icon: 'warning',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: true,
      confirmButtonText: 'Yes',
      showCancelButton: true,
      cancelButtonText: 'No',
    }).then((res) => res.isConfirmed);
  }
};
