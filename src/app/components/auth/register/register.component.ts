import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { inject } from '@angular/core';
import { PhoneInputComponent } from '../../shared/phone-input/phone-input.component';

interface UserData {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  pin: string;
  confirmPin: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PhoneInputComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Logo et titre -->
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Créer un compte
          </h2>
        </div>

        <!-- Étape 1: Numéro de téléphone -->
        <div *ngIf="currentStep === 'phone'" class="mt-8 space-y-6 animate-fadeIn">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Numéro de téléphone
            </label>
            <div class="mt-1">
              <app-phone-input
                (phoneNumberChange)="onPhoneNumberChange($event)"
                (validityChange)="onValidityChange($event)"
              ></app-phone-input>
            </div>
          </div>

          <button
            (click)="requestOTP()"
            [disabled]="!isPhoneValid"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            Continuer
          </button>
        </div>

        <!-- Étape 2: Code OTP -->
        <div *ngIf="currentStep === 'otp'" class="mt-8 space-y-6 animate-fadeIn">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code de vérification
            </label>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Un code a été envoyé au {{userData.phoneNumber}}
            </p>
            <div class="flex gap-2 justify-center">
              <input
                *ngFor="let i of [0,1,2,3,4,5]"
                type="text"
                maxlength="1"
                [(ngModel)]="otpDigits[i]"
                (input)="onOtpInput($event, i)"
                (keydown)="onOtpKeydown($event, i)"
                class="w-12 h-12 text-center border rounded-lg text-lg font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>
            <p *ngIf="otpError" class="mt-2 text-sm text-red-600">{{otpError}}</p>
          </div>

          <div class="flex justify-between items-center">
            <button
              (click)="currentStep = 'phone'"
              class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Modifier le numéro
            </button>
            <button
              (click)="resendOTP()"
              [disabled]="resendCountdown > 0"
              class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 disabled:opacity-50">
              Renvoyer le code {{resendCountdown > 0 ? '(' + resendCountdown + ')' : ''}}
            </button>
          </div>

          <button
            (click)="verifyOTP()"
            [disabled]="!isOtpComplete()"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            Vérifier
          </button>
        </div>

        <!-- Étape 3: Informations utilisateur -->
        <div *ngIf="currentStep === 'info'" class="mt-8 space-y-6 animate-fadeIn">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prénom
              </label>
              <input
                type="text"
                [(ngModel)]="userData.firstName"
                class="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom
              </label>
              <input
                type="text"
                [(ngModel)]="userData.lastName"
                class="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                [(ngModel)]="userData.email"
                class="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
            </div>
          </div>

          <button
            (click)="nextStep()"
            [disabled]="!isUserInfoValid()"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            Continuer
          </button>
        </div>

        <!-- Étape 4: Création du PIN -->
        <div *ngIf="currentStep === 'pin'" class="mt-8 space-y-6 animate-fadeIn">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Créer votre code PIN
              </label>
              <input
                type="password"
                [(ngModel)]="userData.pin"
                maxlength="4"
                placeholder="****"
                class="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmer le code PIN
              </label>
              <input
                type="password"
                [(ngModel)]="userData.confirmPin"
                maxlength="4"
                placeholder="****"
                class="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
            </div>
            <p *ngIf="pinError" class="mt-2 text-sm text-red-600">{{pinError}}</p>
          </div>

          <button
            (click)="register()"
            [disabled]="!isPinValid()"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            S'inscrire
          </button>
        </div>

        <!-- Lien vers la connexion -->
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Déjà inscrit ?
            <a routerLink="/login" 
               class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class RegisterComponent {
  currentStep: 'phone' | 'otp' | 'info' | 'pin' = 'phone';
  userData: UserData = {
    phoneNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    pin: '',
    confirmPin: ''
  };
  
  otpDigits: string[] = ['', '', '', '', '', ''];
  
  phoneError: string = '';
  otpError: string = '';
  pinError: string = '';
  
  isPhoneValid: boolean = false;
  resendCountdown: number = 0;
  
  private router = inject(Router);
  private authService = inject(AuthService);
  private userId: string = '';

  onPhoneNumberChange(phoneNumber: string) {
    this.userData.phoneNumber = phoneNumber;
  }

  onValidityChange(isValid: boolean) {
    this.isPhoneValid = isValid;
  }

  requestOTP() {
    if (this.isPhoneValid) {
        console.log('Envoi du numéro:', { phoneNumber: this.userData.phoneNumber });
        
        this.authService.initiateRegister({
            phoneNumber: this.userData.phoneNumber
        }).subscribe({
            next: (response) => {
                this.userId = response.userId;
                this.currentStep = 'otp';
                this.startResendCountdown();
            },
            error: (error) => {
                console.error('Erreur lors de la requête:', error);
                this.phoneError = error.error?.message || 'Une erreur est survenue';
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

  isOtpComplete(): boolean {
    return this.otpDigits.every(digit => digit.length === 1);
  }

  verifyOTP() {
    if (!this.isOtpComplete()) return;
    
    const otp = this.otpDigits.join('');
    
    if (otp.length !== 6) {
      this.otpError = 'Le code doit contenir 6 chiffres';
      return;
    }
    
    this.currentStep = 'info';
  }

  isUserInfoValid(): boolean {
    return Boolean(
      this.userData.firstName &&
      this.userData.lastName &&
      this.userData.email &&
      this.userData.email.includes('@')
    );
  }

  nextStep() {
    if (this.currentStep === 'info') {
      this.currentStep = 'pin';
    }
  }

  isPinValid(): boolean {
    if (!this.userData.pin || this.userData.pin.length !== 4) {
      this.pinError = 'Le code PIN doit contenir 4 chiffres';
      return false;
    }
    if (this.userData.pin !== this.userData.confirmPin) {
      this.pinError = 'Les codes PIN ne correspondent pas';
      return false;
    }
    this.pinError = '';
    return true;
  }

  register() {
    if (this.isPinValid()) {
      const otp = this.otpDigits.join('');
      this.authService.completeRegister({
        userId: this.userId,
        otpCode: otp,
        firstName: this.userData.firstName,
        lastName: this.userData.lastName,
        pinCode: this.userData.pin
      }).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.pinError = error.error?.message || 'Une erreur est survenue';
        }
      });
    }
  }
} 