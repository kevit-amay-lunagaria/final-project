import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../product/product.service';
import { Product } from '../product/product.model';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../cart/cart.service';
import { AuthService } from '../auth/auth.service';
import { Cart } from '../cart/cart.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-myproducts',
  templateUrl: './myproducts.component.html',
  styleUrls: ['./myproducts.component.css'],
})
export class MyproductsComponent implements OnInit, OnDestroy {
  productForm: any;
  productsList: Product[] = [];
  myProductsList: Product[] = [];
  myProductsListSub: Subscription;
  productsListSub: Subscription;
  newProductToggle: boolean = false;
  contentLoaded: boolean = false;
  isSeller: boolean = false;
  checkEmail: boolean = false;
  noProducts: boolean = false;
  updatedProductIndex: number = -1;
  purchase: number = 0;
  product: Product = {
    productName: null,
    productImage: null,
    productPrice: null,
    productQuantity: null,
    productPurchased: 0,
  };

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.userRole === 'seller') {
      this.isSeller = true;
    } else {
      this.router.navigate(['/products']);
    }
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      if (this.authService.userRole === 'seller') {
        this.isSeller = true;
      } else {
        this.router.navigate(['/products']);
      }
    }
    if (this.authService.isAuthenticated) {
      this.myProductsListSub = this.cartService
        .getCarts()
        .subscribe((res: Cart[]) => {
          for (let i = 0; i < res.length; i++) {
            if (
              res[i].userEmail === this.authService.userDataToBeShared.email
            ) {
              this.checkEmail = true;
              localStorage.setItem('userFname', res[i].userFirstName);
              break;
            }
          }
          if (!this.checkEmail) {
            res.push({
              userEmail: this.authService.userDataToBeShared.email,
              cartProducts: [],
              myProducts: [],
              userFirstName: localStorage.getItem('userFname'),
            });

            this.cartService.addCart(res);
          }
        });
    }
    this.productsListSub = this.productService
      .getProductList()
      .subscribe((res: Product[]) => {
        this.productsList = res.slice();
      });
    setTimeout(() => {
      this.myProductsListSub = this.cartService
        .getCarts()
        .subscribe((res: Cart[]) => {
          for (let i = 0; i < res.length; i++) {
            if (
              res[i].userEmail === this.authService.userDataToBeShared.email
            ) {
              this.checkEmail = true;
              if (res[i].myProducts !== undefined) {
                this.myProductsList.push(...res[i].myProducts);
              }
              break;
            }
          }
          if (this.myProductsList.length == 0) {
            this.noProducts = true;
          }
        });

      this.contentLoaded = true;
    }, 1500);
  }

  private initForm(product: Product) {
    let name = null;
    let imageurl = null;
    let quantity = null;
    let price = null;
    let purchased = 0;

    this.productForm = new FormGroup({
      productName: new FormControl(name, [Validators.required]),
      productImage: new FormControl(imageurl, [
        Validators.required,
        this.correctImageFormat,
      ]),
      productQuantity: new FormControl(quantity, [Validators.required]),
      productPrice: new FormControl(price, [
        Validators.required,
        this.correctPriceFormat,
      ]),
      productPurchased: new FormControl(purchased, []),
    });
  }

  findProductIndex(product: Product) {
    for (let i = 0; i < this.productsList.length; i++) {
      if (this.productsList[i].productName == product.productName) {
        return i;
      }
    }
  }

  onAddNewProductToggle() {
    this.initForm(this.product);
    this.newProductToggle = !this.newProductToggle;
  }

  onCancel() {
    this.productForm.reset();
    this.newProductToggle = false;
  }

  onSubmit() {
    if (!this.productForm.valid) {
      return;
    }
    this.productForm.patchValue({
      productPurchased: 0,
    });
    if (this.myProductsList === undefined) {
      this.myProductsList = [];
    }
    this.noProducts = false;
    this.myProductsList.push(this.productForm.value);
    this.productsList.push(this.productForm.value);

    this.cartService.sellerAddedProducts(this.myProductsList);
    this.productService.updateProductList(this.productsList);
    this.newProductToggle = !this.newProductToggle;
    this.productForm.reset();
  }

  correctPriceFormat(control: FormControl): { [s: string]: boolean } | null {
    if (
      control.value != null &&
      (control.value.toString().length > 5 ||
        control.value.toString().length < 2)
    ) {
      return { notProperPriceFormat: true };
    }
    return null;
  }

  correctImageFormat(control: FormControl): { [s: string]: boolean } | null {
    if (
      control?.value != null &&
      !(
        control?.value.endsWith('.png') ||
        control?.value.endsWith('.jpg') ||
        control?.value.endsWith('.jpeg')
      )
    ) {
      return { notProperImageFormat: true };
    }
    return null;
  }

  ngOnDestroy(): void {
    if (this.contentLoaded) {
      this.myProductsListSub.unsubscribe();
      this.productsListSub.unsubscribe();
    }
  }
}
