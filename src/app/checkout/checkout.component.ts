import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../product/product.model';
import { CartService } from '../cart/cart.service';
import { Subscription } from 'rxjs';
import { Cart } from '../cart/cart.model';
import { ProductService } from '../product/product.service';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartList: Product[] = [];
  productList: Product[] = [];
  cartListSub: Subscription;
  cart2List: Product[] = [];
  productListSub: Subscription;
  grandTotal: number = 0;
  contentLoaded: boolean = false;
  cartNotFound: boolean = false;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productListSub = this.productService
      .getProductList()
      .subscribe((res: Product[]) => {
        this.productList = res.slice();
      });

    setTimeout(() => {
      this.cartListSub = this.cartService
        .getCarts()
        .subscribe((res: Cart[]) => {
          for (let i = 0; i < res.length; i++) {
            if (
              res[i].userEmail === this.authService.userDataToBeShared.email
            ) {
              if (res[i].cartProducts !== undefined) {
                for (let j = 0; j < res[i].cartProducts.length; j++) {
                  if (res[i].cartProducts[j].productPurchased != 0) {
                    this.cartList.push(res[i].cartProducts[j]);
                    this.grandTotal +=
                      res[i].cartProducts[j].productPrice *
                      res[i].cartProducts[j].productPurchased;
                  }
                }
              } else {
                this.cartNotFound = true;
                break;
              }
              break;
            } else {
              continue;
            }
          }
          if (!this.cartNotFound) {
            this.cart2List.push(...this.cartList);
          }
        });
      this.contentLoaded = true;
    }, 1000);
  }

  onFinalize() {
    for (let i = 0; i < this.productList.length; i++) {
      if (this.productList[i].productPurchased != 0) {
        this.productList[i].productPurchased = 0;
      }
    }
    this.cartList.splice(0, this.cartList.length);
    this.cartService.getAddedProducts(this.cartList);
    this.productService.updateProductList(this.productList);
    setTimeout(() => {
      this.router.navigate(['/products'], { relativeTo: this.route });
    }, 1400);

    Swal.fire({
      icon: 'success',
      title: 'Thank you for the purchase!',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  ngOnDestroy(): void {
    if (this.contentLoaded) {
      this.productListSub.unsubscribe();
      this.cartListSub.unsubscribe();
    }
  }
}
