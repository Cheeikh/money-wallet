import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionService } from '../../../services/session.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-session-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            Bon retour !
          </h2>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            {{storedUser?.firstName || storedUser?.prenom}} {{storedUser?.lastName || storedUser?.nom}}
          </p>
        </div>

        <div class="mt-8 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code PIN
            </label>
            <div class="mt-4 flex gap-2 justify-center">
              <input
                *ngFor="let i of [0,1,2,3]"
                type="password"
                maxlength="1"
                [(ngModel)]="pinDigits[i]"
                (input)="onPinInput($event, i)"
                (keydown)="onPinKeydown($event, i)"
                [name]="'pin-' + i"
                class="w-12 h-12 text-center border rounded-lg text-lg font-bold"
              >
            </div>
            <p *ngIf="error" class="mt-2 text-sm text-red-600">{{error}}</p>
          </div>

          <div class="flex justify-between items-center">
            <button (click)="switchAccount()"
                    class="text-sm text-indigo-600 hover:text-indigo-500">
              Utiliser un autre compte
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SessionLoginComponent implements OnInit {
  pinDigits: string[] = ['', '', '', ''];
  error: string = '';
  storedUser: User | null = null;

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit() {
    const session = this.sessionService.getStoredSession();
    this.storedUser = session?.user || null;
    
    if (!this.storedUser) {
      this.router.navigate(['/login']);
    }
  }

  onPinInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.pinDigits[index] = value.replace(/[^0-9]/g, '');

    if (value.length === 1 && index < 3) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }

    if (this.isPinComplete()) {
      this.verifyPin();
    }
  }

  onPinKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      if (index > 0 && !this.pinDigits[index]) {
        this.pinDigits[index - 1] = '';
        const prevInput = (event.target as HTMLElement).previousElementSibling as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      } else {
        this.pinDigits[index] = '';
      }
    }
  }

  isPinComplete(): boolean {
    return this.pinDigits.every(digit => digit.length === 1);
  }

  verifyPin() {
    const pin = this.pinDigits.join('');
    this.authService.verifyPinForStoredSession(pin).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'Code PIN incorrect';
          this.pinDigits = ['', '', '', ''];
        }
      },
      error: () => {
        this.error = 'Une erreur est survenue';
      }
    });
  }

  switchAccount() {
    this.authService.switchAccount();
  }
} 