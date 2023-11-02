import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from './product.model';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../cart/cart.service';
import { AuthService } from '../auth/auth.service';
import { Cart } from '../cart/cart.model';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit, OnDestroy {
  productForm: any;
  productList: Product[] = [];
  cart: Cart;
  productListSub: Subscription;
  newProductToggle: boolean = false;
  contentLoaded: boolean = false;
  isEditMode: boolean = false;
  isSeller: boolean = false;
  checkEmail: boolean = false;
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      if (this.authService.userRole === 'buyer') {
        this.isSeller = false;
      } else {
        this.isSeller = true;
      }
      this.cartService.getCarts().subscribe((res: Cart[]) => {
        for (let i = 0; i < res.length; i++) {
          if (res[i].userEmail === this.authService.userDataToBeShared.email) {
            this.checkEmail = true;
          }
        }
        if (!this.checkEmail) {
          res.push({
            userEmail: this.authService.userDataToBeShared.email,
            cartProducts: [],
          });

          this.cartService.addCart(res);
        }
        console.log(res);
      });
      if (true) {
      }
    }
    setTimeout(() => {
      this.productListSub = this.productService
        .getProductList()
        .subscribe((res: Product[]) => {
          this.productList = res.slice();
        });
      this.contentLoaded = true;
    }, 1200);
  }

  private initForm(product: Product) {
    let name = null;
    let imageurl = null;
    let quantity = null;
    let price = null;
    let purchased = 0;

    if (this.isEditMode) {
      name = product.productName;
      imageurl = product.productImage;
      quantity = product.productQuantity;
      price = product.productPrice;
      purchased = product.productPurchased;
    }

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

  onIncrement(index: number) {
    if (this.productList[index].productQuantity == 0) return;
    this.productList[index].productQuantity--;
    this.productList[index].productPurchased++;
  }

  onDecrement(index: number) {
    if (this.productList[index].productPurchased == 0) return;
    this.productList[index].productQuantity++;
    this.productList[index].productPurchased--;
  }

  onAddToCart(index: number) {
    if (this.productList[index].productPurchased == 1) return;
    this.productList[index].productQuantity--;
    this.productList[index].productPurchased++;
  }

  // onHandlePurchase(index: number, purchased: number) {
  //   // (keydown.enter)="onHandlePurchase(i, product.productPurchased)"
  //   if (purchased > this.productList[index].productQuantity) return;
  //   this.productList[index].productQuantity -= purchased;
  //   this.purchase += +purchased;
  // }

  // totalPurchase(index: number) {
  //   // (blur)="totalPurchase(i)"
  //   this.productList[index].productPurchased = this.purchase;
  //   this.purchase = 0;
  // }

  onAddNewProductToggle() {
    this.initForm(this.product);
    this.newProductToggle = !this.newProductToggle;
  }

  onEditProduct(index: number) {
    this.isEditMode = true;
    this.updatedProductIndex = index;
    this.initForm(this.productList[index]);
    this.newProductToggle = !this.newProductToggle;
  }

  onDeleteProduct(index: number) {
    if (confirm('are you sure want to delete the product?')) {
      this.productList.splice(index, 1);
      this.productService.updateProductList(this.productList);
    } else return;
  }

  onCancel() {
    this.productForm.reset();
    this.newProductToggle = false;
    this.isEditMode = false;
  }

  onSubmit() {
    if (!this.productForm.valid) {
      return;
    }
    if (!this.isEditMode) {
      this.productForm.patchValue({
        productPurchased: 0,
      });
      this.productList.push(this.productForm.value);
    } else {
      console.log(this.productForm.value);
      this.productList.splice(
        this.updatedProductIndex,
        1,
        this.productForm.value
      );
      this.isEditMode = !this.isEditMode;
    }
    this.productService.updateProductList(this.productList);
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
    if (this.authService.isAuthenticated) {
      this.productService.updateProductList(this.productList);
    }
    this.productListSub.unsubscribe();
  }
}
