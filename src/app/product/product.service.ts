import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from './product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private url =
    'https://product-shop-5610d-default-rtdb.asia-southeast1.firebasedatabase.app/products.json';

  constructor(private http: HttpClient) {}

  getProductList() {
    return this.http.get<Product[]>(this.url);
  }
}
