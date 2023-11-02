import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../product/product.service';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  userForm: any;
  userEmail: string = '';
  userPassword: string = '';
  isLogin: boolean = false;
  authSub: Subscription;
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated;
    if (this.isAuthenticated) {
      this.authService.logout();
    }

    this.userForm = new FormGroup({
      userFirstName: new FormControl(null, [Validators.required]),
      userLastName: new FormControl(null, [Validators.required]),
      userEmail: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
      ]),
      userPassword: new FormControl(null, Validators.required),
    });
  }

  onSubmit() {
    if (!this.userForm.valid) {
      if (this.isLogin) {
        if (
          this.userForm.userFirstName == null &&
          this.userForm.userLastName == null
        ) {
          this.authSub = this.authService.onLogIn(this.userForm.value);
        } else {
          return;
        }
        return;
      }
      return;
    }
    this.authSub = this.authService.onSignUp(this.userForm.value);

    // authObservable.subscribe({
    //   next: (resData) => {
    //     console.log(resData);
    //   },
    //   error: (error) => {
    //     console.log(error);
    //   },
    // });
  }

  onLogin() {
    this.isLogin = !this.isLogin;
  }
}
