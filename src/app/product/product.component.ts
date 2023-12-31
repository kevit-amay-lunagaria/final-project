import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from './product.model';
import { Observable, Subscription } from 'rxjs';
import { CartService } from '../cart/cart.service';
import { AuthService } from '../auth/auth.service';
import { Cart } from '../cart/cart.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CanComponentDeactivate } from '../shared/canDeactivate.service';

export let objCheck: boolean = false;

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent
  implements OnInit, OnDestroy, CanComponentDeactivate
{
  productList: Product[] = [];
  cartList: Product[] = [];
  productListSub: Subscription;
  contentLoaded: boolean = false;
  itemsAdded: boolean = false;
  checkEmail: boolean = false;
  cartSaved: boolean = false;
  detectChange: object = {};

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.cartService.getCarts().subscribe((res: Cart[]) => {
        for (let i = 0; i < res.length; i++) {
          if (res[i].userEmail === this.authService.userDataToBeShared.email) {
            this.checkEmail = true;
            this.cartList = res[i].cartProducts;
            localStorage.setItem('userFullName', res[i].userFullName);
            break;
          }
        }
        if (!this.checkEmail) {
          res.push({
            userEmail: this.authService.userDataToBeShared.email,
            cartProducts: [],
            myProducts: [],
            userFullName: localStorage.getItem('userFullName'),
          });

          this.cartService.addCart(res);
        }
      });
    }
    setTimeout(() => {
      this.productListSub = this.productService
        .getProductList()
        .subscribe((res: Product[]) => {
          this.productList = res.slice();
          if (this.cartList != undefined && this.cartList.length != 0) {
            for (let i = 0; i < this.cartList.length; i++) {
              const index = this.productList.findIndex(
                (e) => e.productName === this.cartList[i].productName
              );

              if (index === -1) {
                continue;
              } else {
                this.productList[index].productPurchased =
                  this.cartList[i].productPurchased;
              }
            }
          } else {
            for (let i = 0; i < this.productList.length; i++) {
              this.productList[i].productPurchased = 0;
            }
          }
        });
      this.contentLoaded = true;
    }, 1800);
  }

  onIncrement(index: number) {
    if (this.productList[index].productQuantity == 0) {
      return;
    }

    this.productList[index].productQuantity--;
    this.productList[index].productPurchased++;

    objCheck = true;

    this.detectChange[this.productList[index].id] =
      this.productList[index].productPurchased;
  }

  onDecrement(index: number) {
    if (this.productList[index].productPurchased == 0) return;

    objCheck = true;

    this.productList[index].productQuantity++;
    this.productList[index].productPurchased--;
    this.detectChange[this.productList[index].id] =
      this.productList[index].productPurchased;

    if (this.productList[index].productPurchased == 0) {
      delete this.detectChange[this.productList[index].id];

      if (!Object.keys(this.detectChange).length) {
        objCheck = false;
      }
    }
  }

  onSaveCart() {
    if (this.authService.isAuthenticated) {
      this.cartList = [];
      let zeroItems = true;
      this.cartSaved = true;
      objCheck = false;
      for (let i = 0; i < this.productList.length; i++) {
        if (this.productList[i].productPurchased != 0) {
          zeroItems = false;
          this.cartList.push(this.productList[i]);
        }
      }
      if (!zeroItems) {
        this.itemsAdded = true;
        this.cartService.getAddedProducts(this.cartList);
        this.productService.updateProductList(this.productList);
        Swal.fire({
          position: 'bottom-right',
          title: 'Cart Saved!',
          text: 'The item(s) have been added to the cart.',
          icon: 'success',
          showConfirmButton: false,
          toast: true,
          timer: 1800,
          timerProgressBar: true,
        });
        this.router.navigate(['/cart']);
      } else {
        this.cartService.getAddedProducts(this.cartList);
        Swal.fire({
          position: 'bottom-right',
          title: 'Cart not Saved!',
          text: 'Please select products.',
          icon: 'warning',
          showConfirmButton: false,
          toast: true,
          timer: 1800,
          timerProgressBar: true,
        });
      }
    } else {
      Swal.fire({
        title: 'Please login to continue!',
        icon: 'warning',
        showConfirmButton: false,
        toast: true,
        position: 'bottom-right',
        timer: 1800,
        timerProgressBar: true,
      });
      this.router.navigate(['/auth']);
    }
  }

  canDeactivate: () => boolean | Observable<boolean> | Promise<boolean>;

  ngOnDestroy(): void {
    if (this.contentLoaded) {
      this.productListSub.unsubscribe();
    }
  }
}
