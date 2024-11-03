import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickActionsComponent } from '../shared/quick-actions/quick-actions.component';
import { FormsModule } from '@angular/forms';
import { MobileRechargeData } from '../../models/transaction.model';
import { ServiceConfig, TransportData, BillsData } from '../../models/service.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, QuickActionsComponent, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Services disponibles</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let service of services" 
             (click)="handleServiceClick(service)"
             class="card p-6 bg-white dark:bg-gray-800 transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer rounded-xl"
             [ngClass]="service.bgClass">
          <div class="flex items-center space-x-4">
            <div class="p-3 rounded-full transform transition-all duration-300 group-hover:scale-110" 
                 [ngClass]="service.bgClass + '-light'">
              <i [class]="'fas ' + service.icon" class="text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{service.name}}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{service.description}}</p>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <span class="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              Cliquez pour commencer
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Recharge Mobile amélioré -->
    <div *ngIf="showMobileRechargeModal" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all"
           [class.scale-100]="showMobileRechargeModal"
           [class.scale-95]="!showMobileRechargeModal">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          {{currentStep === 'pin' ? 'Confirmation' : 'Recharge mobile'}}
        </h3>
        
        <div *ngIf="currentStep === 'details'">
          <div class="space-y-4">
            <div class="flex space-x-4">
              <button (click)="mobileRechargeData.isOwnNumber = true" 
                      [class.bg-indigo-600]="mobileRechargeData.isOwnNumber"
                      [class.text-white]="mobileRechargeData.isOwnNumber"
                      class="flex-1 px-4 py-3 rounded-lg border transition-colors duration-200 flex items-center justify-center space-x-2">
                <i class="fas fa-user"></i>
                <span>Mon numéro</span>
              </button>
              <button (click)="mobileRechargeData.isOwnNumber = false"
                      [class.bg-indigo-600]="!mobileRechargeData.isOwnNumber"
                      [class.text-white]="!mobileRechargeData.isOwnNumber"
                      class="flex-1 px-4 py-3 rounded-lg border transition-colors duration-200 flex items-center justify-center space-x-2">
                <i class="fas fa-users"></i>
                <span>Autre numéro</span>
              </button>
            </div>
            
            <div *ngIf="!mobileRechargeData.isOwnNumber" 
                 class="animate-slideDown">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Numéro de téléphone
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i class="fas fa-phone"></i>
                </span>
                <input type="tel" [(ngModel)]="mobileRechargeData.phoneNumber"
                       (input)="validatePhoneNumber($event)"
                       placeholder="06XXXXXXXX"
                       class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all">
              </div>
              <p *ngIf="phoneNumberError" class="mt-1 text-sm text-red-500">
                {{phoneNumberError}}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Montant
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i class="fas fa-euro-sign"></i>
                </span>
                <input type="number" [(ngModel)]="mobileRechargeData.amount"
                       (input)="validateAmount($event)"
                       min="5" max="100" step="5"
                       class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all">
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button *ngFor="let amount of quickAmounts"
                        (click)="selectQuickAmount(amount)"
                        class="px-3 py-1 rounded-full text-sm border transition-colors duration-200"
                        [class.bg-indigo-600]="mobileRechargeData.amount === amount"
                        [class.text-white]="mobileRechargeData.amount === amount">
                  {{amount}}€
                </button>
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button (click)="closeModal()"
                    class="px-4 py-2 text-gray-600 dark:text-gray-400">
              Annuler
            </button>
            <button (click)="nextStep()"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Continuer
            </button>
          </div>
        </div>

        <div *ngIf="currentStep === 'pin'">
          <div class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Veuillez entrer votre code PIN pour confirmer la recharge de {{mobileRechargeData.amount}}€
              {{!mobileRechargeData.isOwnNumber ? 'pour le ' + mobileRechargeData.phoneNumber : ''}}
            </p>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code PIN
              </label>
              <input type="password" [(ngModel)]="mobileRechargeData.pin" maxlength="4"
                     class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button (click)="previousStep()"
                    class="px-4 py-2 text-gray-600 dark:text-gray-400">
              Retour
            </button>
            <button (click)="confirmMobileRecharge()"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Transport -->
    <div *ngIf="showTransportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          {{currentStep === 'pin' ? 'Confirmation' : 'Achat de tickets de transport'}}
        </h3>
        
        <div *ngIf="currentStep === 'details'">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de ticket
              </label>
              <select [(ngModel)]="transportData.ticketType"
                      class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                <option value="single">Ticket unique</option>
                <option value="book">Carnet 10 tickets</option>
                <option value="monthly">Abonnement mensuel</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantité
              </label>
              <input type="number" [(ngModel)]="transportData.quantity" min="1"
                     class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button (click)="closeModal()"
                    class="px-4 py-2 text-gray-600 dark:text-gray-400">
              Annuler
            </button>
            <button (click)="nextStep()"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Continuer
            </button>
          </div>
        </div>

        <div *ngIf="currentStep === 'pin'">
          <div class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Veuillez entrer votre code PIN pour confirmer l'achat de {{transportData.quantity}} 
              {{getTicketTypeLabel(transportData.ticketType)}}
            </p>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code PIN
              </label>
              <input type="password" [(ngModel)]="transportData.pin" maxlength="4"
                     class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button (click)="previousStep()"
                    class="px-4 py-2 text-gray-600 dark:text-gray-400">
              Retour
            </button>
            <button (click)="confirmTransport()"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Factures -->
    <div *ngIf="showBillsModal" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all"
           [class.scale-100]="showBillsModal"
           [class.scale-95]="!showBillsModal">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          {{currentStep === 'pin' ? 'Confirmation' : 'Paiement de factures'}}
        </h3>
        
        <div *ngIf="currentStep === 'details'" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fournisseur
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button *ngFor="let provider of billProviders"
                      (click)="selectProvider(provider.value)"
                      class="flex flex-col items-center p-3 border rounded-lg transition-colors"
                      [class.bg-indigo-600]="billsData.provider === provider.value"
                      [class.text-white]="billsData.provider === provider.value"
                      [class.border-indigo-600]="billsData.provider === provider.value">
                <i [class]="'fas ' + provider.icon + ' text-2xl mb-2'"></i>
                <span>{{provider.label}}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Référence facture
            </label>
            <input type="text" [(ngModel)]="billsData.reference"
                   placeholder="Ex: FAC-123456"
                   class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Montant
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <i class="fas fa-euro-sign"></i>
              </span>
              <input type="number" [(ngModel)]="billsData.amount"
                     (input)="validateBillAmount($event)"
                     class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <p *ngIf="billAmountError" class="mt-1 text-sm text-red-500">{{billAmountError}}</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button (click)="closeModal()" 
                    class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Annuler
            </button>
            <button (click)="nextStep()" 
                    [disabled]="!canProceedBills()"
                    [class.opacity-50]="!canProceedBills()"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Continuer
            </button>
          </div>
        </div>

        <div *ngIf="currentStep === 'pin'" class="space-y-6">
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Fournisseur</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{getProviderLabel(billsData.provider)}}
              </span>
            </div>
            <div class="flex justify-between text-sm mt-2">
              <span class="text-gray-500 dark:text-gray-400">Référence</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{billsData.reference}}
              </span>
            </div>
            <div class="flex justify-between text-sm mt-2">
              <span class="text-gray-500 dark:text-gray-400">Montant</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{billsData.amount}}€
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code PIN
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <i class="fas fa-lock"></i>
              </span>
              <input type="password" [(ngModel)]="billsData.pin"
                     maxlength="4" placeholder="****"
                     class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button (click)="previousStep()" 
                    class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Retour
            </button>
            <button (click)="confirmBillsPayment()" 
                    [disabled]="!billsData.pin"
                    [class.opacity-50]="!billsData.pin"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-service-1 { @apply hover:shadow-blue-200; }
    .bg-service-1-light { @apply bg-blue-100 text-blue-600; }
    
    .bg-service-2 { @apply hover:shadow-green-200; }
    .bg-service-2-light { @apply bg-green-100 text-green-600; }
    
    .bg-service-3 { @apply hover:shadow-purple-200; }
    .bg-service-3-light { @apply bg-purple-100 text-purple-600; }
    
    .bg-service-4 { @apply hover:shadow-yellow-200; }
    .bg-service-4-light { @apply bg-yellow-100 text-yellow-600; }
    
    .bg-service-5 { @apply hover:shadow-red-200; }
    .bg-service-5-light { @apply bg-red-100 text-red-600; }
    
    .bg-service-6 { @apply hover:shadow-indigo-200; }
    .bg-service-6-light { @apply bg-indigo-100 text-indigo-600; }
    
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    
    .animate-slideDown {
      animation: slideDown 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideDown {
      from { 
        opacity: 0;
        transform: translateY(-10px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ServicesComponent {
  services: ServiceConfig[] = [
    {
      id: '1',
      type: 'bills',
      name: 'Paiement de factures',
      label: 'Factures',
      icon: 'fa-file-invoice',
      bgClass: 'bg-service-1',
      iconClass: 'text-blue-600',
      description: 'Payez vos factures rapidement et en toute sécurité'
    },
    {
      id: '2',
      type: 'mobile',
      name: 'Recharge mobile',
      label: 'Recharge mobile',
      icon: 'fa-mobile-alt',
      bgClass: 'bg-service-2',
      iconClass: 'text-green-600',
      description: 'Rechargez votre forfait mobile en quelques clics'
    },
    {
      id: '3',
      type: 'transport',
      name: 'Transport',
      label: 'Transport',
      icon: 'fa-bus',
      bgClass: 'bg-service-3',
      iconClass: 'text-purple-600',
      description: 'Achetez vos tickets de transport en commun'
    }
    // ... autres services
  ];

  showMobileRechargeModal = false;
  currentStep: 'details' | 'pin' = 'details';
  
  mobileRechargeData: MobileRechargeData = {
    phoneNumber: '',
    amount: 0,
    isOwnNumber: true,
    pin: ''
  };

  showTransportModal = false;
  transportData: TransportData = {
    ticketType: 'single',
    quantity: 1,
    pin: ''
  };

  quickAmounts = [5, 10, 20, 30, 50];
  phoneNumberError: string = '';
  amountError: string = '';
  isPhoneNumberValid: boolean = false;
  isAmountValid: boolean = false;

  showBillsModal = false;
  billsData: BillsData = {
    provider: '',
    amount: 0,
    pin: '',
    reference: ''
  };

  billAmountError: string = '';
  isBillAmountValid: boolean = false;

  billProviders = [
    {
      value: 'electricity',
      label: 'Électricité',
      icon: 'fa-bolt'
    },
    {
      value: 'water',
      label: 'Eau',
      icon: 'fa-tint'
    },
    {
      value: 'internet',
      label: 'Internet',
      icon: 'fa-wifi'
    },
    {
      value: 'phone',
      label: 'Téléphone',
      icon: 'fa-phone'
    }
  ];

  handleServiceClick(service: ServiceConfig) {
    switch (service.type) {
      case 'mobile':
        this.showMobileRechargeModal = true;
        break;
      case 'bills':
        this.showBillsModal = true;
        break;
      case 'transport':
        this.showTransportModal = true;
        break;
    }
    this.currentStep = 'details';
  }

  selectProvider(provider: string) {
    this.billsData.provider = provider;
  }

  getProviderLabel(value: string): string {
    const provider = this.billProviders.find(p => p.value === value);
    return provider ? provider.label : value;
  }

  validateBillAmount(event: any) {
    const value = Number(event.target.value);
    if (value <= 0) {
      this.billAmountError = 'Le montant doit être supérieur à 0€';
      this.isBillAmountValid = false;
    } else if (value > 5000) {
      this.billAmountError = 'Le montant maximum est de 5000€';
      this.isBillAmountValid = false;
    } else {
      this.billAmountError = '';
      this.isBillAmountValid = true;
    }
  }

  canProceedBills(): boolean {
    const isValid: boolean = 
      Boolean(this.billsData.provider) && 
      Boolean(this.billsData.reference) && 
      this.isBillAmountValid === true && 
      this.billsData.amount > 0 && 
      this.billsData.amount <= 5000;
    
    return isValid;
  }

  confirmBillsPayment() {
    if (this.billsData.pin === '1234') { // Remplacer par une vraie validation
      console.log('Paiement de facture confirmé:', this.billsData);
      this.closeModal();
    } else {
      alert('Code PIN incorrect');
    }
  }

  closeModal() {
    this.showMobileRechargeModal = false;
    this.showTransportModal = false;
    this.showBillsModal = false;
    this.resetData();
  }

  resetData() {
    this.mobileRechargeData = {
      phoneNumber: '',
      amount: 0,
      isOwnNumber: true,
      pin: ''
    };
    this.transportData = {
      ticketType: 'single',
      quantity: 1,
      pin: ''
    };
    this.billsData = {
      provider: '',
      amount: 0,
      pin: '',
      reference: ''
    };
    this.billAmountError = '';
    this.isBillAmountValid = false;
    this.currentStep = 'details';
  }

  validatePhoneNumber(event: any) {
    const value = event.target.value;
    if (!/^0[67]\d{8}$/.test(value)) {
      this.phoneNumberError = 'Numéro de téléphone invalide';
      this.isPhoneNumberValid = false;
    } else {
      this.phoneNumberError = '';
      this.isPhoneNumberValid = true;
    }
  }

  validateAmount(event: any) {
    const value = Number(event.target.value);
    if (value < 5) {
      this.amountError = 'Le montant minimum est de 5€';
      this.isAmountValid = false;
    } else if (value > 100) {
      this.amountError = 'Le montant maximum est de 100€';
      this.isAmountValid = false;
    } else {
      this.amountError = '';
      this.isAmountValid = true;
    }
  }

  selectQuickAmount(amount: number) {
    this.mobileRechargeData.amount = amount;
    this.amountError = '';
    this.isAmountValid = true;
  }

  canProceed(): boolean {
    if (this.mobileRechargeData.isOwnNumber) {
      const isValid: boolean = 
        this.isAmountValid === true && 
        this.mobileRechargeData.amount >= 5 && 
        this.mobileRechargeData.amount <= 100;
      
      return isValid;
    }
    
    const isValid: boolean = 
      this.isPhoneNumberValid === true && 
      Boolean(this.mobileRechargeData.phoneNumber) && 
      this.isAmountValid === true && 
      this.mobileRechargeData.amount >= 5 && 
      this.mobileRechargeData.amount <= 100;
    
    return isValid;
  }

  nextStep() {
    this.currentStep = 'pin';
  }

  previousStep() {
    this.currentStep = 'details';
  }

  confirmMobileRecharge() {
    if (this.mobileRechargeData.pin === '1234') { // Remplacer par une vraie validation
      console.log('Recharge mobile confirmée:', this.mobileRechargeData);
      this.closeModal();
    } else {
      alert('Code PIN incorrect');
    }
  }

  confirmTransport() {
    if (this.transportData.pin === '1234') { // Remplacer par une vraie validation
      console.log('Achat de tickets confirmé:', this.transportData);
      this.closeModal();
    } else {
      alert('Code PIN incorrect');
    }
  }

  getTicketTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'single': 'ticket(s) unique(s)',
      'book': 'carnet(s) de 10 tickets',
      'monthly': 'abonnement(s) mensuel(s)'
    };
    return labels[type] || type;
  }

  validateTransportQuantity(event: any) {
    const value = Number(event.target.value);
    if (value < 1) {
      this.transportData.quantity = 1;
    } else if (value > 10) {
      this.transportData.quantity = 10;
    }
  }

  incrementQuantity() {
    if (this.transportData.quantity < 10) {
      this.transportData.quantity++;
    }
  }

  decrementQuantity() {
    if (this.transportData.quantity > 1) {
      this.transportData.quantity--;
    }
  }

  calculateTotal(): number {
    const prices: Record<string, number> = {
      'single': 1.90,
      'book': 16.90,
      'monthly': 75.00
    };
    return prices[this.transportData.ticketType] * this.transportData.quantity;
  }
} 