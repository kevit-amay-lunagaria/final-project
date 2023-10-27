import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  url =
    'https://product-shop-5610d-default-rtdb.asia-southeast1.firebasedatabase.app/products.json';

  constructor(private http: HttpClient) {}

  getProductList() {
    this.http.get(this.url).subscribe((res) => {
      console.log(res[0]);
    });
  }
}
