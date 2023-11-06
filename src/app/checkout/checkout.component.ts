import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../product/product.model';
import { CartService } from '../cart/cart.service';
import { Subscription } from 'rxjs';
import { Cart } from '../cart/cart.model';
import { ProductService } from '../product/product.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartList: Product[] = [];
  productList: Product[] = [];
  cartListSub: Subscription;
  productListSub: Subscription;
  grandTotal: number = 0;
  contentLoaded: boolean = false;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.productListSub = this.productService
      .getProductList()
      .subscribe((res: Product[]) => {
        this.productList = res.slice();
        console.log(this.productList);
      });

    setTimeout(() => {
      this.cartListSub = this.cartService
        .showCartProducts()
        .subscribe((res: Cart[]) => {
          console.log(res[0].cartProducts);
          for (let i = 0; i < res.length; i++) {
            if (
              res[i].userEmail === this.authService.userDataToBeShared.email
            ) {
              for (let j = 0; j < res[i].cartProducts.length; j++) {
                if (res[i].cartProducts[j].productPurchased != 0) {
                  this.cartList.push(res[i].cartProducts[j]);
                  this.grandTotal +=
                    res[i].cartProducts[j].productPrice *
                    res[i].cartProducts[j].productPurchased;
                  console.log(res[i]);
                }
              }
              break;
            } else {
              continue;
            }
          }
          this.contentLoaded = true;
        });
    }, 1000);
  }

  ngOnDestroy(): void {
    console.log(this.productList);
    for (let i = 0; i < this.productList.length; i++) {
      if (this.productList[i].productPurchased != 0) {
        this.productList[i].productPurchased = 0;
      }
    }
    console.log(this.cartList);
    this.cartList.splice(0, this.cartList.length);
    this.cartService.getAddedProducts(this.cartList);
    this.productService.updateProductList(this.productList);
    this.productListSub.unsubscribe();
    this.cartListSub.unsubscribe();
  }
}
