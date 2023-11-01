import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../product/product.model';
import { CartService } from '../cart/cart.service';
import { Subscription } from 'rxjs';
import { Cart } from '../cart/cart.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartList: Product[] = [];
  cartListSub: Subscription;
  grandTotal: number = 0;
  contentLoaded: boolean = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
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
          this.contentLoaded = true
        });
    }, 1000);
  }

  ngOnDestroy(): void {}
}
