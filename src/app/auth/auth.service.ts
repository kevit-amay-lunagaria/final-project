import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from './user.model';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { AuthUser } from './authUser.model';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment.prod';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated: boolean = false;
  user = new BehaviorSubject<AuthUser>(null);
  private tokenExpirationTimer: any;
  userFullName: string = '';
  userRole: string = '';
  userDataToBeShared: AuthUser;
  errorMessage: string = '';

  private urlSignUp: string =
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
    environment.fireBaseAPIKey;
  private urlLogIn: string =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
    environment.fireBaseAPIKey;

  constructor(private http: HttpClient, private router: Router) {}

  onSignUp(user: User) {
    this.userRole = user.userRole;
    this.userFullName = user.userFirstName + ' ' + user.userLastName;
    return this.http
      .post<AuthResponseData>(this.urlSignUp, {
        email: user.userEmail,
        password: user.userPassword,
        returnSecureToken: true,
      })
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      )
      .subscribe({
        next: (resData) => {
          this.isAuthenticated = true;
          this.router.navigate(['/myproducts']);
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        },
      });
  }

  onLogIn(user: User) {
    this.userRole = user.userRole;
    return this.http
      .post<AuthResponseData>(this.urlLogIn, {
        email: user.userEmail,
        password: user.userPassword,
        returnSecureToken: true,
      })
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      )
      .subscribe({
        next: (resData) => {
          this.isAuthenticated = true;
          this.router.navigate(['/myproducts']);
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        },
      });
  }

  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    this.userFullName = localStorage.getItem('userFullName');
    this.userRole = localStorage.getItem('userRole');
    this.userDataToBeShared = JSON.parse(localStorage.getItem('userData'));

    const loadedUser = new AuthUser(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
    this.isAuthenticated = true;
  }

  logout() {
    this.isAuthenticated = false;
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userFullName');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);

    this.isAuthenticated = false;
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new AuthUser(email, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    this.userDataToBeShared = user;
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('userRole', this.userRole);
    localStorage.setItem('userFullName', this.userFullName);
  }

  private handleError = (errorResponse) => {
    let errorMessage = 'An unknown error has occured!!';
    if (!errorResponse.error || !errorResponse.error.error) {
      return throwError(() => errorMessage);
    }
    switch (errorResponse.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'The email already exists!!';
        break;

      case 'EMAIL_NOT_FOUND':
        errorMessage = 'The email does not exist!!';
        break;

      case 'INVALID_PASSWORD':
        errorMessage = 'Invalid Password!!';
        break;

      case 'INVALID_LOGIN_CREDENTIALS':
        errorMessage = 'The credentials are invalid!!';
        break;
    }
    return throwError(() => errorMessage);
  };
}
