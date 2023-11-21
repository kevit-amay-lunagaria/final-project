import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { CartService } from './cart.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import Swal from 'sweetalert2';

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
  cartSaved: boolean = false;
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
    this.cartService.getCarts().subscribe((res) => {
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
          } else {
            for (let i = 0; i < this.cartList.length; i++) {
              const index = this.productList.findIndex(
                (e) => e.productName === this.cartList[i].productName
              );

              if (index === -1) {
                if (this.cartList[i].productPurchased != 0) {
                  this.productList.push(this.cartList[i]);
                }
              } else {
                if (this.productList[index].productPurchased != 0) {
                  if (
                    this.productList[index].productPurchased !=
                    this.cartList[i].productPurchased
                  ) {
                    this.productList[index].productPurchased =
                      this.cartList[i].productPurchased;
                  }
                }
              }
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
          this.cartList = this.productList;
        });
    }, 2500);
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
    this.cartService.getAddedProducts(this.cartList);
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
      this.cartService.getAddedProducts(this.cartList);

      return;
    }
    this.cartService.getAddedProducts(this.cartList);

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

  onSaveCart() {
    this.cartSaved = true;
    if (this.isProductListEmpty) {
      this.cartService.getAddedProducts(this.cartList);
      return;
    }

    if (this.cartList.length) {
      for (let i = 0; i < this.cartList.length; i++) {
        const index = this.changedProductList.findIndex(
          (e) => e.productName === this.cartList[i].productName
        );

        if (index === -1) {
          this.changedProductList.push(this.cartList[i]);
        } else {
          this.changedProductList[index] = this.cartList[i];
        }
      }
    } else {
      this.cartService.getAddedProducts([]);
      for (let i = 0; i < this.changedProductList.length; i++) {
        this.changedProductList[i].productPurchased = 0;
      }
    }

    this.cartService.getAddedProducts(this.cartList);
    this.productService.updateProductList(this.changedProductList);

    Swal.fire({
      title: 'Cart Saved!',
      text: 'Your cart has been saved!',
      icon: 'success',
      position: 'bottom-right',
      showConfirmButton: false,
      toast: true,
      timer: 1800,
      timerProgressBar: true,
    });
  }

  ngOnDestroy(): void {
    if (this.isProductListEmpty) {
      return;
    }

    if (this.contentLoaded) {
      this.productListSub.unsubscribe();
    }
  }
}
