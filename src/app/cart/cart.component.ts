import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { CartService } from './cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  productList: Product[] = [];
  changedProductList: Product[] = [];
  cartList: Product[] = [];
  isProductListEmpty: boolean = false;
  contentLoaded: boolean = false;
  totalItems: number = 0;
  subTotal: number = 0;
  productListSub: Subscription;
  cartListSub: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cartService.showCartProducts().subscribe((res) => {
      for (let i = 0; i < res.length; i++) {
        if (res[i].userEmail == this.authService.userDataToBeShared.email) {
          this.cartList = res[i].cartProducts;
          break;
        }
      }
    });
    setTimeout(() => {
      this.productListSub = this.productService
        .getProductList()
        .subscribe((res: Product[]) => {
          for (let i = 0; i < res.length; i++) {
            this.changedProductList.push(res[i]);
            if (res[i].productPurchased != 0) {
              this.productList.push(res[i]);
            }
          }

          if (this.cartList === undefined) {
            this.cartList = [];
          }

          for (let i = 0; i < this.cartList.length; i++) {
            const index = this.productList.findIndex(
              (e) => e.productName === this.cartList[i].productName
            );

            console.log(index);

            if (index === -1) {
              if (this.cartList[i].productPurchased != 0) {
                this.productList.push(this.cartList[i]);
              }
            } else {
              // this.productList[index].productPurchased =
              //   this.productList[index].productPurchased +
              //   this.cartList[index].productPurchased;
              // this.cartList[index].productQuantity =
              //   this.productList[index].productQuantity;
              // this.cartList[index].productQuantity =
              //   this.productList[index].productQuantity;
            }
          }

          for (let i = 0; i < this.productList.length; i++) {
            if (this.productList[i].productPurchased != 0) {
              this.totalItems += this.productList[i].productPurchased;
              this.subTotal +=
                this.productList[i].productPrice *
                this.productList[i].productPurchased;
            }
          }

          this.contentLoaded = true;
          if (this.productList.length == 0) {
            this.isProductListEmpty = true;
          } else {
            this.isProductListEmpty = false;
          }
          console.log(...this.cartList);
          console.log(...this.productList);
          console.log(...this.changedProductList);
          this.cartList = this.productList;
        });
    }, 3000);
  }

  onIncrement(index: number) {
    if (this.productList[index].productQuantity == 0) return;
    this.subTotal -=
      this.productList[index].productPrice *
      this.productList[index].productPurchased;
    this.productList[index].productQuantity--;
    this.productList[index].productPurchased++;
    this.totalItems++;
    this.subTotal +=
      this.productList[index].productPrice *
      this.productList[index].productPurchased;
    return;
  }

  onDecrement(index: number) {
    if (this.productList[index].productPurchased == 1) {
      let changedIndex = this.changedProductList.indexOf(
        this.productList[index]
      );

      this.totalItems--;

      this.subTotal -=
        this.productList[index].productPrice *
        this.productList[index].productPurchased;
      this.changedProductList[changedIndex].productPurchased = 0;
      this.productList[index].productQuantity++;
      this.productList.splice(index, 1);

      this.productService.updateProductList(this.changedProductList);
      if (this.productList.length == 0) {
        this.isProductListEmpty = true;
      }
      return;
    }

    this.totalItems--;

    this.subTotal -=
      this.productList[index].productPrice *
      this.productList[index].productPurchased;

    this.productList[index].productQuantity++;
    this.productList[index].productPurchased--;

    this.subTotal +=
      this.productList[index].productPrice *
      this.productList[index].productPurchased;
  }

  ngOnDestroy(): void {
    if (this.isProductListEmpty) {
      return;
    }
    
    console.log(...this.cartList);
    console.log(...this.productList);
    // this.cartService.getAddedProducts([]);
    this.cartService.getAddedProducts(this.cartList);

    // for (let i = 0; i < this.changedProductList.length; i++) {
    //   if (this.changedProductList[i].productPurchased != 0) {
    //     this.changedProductList[i].productPurchased = 0;
    //   }
    // }

    for (let i = 0; i < this.cartList.length; i++) {
      const index = this.changedProductList.findIndex(
        (e) => e.productName === this.cartList[i].productName
      );

      if (index === -1) {
        continue;
      } else {
        this.changedProductList[index] = this.cartList[index];
      }
    }

    this.productService.updateProductList(this.changedProductList);
    console.log(...this.changedProductList);

    this.productListSub.unsubscribe();
  }
}
