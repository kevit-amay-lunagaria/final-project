import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from './product.model';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../cart/cart.service';
import { AuthService } from '../auth/auth.service';
import { Cart } from '../cart/cart.model';
import Swal from 'sweetalert2';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit, OnDestroy {
  productForm: any;
  cart: Cart;
  productList: Product[] = [];
  cartList: Product[] = [];
  productListSub: Subscription;
  newProductToggle: boolean = false;
  contentLoaded: boolean = false;
  itemsAdded: boolean = false;
  isEditMode: boolean = false;
  isSeller: boolean = false;
  checkEmail: boolean = false;
  disableSaveCart: boolean = true;
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
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        if (
          !this.itemsAdded &&
          this.cartList !== undefined &&
          event.url != '/auth'
        ) {
          this.itemsAdded = !this.itemsAdded;
          this.router.navigate(['/products']);
          Swal.fire({
            title: 'Item(s) might not be added to your cart!!',
            icon: 'warning',
            showDenyButton: true,
            confirmButtonText: 'Its Okay',
            denyButtonText: `Save cart`,
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire('The items were not added.', '', 'error');
              router.navigate([event.url]);
            } else if (result.isDenied) {
              this.itemsAdded = !this.itemsAdded;
              Swal.fire('The item(s) were saved!', '', 'info');
              this.onSaveCart();
            }
          });
        }
      }
    });
  }

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
            this.cartList = res[i].cartProducts;
            break;
          }
        }
        if (!this.checkEmail) {
          res.push({
            userEmail: this.authService.userDataToBeShared.email,
            cartProducts: [],
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
          if (this.cartList != undefined) {
            this.disableSaveCart = false;
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

  onSaveCart() {
    if (this.authService.isAuthenticated) {
      this.cartList = [];
      let zeroItems = true;
      for (let i = 0; i < this.productList.length; i++) {
        if (this.productList[i].productPurchased != 0) {
          zeroItems = false;
          this.cartList.push(this.productList[i]);
        }
      }
      if (!zeroItems) {
        this.itemsAdded = true;
        setTimeout(() => {
          this.cartService.getAddedProducts(this.cartList);
        }, 200);
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
    }
  }

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
    if (this.contentLoaded) {
      this.productListSub.unsubscribe();
    }
  }
}
