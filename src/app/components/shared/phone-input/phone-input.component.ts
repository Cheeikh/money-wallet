import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare const intlTelInput: any;

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <input
        #phoneInput
        type="tel"
        [class]="inputClass"
        (input)="onInputChange($event)"
        class="appearance-none rounded-lg relative block w-full px-3 py-2 pl-[120px] border-0 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:text-sm"
        placeholder="XXXXXXXXXX"
      >
      <div *ngIf="error" class="text-red-500 dark:text-red-400 text-sm mt-1">{{ error }}</div>
    </div>
  `,
  styles: [`
    :host {
      @apply block relative;
    }

    :host ::ng-deep {
      .iti {
        @apply w-full;
        
        &__flag-container {
          @apply bg-transparent absolute inset-y-0 left-0 flex items-center px-2 rounded-l-lg;
        }
        
        &__selected-flag {
          @apply flex items-center h-full px-2 gap-1.5 cursor-pointer bg-transparent;

          &:hover {
            @apply bg-black/5 dark:bg-white/5;
          }

          .iti__selected-dial-code {
            @apply text-gray-900 dark:text-gray-100 text-sm;
          }

          .iti__arrow {
            @apply ml-1 border-t-gray-500 dark:border-t-gray-400;
          }
        }

        &__country-list {
          @apply fixed z-50 rounded-lg mt-0.5 max-h-[80vh] w-[90vw] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                 overflow-y-auto shadow-lg bg-white dark:bg-gray-800 border-none;

          @screen sm {
            @apply absolute w-[280px] max-h-[220px] transform-none top-full;
            left: 0 !important;
          }
        }

        &__country {
          @apply px-3 py-2 flex items-center gap-2 text-gray-900 dark:text-gray-100;

          &:hover {
            @apply bg-gray-100 dark:bg-gray-700;
          }

          .iti__country-name {
            @apply mr-1.5;
          }

          .iti__dial-code {
            @apply text-gray-500 dark:text-gray-400 ml-auto;
          }
        }

        &__flag {
          @apply m-0;
        }
      }

      .iti__country-list::-webkit-scrollbar {
        @apply w-1.5;
      }

      .iti__country-list::-webkit-scrollbar-track {
        @apply bg-transparent;
      }

      .iti__country-list::-webkit-scrollbar-thumb {
        @apply bg-gray-400/50 rounded-sm;
      }
    }
  `]
})
export class PhoneInputComponent implements OnInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef;
  @Output() phoneNumberChange = new EventEmitter<string>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Input() inputClass = '';

  private iti: any;
  error: string = '';

  ngOnInit() {
    setTimeout(() => {
      this.initializePhoneInput();
    });
  }

  private initializePhoneInput() {
    const input = this.phoneInput.nativeElement;
    this.iti = intlTelInput(input, {
      preferredCountries: ['SN','FR', 'TN', 'DZ'],
      separateDialCode: true,
      utilsScript: 'assets/js/utils.js',
      initialCountry: 'SN'
    });

    input.addEventListener('countrychange', () => {
      this.validateNumber();
    });
  }

  onInputChange(event: any) {
    this.validateNumber();
  }

  private validateNumber() {
    if (this.iti.isValidNumber()) {
      this.error = '';
      this.phoneNumberChange.emit(this.iti.getNumber());
      this.validityChange.emit(true);
    } else {
      this.error = 'Numéro de téléphone invalide';
      this.validityChange.emit(false);
    }
  }

  ngOnDestroy() {
    if (this.iti) {
      this.iti.destroy();
    }
  }
} 