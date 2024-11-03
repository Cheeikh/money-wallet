import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';
import { QRCodeAction, QRCodeData } from '../../../models/qr-code.model';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  template: `
    <div class="relative">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div class="text-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Scanner un QR code</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Placez le QR code dans le cadre pour le scanner
          </p>
        </div>

        <div class="relative">
          <zxing-scanner
            [enable]="scannerEnabled"
            (scanSuccess)="onCodeScanned($event)"
            [formats]="allowedFormats"
            [tryHarder]="true"
          ></zxing-scanner>

          <div class="absolute inset-0 border-2 border-indigo-500 rounded-lg pointer-events-none"></div>
        </div>

        <div class="mt-4 flex justify-center">
          <button (click)="toggleScanner()" 
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            {{ scannerEnabled ? 'Désactiver' : 'Activer' }} le scanner
          </button>
        </div>
      </div>
    </div>
  `
})
export class QRScannerComponent implements OnInit, OnDestroy {
  @Output() scanComplete = new EventEmitter<QRCodeData>();
  
  scannerEnabled = true;
  private scannerState = new BehaviorSubject<boolean>(true);
  allowedFormats = [BarcodeFormat.QR_CODE];

  ngOnInit() {
    this.scannerState.next(true);
  }

  ngOnDestroy() {
    this.scannerState.next(false);
  }

  toggleScanner() {
    this.scannerEnabled = !this.scannerEnabled;
    this.scannerState.next(this.scannerEnabled);
  }

  onCodeScanned(result: string) {
    try {
      const qrData: QRCodeData = JSON.parse(result);
      this.scanComplete.emit(qrData);
    } catch (error) {
      console.error('Erreur lors du décodage du QR code:', error);
    }
  }
} 