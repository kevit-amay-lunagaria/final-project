import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ProductService } from '../product/product.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  userForm: any;
  userEmail: string = '';
  userPassword: string = '';

  constructor(private productSerice: ProductService) {}

  ngOnInit() {
    this.userForm = new FormGroup({
      userEmail: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
      ]),
      userPassword: new FormControl(null, Validators.required),
    });
  }

  getnew(e: Event) {}

  onSubmit() {
    if (!this.userForm.valid) {
      return;
    }
    this.productSerice.getProductList();
  }
}
