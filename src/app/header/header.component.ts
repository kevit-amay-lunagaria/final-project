import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  isSeller: boolean = false;
  fname: string = '';
  showAvatarOptions: boolean = false;
  userSub: Subscription;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe((res) => {
      if (this.authService.userRole === 'seller') {
        this.isSeller = true;
      } else {
        this.isSeller = false;
      }
      this.isAuthenticated = !!res;
      this.fname = this.authService.userFullName;
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
