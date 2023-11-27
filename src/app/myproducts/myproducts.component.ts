import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../product/product.service';
import { Product } from '../product/product.model';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../cart/cart.service';
import { AuthService } from '../auth/auth.service';
import { Cart } from '../cart/cart.model';
import Swal from 'sweetalert2';
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
  allUsersCart: Cart[];
  myProductsListSub: Subscription;
  productsListSub: Subscription;
  newProductToggle: boolean = false;
  contentLoaded: boolean = false;
  isSeller: boolean = false;
  checkEmail: boolean = false;
  isEditMode: boolean = false;
  noProducts: boolean = false;
  updatedProductIndex: number = -1;
  purchase: number = 0;
  product: Product = {
    id: -1,
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
          this.allUsersCart = res;
          for (let i = 0; i < res.length; i++) {
            if (
              res[i].userEmail === this.authService.userDataToBeShared.email
            ) {
              this.checkEmail = true;
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
    let id = this.idGenerator();
    let name = null;
    let imageurl = null;
    let quantity = null;
    let price = null;
    let purchased = 0;

    if (this.isEditMode) {
      id = product.id;
      name = product.productName;
      imageurl = product.productImage;
      quantity = product.productQuantity;
      price = product.productPrice;
      purchased = product.productPurchased;
    }

    this.productForm = new FormGroup({
      id: new FormControl(id),
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

  onEditProduct(index: number) {
    this.isEditMode = true;
    this.updatedProductIndex = index;
    this.initForm(this.myProductsList[index]);
    this.newProductToggle = !this.newProductToggle;
  }

  onDeleteProduct(index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productsList.splice(
          this.findProductIndex(this.myProductsList[index]),
          1
        );

        let id = this.myProductsList[index].id;

        this.allUsersCart.forEach((user: Cart) => {
          if (user.cartProducts != undefined) {
            user.cartProducts.filter(function (product, i) {
              if (product.id == id) {
                user.cartProducts.splice(i, 1);
              }
            });
          }
        });

        console.log(this.allUsersCart);

        this.myProductsList.splice(index, 1);
        this.productService.updateProductList(this.productsList);
        this.cartService.addCart(this.allUsersCart);

        Swal.fire({
          title: 'Deleted!',
          text: 'Your file has been deleted.',
          icon: 'success',
        });
      } else {
        return;
      }
    });
  }

  checkForNumbers(event) {
    return event.charCode == 8 || event.charCode == 0
      ? null
      : event.charCode >= 48 && event.charCode <= 57;
  }

  noPaste(e: Event) {
    e.preventDefault();
    return false;
  }

  findProductIndex(product: Product) {
    for (let i = 0; i < this.productsList.length; i++) {
      if (this.productsList[i].id == product.id) {
        return i;
      }
    }
  }

  deleteProductFromUsersCart(list: Product[], id: number) {
    list.filter(function (product, i) {
      if (product.id == id) {
        list.splice(i, 1);
      }
    });
  }

  private idGenerator() {
    return Math.round(Math.random() * Math.pow(10, 10));
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
    if (!this.isEditMode) {
      this.productForm.patchValue({
        productPurchased: 0,
      });
      if (this.myProductsList === undefined) {
        this.myProductsList = [];
      }
      this.noProducts = false;
      this.myProductsList.push(this.productForm.value);
      this.productsList.push(this.productForm.value);
    } else {
      this.productsList.splice(
        this.findProductIndex(this.myProductsList[this.updatedProductIndex]),
        1,
        this.productForm.value
      );
      this.myProductsList.splice(
        this.updatedProductIndex,
        1,
        this.productForm.value
      );

      this.isEditMode = !this.isEditMode;
    }
    this.noProducts = false;

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
