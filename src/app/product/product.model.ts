export class Product {
  public productName: string;
  public productImage: string;
  public productPrice: number;
  public productQuantity: number;

  constructor(name: string, imageurl: string, price: number, quantity: number) {
    this.productName = name;
    this.productImage = imageurl;
    this.productPrice = price;
    this.productQuantity = quantity;
  }
}
