import { Component } from '@angular/core';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent {
  title = 'Shiba inu';
  subTitle = 'its a dog';
  content = 'lkkebfkebwkebk jebfkwgsgg';
  img = 'https://i.pinimg.com/originals/15/43/c1/1543c17eaa508b5e0acb1915a8dab634.jpg';
  productCount = 0;

  counter(i: number) {
    return new Array(i);
  }

  onIncrement() {
    if (this.productCount >= 999) return;
    this.productCount++;
  }

  onDecrement() {
    if (this.productCount <= 0) return;
    this.productCount--;
  }
}
