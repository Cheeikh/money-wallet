import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule, ZXingScannerComponent } from '@zxing/ngx-scanner';
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
            #scanner
            [(device)]="selectedDevice"
            [enable]="scannerEnabled"
            (scanSuccess)="onCodeScanned($event)"
            (permissionResponse)="onPermissionResponse($event)"
            (camerasFound)="onCamerasFound($event)"
            (scanError)="onScanError($event)"
            (scanComplete)="onScanComplete($event)"
            [formats]="allowedFormats"
            [tryHarder]="true"
            [torch]="torchEnabled"
            [autofocusEnabled]="true"
          ></zxing-scanner>

          <div class="absolute inset-0 border-2 border-indigo-500 rounded-lg pointer-events-none"></div>
        </div>

        <!-- Message d'état -->
        <div *ngIf="scannerMessage" class="mt-2 text-center text-sm"
             [class.text-red-500]="scannerError"
             [class.text-green-500]="!scannerError">
          {{ scannerMessage }}
        </div>

        <!-- Sélection de la caméra -->
        <div *ngIf="availableCameras.length > 1" class="mt-4">
          <select (change)="onDeviceSelectChange($event)" 
                  class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
            <option *ngFor="let device of availableCameras" [value]="device.deviceId">
              {{ device.label || 'Caméra ' + device.deviceId }}
            </option>
          </select>
        </div>

        <div class="mt-4 flex justify-center space-x-4">
          <button (click)="toggleScanner()" 
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            {{ scannerEnabled ? 'Désactiver' : 'Activer' }} le scanner
          </button>
          <button (click)="toggleTorch()" 
                  *ngIf="hasTorch"
                  class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            {{ torchEnabled ? 'Éteindre' : 'Allumer' }} la lampe
          </button>
        </div>
      </div>
    </div>
  `
})
export class QRScannerComponent implements OnInit, OnDestroy {
  @ViewChild('scanner') scanner!: ZXingScannerComponent;
  @Output() scanComplete = new EventEmitter<QRCodeData>();
  
  scannerEnabled = true;
  private scannerState = new BehaviorSubject<boolean>(true);
  allowedFormats = [BarcodeFormat.QR_CODE];
  
  availableCameras: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;
  hasTorch = false;
  torchEnabled = false;
  scannerMessage = '';
  scannerError = false;

  ngOnInit() {
    this.scannerState.next(true);
    console.log('Scanner initialisé');
    this.scannerMessage = 'Initialisation du scanner...';
  }

  ngOnDestroy() {
    this.scannerState.next(false);
    console.log('Scanner détruit');
  }

  toggleScanner() {
    this.scannerEnabled = !this.scannerEnabled;
    this.scannerState.next(this.scannerEnabled);
    console.log('Scanner ' + (this.scannerEnabled ? 'activé' : 'désactivé'));
    
    if (this.scannerEnabled) {
      this.scanner?.restart();
    }
  }

  onCodeScanned(resultString: string) {
    console.log('Code scanné brut:', resultString);
    
    try {
      let qrData: QRCodeData;
      
      try {
        qrData = JSON.parse(resultString);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        this.scannerMessage = 'Format QR code invalide';
        this.scannerError = true;
        return;
      }

      // Vérification des propriétés requises
      if (!this.isValidQRCodeData(qrData)) {
        console.error('Données QR invalides:', qrData);
        this.scannerMessage = 'QR code invalide: données manquantes';
        this.scannerError = true;
        return;
      }

      console.log('Données QR décodées:', qrData);
      this.scannerMessage = 'QR code scanné avec succès!';
      this.scannerError = false;
      this.scanComplete.emit(qrData);
      
    } catch (error) {
      console.error('Erreur lors du traitement du QR code:', error);
      this.scannerMessage = 'Erreur lors du traitement du QR code';
      this.scannerError = true;
    }
  }

  private isValidQRCodeData(data: any): data is QRCodeData {
    return (
      data &&
      typeof data.userId === 'string' &&
      typeof data.phone === 'string' &&
      typeof data.timestamp === 'number' &&
      typeof data.expiresIn === 'number'
    );
  }

  onPermissionResponse(permitted: boolean) {
    console.log('Permission caméra:', permitted ? 'accordée' : 'refusée');
    if (!permitted) {
      this.scannerMessage = 'Accès à la caméra refusé';
      this.scannerError = true;
    } else {
      this.scannerMessage = 'Caméra activée, prêt à scanner';
    }
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    console.log('Caméras disponibles:', devices);
    this.availableCameras = devices;
    
    if (devices.length === 0) {
      this.scannerMessage = 'Aucune caméra trouvée';
      this.scannerError = true;
      return;
    }

    // Sélectionner la caméra arrière par défaut si disponible
    const backCamera = devices.find(device => 
      device.label.toLowerCase().includes('back') || 
      device.label.toLowerCase().includes('arrière') ||
      device.label.toLowerCase().includes('rear')
    );
    
    this.selectedDevice = backCamera || devices[0];
    console.log('Caméra sélectionnée:', this.selectedDevice);
    
    this.scannerMessage = `Caméra active: ${this.selectedDevice.label || 'Caméra par défaut'}`;
  }

  onScanError(error: Error) {
    console.error('Erreur de scan:', error);
    this.scannerMessage = `Erreur: ${error.message}`;
    this.scannerError = true;
  }

  onScanComplete(result: any) {
    console.log('Scan complet:', result);
  }

  onDeviceSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const deviceId = select.value;
    this.selectedDevice = this.availableCameras.find(device => device.deviceId === deviceId);
    console.log('Nouvelle caméra sélectionnée:', this.selectedDevice);
    
    if (this.selectedDevice) {
      this.scannerMessage = `Caméra changée: ${this.selectedDevice.label || 'Caméra ' + deviceId}`;
      this.scanner?.restart();
    }
  }

  toggleTorch() {
    this.torchEnabled = !this.torchEnabled;
    console.log('Lampe ' + (this.torchEnabled ? 'allumée' : 'éteinte'));
  }
} 