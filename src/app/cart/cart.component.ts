import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  productList: Product[] = [];
  isProductListEmpty: boolean = false;
  changedProductList: Product[] = [];
  contentLoaded: boolean = false;
  totalItems: number = 0;
  subTotal: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.productService.getProductList().subscribe((res: Product[]) => {
        for (let i = 0; i < res.length; i++) {
          this.changedProductList.push(res[i]);
          if (res[i].productPurchased != 0) {
            this.productList.push(res[i]);
            this.totalItems += res[i].productPurchased;
            this.subTotal += res[i].productPrice * res[i].productPurchased;
          }
        }
        this.contentLoaded = true;
        if (this.productList.length == 0) {
          this.isProductListEmpty = true;
        } else {
          this.isProductListEmpty = false;
        }
      });
    }, 1500);

    // console.log(this.productList);
    // console.log(this.changedProductList);
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

      // console.log(this.changedProductList);

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
    this.productService.updateProductList(this.changedProductList);
  }
}
