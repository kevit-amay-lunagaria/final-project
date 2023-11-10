import { Component, DoCheck, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, DoCheck {
  isAuthenticated: boolean = false;
  isSeller: boolean = false;
  fname: string = '';
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  ngDoCheck(): void {
    if (this.authService.userRole === 'seller') {
      this.isSeller = true;
    } else {
      this.isSeller = false;
    }
    this.fname = localStorage.getItem('userFname');
    this.isAuthenticated = this.authService.isAuthenticated;
  }
}
