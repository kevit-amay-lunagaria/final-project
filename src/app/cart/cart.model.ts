import { Product } from '../product/product.model';

export class Cart {
  public userEmail: string;
  public cartProducts: Product[];

  constructor(email: string, addedProducts: Product[]) {
    this.userEmail = email;
    this.cartProducts = addedProducts;
  }
}
