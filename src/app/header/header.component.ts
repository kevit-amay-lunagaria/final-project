import { Component, DoCheck, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, DoCheck {
  isAuthenticated: boolean = false;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  ngDoCheck(): void {
    this.isAuthenticated = this.authService.isAuthenticated;
  }
}
