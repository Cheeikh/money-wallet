import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../../services/wallet.service';
import { QRCodeService } from '../../../services/qrcode.service';
import { QRCodeComponent } from '../qr-code/qr-code.component';
import { ThemeService } from '../../../services/theme.service';
import { map } from 'rxjs/operators';
import { QRCodeAction } from '../../../models/qr-code.model';

interface QRConfig {
  title: string;
  description: string;
  action: string;
}

type QRConfigs = Record<QRCodeAction, QRConfig>;

@Component({
  selector: 'app-quick-actions',
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
      <!-- Solde -->
      <div class="card p-6 bg-white dark:bg-gray-800 cursor-pointer"
           (click)="toggleBalanceVisibility()">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-white dark:text-gray-400">Solde disponible</p>
            <p class="text-2xl font-bold mt-1 text-white dark:text-gray-400" [class.blur-sm]="(hideBalance$ | async)">
              {{(balance$ | async) | currency:'EUR'}}
            </p>
          </div>
          <div class="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900">
            <i class="fas fa-eye{{(hideBalance$ | async) ? '-slash' : ''}} text-indigo-600 dark:text-indigo-400"></i>
          </div>
        </div>
      </div>

      <!-- QR Code -->
      <div class="card p-6 bg-white dark:bg-gray-800">
        <div class="flex flex-col items-center justify-center h-full">
          <div class="mb-4">
            <i class="fas fa-qrcode text-3xl text-indigo-600 dark:text-indigo-400"></i>
          </div>
          <h3 class="text-lg font-medium text-white dark:text-white mb-2">
            Mon QR Code
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
            Utilisez ce QR code pour recevoir des paiements
          </p>
          <button (click)="showQRForAction('transfer')"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Afficher le QR Code
          </button>
        </div>
      </div>

      <!-- QR Code Modal -->
      <div *ngIf="showQR" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
           (click)="closeQR()">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full" 
             (click)="$event.stopPropagation()">
          <app-qr-code
            [data]="qrData"
            [title]="qrTitle"
            [description]="qrDescription"
            [action]="qrAction"
            [darkMode]="(isDarkMode$ | async) ?? false"
            (onClose)="closeQR()">
          </app-qr-code>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, QRCodeComponent]
})
export class QuickActionsComponent {
  balance$ = this.walletService.balance$;
  hideBalance$ = this.walletService.hideBalance$;
  qrData$ = this.qrService.qrData$;
  isDarkMode$ = this.themeService.isDarkMode$;

  showQR = false;
  qrData = '';
  qrTitle = '';
  qrDescription = '';
  qrAction = '';
  loading = false;

  constructor(
    private walletService: WalletService,
    private qrService: QRCodeService,
    private themeService: ThemeService
  ) {
    this.walletService.refreshBalance();
  }

  toggleBalanceVisibility() {
    this.walletService.toggleBalanceVisibility();
  }

  showQRForAction(action: QRCodeAction) {
    this.loading = true;
    this.showQR = true;

    const config = this.getQRConfig(action);
    this.qrTitle = config.title;
    this.qrDescription = config.description;
    this.qrAction = config.action;

    this.qrService.generateQRCode(action).subscribe({
      next: (qrString) => {
        if (qrString) {
          this.qrData = qrString;
          console.log('QR code généré avec succès:', qrString);
        } else {
          console.error('QR string vide reçue');
          this.closeQR();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la génération du QR code:', error);
        this.loading = false;
        this.closeQR();
      }
    });
  }

  private getQRConfig(action: QRCodeAction): QRConfig {
    const configs: QRConfigs = {
      transfer: {
        title: 'Transfert',
        description: 'Partagez ce QR code pour recevoir un transfert',
        action: 'recevoir un transfert'
      },
      payment: {
        title: 'Paiement',
        description: 'Partagez ce QR code pour recevoir un paiement',
        action: 'effectuer un paiement'
      },
      deposit: {
        title: 'Dépôt',
        description: 'Scannez ce QR code pour effectuer un dépôt',
        action: 'effectuer un dépôt'
      },
      withdrawal: {
        title: 'Retrait',
        description: 'Scannez ce QR code pour effectuer un retrait',
        action: 'effectuer un retrait'
      },
      identification: {
        title: 'Identification',
        description: 'Scanner pour vous identifier',
        action: 'S\'identifier'
      }
    };

    return configs[action];
  }

  closeQR() {
    this.showQR = false;
    this.qrData = '';
    this.loading = false;
  }
} 