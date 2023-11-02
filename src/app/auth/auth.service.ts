import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from './user.model';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { AuthUser } from './authUser.model';
import { Router } from '@angular/router';

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

  private urlSignUp: string =
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDVMLaQkLU8k3l_1Xn9rMMuK7S3gVunoHA';
  private urlLogIn: string =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDVMLaQkLU8k3l_1Xn9rMMuK7S3gVunoHA';

  constructor(private http: HttpClient, private router: Router) {}

  onSignUp(user: User) {
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
          // console.log(resData);
          this.isAuthenticated = true;
          this.router.navigate(['/products']);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  onLogIn(user: User) {
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
          // console.log(resData);
          this.isAuthenticated = true;
          this.router.navigate(['/products']);
        },
        error: (error) => {
          console.log(error);
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
    // console.log(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
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
