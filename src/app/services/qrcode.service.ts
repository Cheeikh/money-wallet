import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { take, map, filter, tap, switchMap, catchError } from 'rxjs/operators';
import { QRCodeAction, QRCodeData } from '../models/qr-code.model';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QRCodeService {
  private qrDataSubject = new BehaviorSubject<string>('');
  qrData$ = this.qrDataSubject.asObservable();

  constructor(private authService: AuthService, private http: HttpClient) {}

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

  validateScannedQR(qrData: QRCodeData): Observable<boolean> {
    return this.http.post<boolean>(`${environment.apiUrl}/qr/validate`, qrData).pipe(
      catchError(error => {
        console.error('Erreur lors de la validation du QR code:', error);
        return throwError(() => new Error('QR code invalide ou expiré'));
      })
    );
  }

  processQRTransfer(qrData: QRCodeData, pin: string): Observable<any> {
    const transferData = {
      sourceUserId: qrData.userId,
      amount: qrData.amount,
      description: qrData.description,
      pin: pin
    };

    return this.http.post(`${environment.apiUrl}/transfers/qr`, transferData).pipe(
      catchError(error => {
        console.error('Erreur lors du transfert via QR:', error);
        return throwError(() => new Error('Échec du transfert'));
      })
    );
  }
} 