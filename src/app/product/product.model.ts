export class Product {
  public id: number;
  public productName: string;
  public productImage: string;
  public productPrice: number;
  public productPurchased: number;
  public productQuantity: number;

  constructor(
    pid: number,
    name: string,
    imageurl: string,
    pruchased: number,
    price: number,
    quantity: number
  ) {
    this.id = pid;
    this.productName = name;
    this.productImage = imageurl;
    this.productPrice = price;
    this.productPurchased = pruchased;
    this.productQuantity = quantity;
  }
}
