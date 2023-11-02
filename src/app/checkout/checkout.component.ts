import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../product/product.model';
import { CartService } from '../cart/cart.service';
import { Subscription } from 'rxjs';
import { Cart } from '../cart/cart.model';
import { ProductService } from '../product/product.service';

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
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productListSub = this.productService
      .getProductList()
      .subscribe((res: Product[]) => {
        this.productList = res.slice();
      });
    setTimeout(() => {
      this.cartListSub = this.cartService
        .showCartProducts()
        .subscribe((res: Cart) => {
          for (let i = 0; i < res.cartProducts.length; i++) {
            if (res.cartProducts[i].productPurchased != 0) {
              this.cartList.push(res.cartProducts[i]);
              this.grandTotal +=
                res.cartProducts[i].productPrice *
                res.cartProducts[i].productPurchased;
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
    this.cartList.length = 0;
    this.cartService.getAddedProducts(this.cartList);
    this.productService.updateProductList(this.productList);
    this.productListSub.unsubscribe();
    this.cartListSub.unsubscribe();
  }
}
