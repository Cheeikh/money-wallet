import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, LoginResponse, RegisterResponse } from '../models/user.model';
import { SessionService } from './session.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private router: Router
  ) {
    console.log('AuthService initialized');
    this.restoreSession();
  }

  private restoreSession() {
    const session = this.sessionService.getStoredSession();
    if (session?.token) {
      console.log('Session found, loading profile...');
      localStorage.setItem('token', session.token);
      this.currentUserSubject.next(session.user);
      this.loadUserProfile().subscribe({
        next: (user) => {
          console.log('Profile loaded:', user);
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          if (error.status === 401) {
            this.logout();
          }
        }
      });
    } else {
      console.log('No session found');
    }
  }

  private loadUserProfile(): Observable<User | null> {
    console.log('Loading user profile...');
    return this.http.get<User>(`${environment.apiUrl}/auth/profile`).pipe(
      tap(user => {
        console.log('User profile received:', user);
        if (user) {
          this.currentUserSubject.next(user);
          const session = this.sessionService.getStoredSession();
          if (session) {
            this.sessionService.saveSession(user, session.token);
          }
        }
      }),
      catchError(error => {
        console.error('Error loading profile:', error);
        if (error.status === 401) {
          this.sessionService.clearSession();
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  refreshUserProfile(): Observable<User | null> {
    const session = this.sessionService.getStoredSession();
    if (!session) {
      return throwError(() => new Error('No session found'));
    }
    return this.loadUserProfile();
  }

  verifyPinForStoredSession(pin: string): Observable<boolean> {
    const session = this.sessionService.getStoredSession();
    if (!session?.user) return of(false);

    return this.http.post<{ valid: boolean }>(
      `${environment.apiUrl}/auth/verify-pin`,
      { userId: session.user.id, pin }
    ).pipe(
      map(response => response.valid),
      catchError(() => of(false))
    );
  }

  switchAccount() {
    this.sessionService.clearSession();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  completeLogin(userId: string, otpCode: string, pinCode: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/complete-login`,
      { userId, otpCode, pinCode }
    ).pipe(
      tap(response => {
        if (response.token) {
          console.log('Login successful, saving session...');
          localStorage.setItem('token', response.token);
          this.sessionService.saveSession(response.user, response.token);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  initiateLogin(phoneNumber: string): Observable<{ message: string; userId: string }> {
    return this.http.post<{ message: string; userId: string }>(
      `${environment.apiUrl}/auth/initiate-login`,
      { phoneNumber }
    );
  }

  initiateRegister(data: { phoneNumber: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${environment.apiUrl}/auth/initiate-register`,
      data
    );
  }

  completeRegister(data: {
    userId: string;
    otpCode: string;
    pinCode: string;
    firstName: string;
    lastName: string;
  }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/complete-register`,
      data
    ).pipe(
      tap(response => {
        if (response.token) {
          this.sessionService.saveSession(response.user, response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  getToken(): string | null {
    const session = this.sessionService.getStoredSession();
    return session?.token || null;
  }

  logout() {
    localStorage.removeItem('token');
    this.sessionService.clearSession();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
} 