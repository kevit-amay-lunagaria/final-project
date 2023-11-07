import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../product/product.model';
import { Cart } from './cart.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private urlCart =
    'https://product-shop-5610d-default-rtdb.asia-southeast1.firebasedatabase.app/carts.json';
  private urlProduct =
    'https://product-shop-5610d-default-rtdb.asia-southeast1.firebasedatabase.app/products.json';
  private cart: Cart[];

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAddedProducts(products: Product[]) {
    this.getCarts().subscribe((res: Cart[]) => {
      this.cart = res;
      for (let i = 0; i < this.cart.length; i++) {
        if (
          this.cart[i].userEmail == this.authService.userDataToBeShared.email
        ) {
          // if (this.cart[i].cartProducts === undefined) {
          //   this.cart[i].cartProducts = [];
          // }
          this.cart[i].cartProducts = [];
          this.cart[i].cartProducts.push(...products);
          this.addCart(this.cart);
          return;
        }
      }
    });
  }

  getCarts() {
    return this.http.get<Cart[]>(this.urlCart);
  }

  addCart(cart: Cart[]) {
    this.http.put<Cart[]>(this.urlCart, cart).subscribe((res: Cart[]) => {
      console.log(res);
    });
  }
}
