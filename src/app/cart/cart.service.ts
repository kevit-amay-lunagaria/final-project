import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../product/product.model';
import { Cart } from './cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private addedProducts: Product[] = [];
  private urlCart =
    'https://product-shop-5610d-default-rtdb.asia-southeast1.firebasedatabase.app/carts.json';
  private urlProduct =
    'https://product-shop-5610d-default-rtdb.asia-southeast1.firebasedatabase.app/products.json';
  private cart: Cart = { userEmail: 'example@gmail.com', cartProducts: [] };

  constructor(private http: HttpClient) {}

  getAddedProducts(products: Product[]) {
    this.addedProducts = products;
    this.cart.cartProducts = products;

    // this.http.put<Product[]>(this.urlProduct, products).subscribe((res) => {
    //   console.log(res);
    // });

    // this.http.put<Cart>(this.urlCart, this.cart).subscribe((res) => {
    //   console.log(res);
    // });
  }

  // showCartProducts() {
  //   return this.http.get<Cart>(this.urlCart);
  // }
}
