import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from './product.service';
import { Product } from './product.model';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit, OnDestroy {
  title = 'Some Rice';
  subTitle = 'its food';
  content = 'lkkebfkebwkebk jebfkwgsgg';
  img =
    'https://i.pinimg.com/originals/15/43/c1/1543c17eaa508b5e0acb1915a8dab634.jpg';
  productCount = 0;
  productList: Product[] = [];
  productListSub: Subscription;
  purchase: number = 0;
  newProductToggle: boolean = false;
  productForm: any;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productListSub = this.productService
      .getProductList()
      .subscribe((res: Product[]) => {
        this.productList = res;
      });

    this.productForm = new FormGroup({
      pname: new FormControl(null, []),
      pimage: new FormControl(null, []),
      pquantity: new FormControl(null, []),
      pprice: new FormControl(null, []),
      ppurchased: new FormControl(0, null),
    });
  }

  // counter(i: number) {
  //   return new Array(i);
  // }

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

  onHandlePurchase(index: number, purchased: number) {
    if (purchased > this.productList[index].productQuantity) return;
    this.productList[index].productQuantity -= purchased;
    this.purchase += +purchased;
  }

  totalPurchase(index: number) {
    // (blur)="totalPurchase(i)"
    this.productList[index].productPurchased = this.purchase;
    this.purchase = 0;
  }

  onAddNewProduct() {
    this.newProductToggle = !this.newProductToggle;
  }

  onSubmit() {
    console.log(this.productForm.value);
  }

  ngOnDestroy(): void {
    this.productListSub.unsubscribe();
  }
}
