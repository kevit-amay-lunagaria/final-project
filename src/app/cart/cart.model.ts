import { Product } from '../product/product.model';

export class Cart {
  public userEmail: string;
  public cartProducts: Product[];
  public myProducts: Product[];
  public userFullName: string;

  constructor(
    email: string,
    addedProducts: Product[],
    products: Product[],
    fname: string
  ) {
    this.userEmail = email;
    this.cartProducts = addedProducts;
    this.myProducts = products;
    this.userFullName = fname;
  }
}
