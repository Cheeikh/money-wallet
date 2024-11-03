import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  template: `
    <div class="relative">
      <!-- Bouton fermer -->
      <button (click)="onClose.emit()" 
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors">
        <i class="fas fa-times text-sm"></i>
      </button>

      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <!-- En-tête -->
        <div class="text-center mb-6">
          <div class="mb-2">
            <i [class]="icon" class="text-2xl" [ngClass]="iconColorClass"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{title}}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{description}}</p>
        </div>

        <!-- QR Code -->
        <div class="flex justify-center mb-6">
          <div class="bg-white p-4 rounded-lg shadow-inner">
            <ng-container *ngIf="!loading; else loadingTemplate">
              <qrcode *ngIf="data"
                [qrdata]="data"
                [width]="size"
                [errorCorrectionLevel]="'M'"
                [colorDark]="'#000000'"
                [colorLight]="'#FFFFFF'"
                [margin]="2"
                [elementType]="'canvas'"
                class="block"
              ></qrcode>
              <div *ngIf="!data" class="flex items-center justify-center" 
                   [style.width.px]="size" [style.height.px]="size">
                <p class="text-sm text-gray-500">Aucune donnée disponible</p>
              </div>
            </ng-container>
            
            <ng-template #loadingTemplate>
              <div class="flex items-center justify-center" 
                   [style.width.px]="size" [style.height.px]="size">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Instructions -->
        <div class="text-center space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Scannez ce QR code pour {{action}}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Le code expirera dans {{expirationTime}} secondes
          </p>
        </div>

        <!-- Montant si spécifié -->
        <div *ngIf="amount" class="mt-4 text-center">
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{amount | currency:'EUR'}}
          </p>
        </div>
      </div>
    </div>
  `
})
export class QRCodeComponent implements OnInit {
  @Input() data: string = '';
  @Input() size: number = 200;
  @Input() title: string = 'QR Code';
  @Input() description: string = '';
  @Input() action: string = 'effectuer le paiement';
  @Input() darkMode: boolean = false;
  @Input() icon: string = 'fas fa-qrcode';
  @Input() iconColorClass: string = 'text-indigo-600 dark:text-indigo-400';
  @Input() amount?: number;
  @Input() expirationTime: number = 300; // 5 minutes par défaut
  @Input() loading: boolean = false;
  @Output() onClose = new EventEmitter<void>();

  ngOnInit() {
    if (!this.data) {
      console.warn('En attente des données QR...');
    }
  }
} 