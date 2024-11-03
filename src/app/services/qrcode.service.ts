import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { take, map, filter, tap, switchMap, catchError } from 'rxjs/operators';
import { QRCodeAction, QRCodeData } from '../models/qr-code.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class QRCodeService {
  private qrDataSubject = new BehaviorSubject<string>('');
  qrData$ = this.qrDataSubject.asObservable();

  constructor(private authService: AuthService) {}

  generateQRCode(action: QRCodeAction, options?: { amount?: number; description?: string }): Observable<string> {
    console.log('Generating QR code for action:', action);
    
    return this.authService.currentUser$.pipe(
      take(1),
      switchMap((user: User | null) => {
        if (!user) {
          return this.authService.refreshUserProfile().pipe(
            switchMap(() => this.authService.currentUser$.pipe(take(1)))
          );
        }
        return of(user);
      }),
      map((user: User | null) => {
        if (!user) {
          throw new Error('No user data available');
        }
        
        const qrData: QRCodeData = {
          type: action,
          userId: user.id,
          phone: user.telephone,
          timestamp: new Date().getTime(),
          expiresIn: 300,
          ...(options?.amount && { amount: options.amount }),
          ...(options?.description && { description: options.description })
        };
        
        const qrString = JSON.stringify(qrData);
        console.log('Generated QR data:', qrData);
        this.qrDataSubject.next(qrString);
        return qrString;
      }),
      catchError(error => {
        console.error('Error generating QR code:', error);
        return throwError(() => error);
      })
    );
  }
} 