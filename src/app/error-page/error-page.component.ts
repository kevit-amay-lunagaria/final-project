import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
})
export class ErrorPageComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.authService.isAuthenticated) {
        this.router.navigate(['/products']);
        return;
      }
      this.router.navigate(['/auth']);
    }, 1700);
  }
}
