import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { inject } from '@angular/core';
import { PhoneInputComponent } from '../../shared/phone-input/phone-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PhoneInputComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
      <div class="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-10"></div>
      <div class="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <!-- Logo et titre -->
        <div class="w-full max-w-md text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-10 mb-4">
            <i class="fas fa-wallet text-white text-3xl"></i>
          </div>
          <h1 class="text-white text-2xl font-bold">MoneyWallet</h1>
          <p class="text-indigo-200">Gérez votre argent en toute simplicité</p>
        </div>
        
        <!-- Contenu -->
        <div class="w-full max-w-md">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <!-- Étape 1: Numéro de téléphone -->
            <div *ngIf="currentStep === 'phone'" class="p-8 animate-fadeIn">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connexion</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">Entrez votre numéro de téléphone pour continuer</p>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de téléphone
                  </label>
                  <app-phone-input
                    (phoneNumberChange)="onPhoneNumberChange($event)"
                    (validityChange)="onValidityChange($event)"
                    class="w-full"
                  ></app-phone-input>
                  <p *ngIf="phoneError" class="mt-2 text-sm text-red-600">{{phoneError}}</p>
                </div>

                <button
                  (click)="requestOTP()"
                  [disabled]="!isPhoneValid"
                  class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl">
                  Continuer
                </button>
              </div>
            </div>

            <!-- Étape 2: Code OTP -->
            <div *ngIf="currentStep === 'otp'" class="p-8 animate-fadeIn">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vérification</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Un code a été envoyé au {{phoneNumber}}
              </p>
              
              <div class="space-y-6">
                <div>
                  <div class="flex gap-3 justify-center mb-4">
                    <input
                      *ngFor="let i of [0,1,2,3,4,5]"
                      type="text"
                      maxlength="1"
                      [(ngModel)]="otpDigits[i]"
                      (input)="onOtpInput($event, i)"
                      (keydown)="onOtpKeydown($event, i)"
                      class="w-12 h-12 text-center border-2 rounded-xl text-lg font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                  </div>
                  <p *ngIf="otpError" class="mt-2 text-sm text-red-600 text-center">{{otpError}}</p>
                </div>

                <div class="flex justify-between items-center text-sm">
                  <button
                    (click)="currentStep = 'phone'"
                    class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium transition-colors">
                    Modifier le numéro
                  </button>
                  <button
                    (click)="resendOTP()"
                    [disabled]="resendCountdown > 0"
                    class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium disabled:opacity-50 transition-colors">
                    Renvoyer le code {{resendCountdown > 0 ? '(' + resendCountdown + ')' : ''}}
                  </button>
                </div>

                <button
                  (click)="verifyOTP()"
                  [disabled]="!isOtpComplete()"
                  class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl">
                  Vérifier
                </button>
              </div>
            </div>

            <!-- Étape 3: Code PIN -->
            <div *ngIf="currentStep === 'pin'" class="p-8 animate-fadeIn">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Code PIN</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Entrez votre code PIN pour accéder à votre compte
              </p>
              
              <div class="space-y-6">
                <div>
                  <div class="flex gap-3 justify-center mb-4">
                    <input
                      *ngFor="let i of [0,1,2,3]"
                      type="password"
                      maxlength="1"
                      [(ngModel)]="pinDigits[i]"
                      (input)="onPinInput($event, i)"
                      (keydown)="onPinKeydown($event, i)"
                      class="w-12 h-12 text-center border-2 rounded-xl text-lg font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                  </div>
                  <p *ngIf="pinError" class="mt-2 text-sm text-red-600 text-center">{{pinError}}</p>
                </div>

                <button
                  (click)="onPinSubmit(pinDigits.join(''))"
                  [disabled]="!isPinComplete()"
                  class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl">
                  Se connecter
                </button>
              </div>
            </div>

            <!-- Lien vers l'inscription -->
            <div class="p-6 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
              <p class="text-sm text-center text-gray-600 dark:text-gray-400">
                Pas encore de compte ?
                <a routerLink="/register" 
                   class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline transition-colors">
                  Créer un compte
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from { 
        opacity: 0;
        transform: translateY(-10px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host {
      display: block;
      min-height: 100vh;
    }

    input {
      caret-color: #4F46E5;
    }

    input:focus {
      outline: none;
      border-color: #4F46E5;
    }
  `]
})
export class LoginComponent {
  currentStep: 'phone' | 'otp' | 'pin' = 'phone';
  phoneNumber: string = '';
  otpDigits: string[] = ['', '', '', '', '', ''];
  pinDigits: string[] = ['', '', '', ''];
  
  phoneError: string = '';
  otpError: string = '';
  pinError: string = '';
  
  isPhoneValid: boolean = false;
  resendCountdown: number = 0;
  
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  
  private userId: string = '';
  private otpCode: string = '';

  onPhoneNumberChange(phoneNumber: string) {
    this.phoneNumber = phoneNumber;
  }

  onValidityChange(isValid: boolean) {
    this.isPhoneValid = isValid;
  }

  requestOTP() {
    if (this.isPhoneValid) {
      this.authService.initiateLogin(this.phoneNumber).subscribe({
        next: (response) => {
          this.userId = response.userId;
          this.currentStep = 'otp';
          this.startResendCountdown();
        },
        error: (error) => {
          this.phoneError = error.error.message || 'Une erreur est survenue';
        }
      });
    }
  }

  startResendCountdown() {
    this.resendCountdown = 30;
    const timer = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown === 0) {
        clearInterval(timer);
      }
    }, 1000);
  }

  resendOTP() {
    this.requestOTP();
  }

  onOtpInput(event: any, index: number) {
    const value = event.target.value;
    this.otpDigits[index] = value.replace(/[^0-9]/g, '');

    if (value.length === 1 && index < 5) {
      const nextInput = event.target.nextElementSibling;
      if (nextInput) nextInput.focus();
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      if (index > 0 && !this.otpDigits[index]) {
        this.otpDigits[index - 1] = '';
        const prevInput = (event.target as HTMLElement).previousElementSibling as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      } else {
        this.otpDigits[index] = '';
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = (event.target as HTMLElement).previousElementSibling as HTMLInputElement;
      if (prevInput) prevInput.focus();
    } else if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = (event.target as HTMLElement).nextElementSibling as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onPinInput(event: any, index: number) {
    const value = event.target.value;
    if (value.length === 1 && index < 3) {
      const nextInput = event.target.nextElementSibling;
      if (nextInput) nextInput.focus();
    }
  }

  onPinKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && index > 0 && !this.pinDigits[index]) {
      const prevInput = (event.target as HTMLElement).previousElementSibling as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }

  isOtpComplete(): boolean {
    return this.otpDigits.every(digit => digit.length === 1);
  }

  isPinComplete(): boolean {
    return this.pinDigits.every(digit => digit.length === 1);
  }

  verifyOTP() {
    if (!this.isOtpComplete()) return;
    
    const otp = this.otpDigits.join('');
    
    if (otp.length !== 6) {
      this.otpError = 'Le code doit contenir 6 chiffres';
      return;
    }

    this.otpCode = otp;
    this.currentStep = 'pin';
  }

  onPinSubmit(pin: string) {
    if (this.userId && this.otpCode) {
      this.authService.completeLogin(
        this.userId,
        this.otpCode,
        pin
      ).subscribe({
        next: (response) => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.notificationService.error(
            'Erreur de connexion',
            'Code PIN incorrect'
          );
        }
      });
    }
  }
} 