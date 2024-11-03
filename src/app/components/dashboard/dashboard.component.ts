import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction, TransactionType, TransactionStatus } from '../../models/transaction.model';
import { RouterLink } from '@angular/router';
import { QuickActionsComponent } from '../shared/quick-actions/quick-actions.component';
import { WalletService } from '../../services/wallet.service';
import { ThemeService } from '../../services/theme.service';
import { QRCodeService } from '../../services/qrcode.service';
import { QRCodeComponent } from '../shared/qr-code/qr-code.component';
import { StatsOverviewComponent } from '../shared/stats-overview/stats-overview.component';
import { FinancialGoalsComponent } from '../shared/financial-goals/financial-goals.component';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ServiceConfig, TransferData, TransportData, BillsData, MobileRechargeData } from '../../models/service.model';
import { QRCodeAction } from '../../models/qr-code.model';
import { TransactionService } from '../../services/transaction.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../shared/toast/toast.component';
import { PhoneInputComponent } from '../shared/phone-input/phone-input.component';

interface QuickService {
  id: string;
  type: string;
  label: string;
  icon: string;
  bgClass: string;
  iconClass: string;
  isSelected?: boolean;
}

interface ActionModalData {
  label: string;
  type: string;
  fields: any[];
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="min-h-screen bg-[#d2d7dc] dark:bg-gray-900">
      <!-- En-tête avec gradient -->
      <div class="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-12 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-10"></div>
        <div class="max-w-7xl mx-auto relative z-10">
          <div class="flex items-center space-x-4 mb-8">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <i class="fas fa-user text-2xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold">Bonjour 👋</h1>
              <p class="text-indigo-200">Bienvenue sur votre tableau de bord</p>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="-mb-20">
            <app-quick-actions></app-quick-actions>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="max-w-7xl mx-auto px-4 pt-24">
       

        <!-- Grille principale -->
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Colonne de gauche -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Actions rapides -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Services rapides</h2>
                <button (click)="toggleCustomization()" 
                        class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                  <i class="fa-solid" [class]="isCustomizing ? 'fa-check' : 'fa-cog'"></i>
                </button>
              </div>

              <!-- Mode normal -->
              <div *ngIf="!isCustomizing" 
                   class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <button *ngFor="let service of selectedServices"
                        (click)="handleQuickAction(service.type)"
                        class="group relative p-4 rounded-xl transition-all duration-300"
                        [class]="service.bgClass + ' hover:scale-105'">
                  <div class="flex flex-col items-center">
                    <i [class]="'fa-solid ' + service.icon + ' ' + service.iconClass + ' text-2xl mb-2 transition-transform group-hover:scale-110'"></i>
                    <span [class]="service.iconClass + ' font-medium text-sm'">{{service.label}}</span>
                  </div>
                </button>
              </div>

              <!-- Mode personnalisation -->
              <div *ngIf="isCustomizing" class="space-y-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Sélectionnez jusqu'à 4 services rapides
                </p>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <button *ngFor="let service of availableServices"
                          (click)="toggleService(service)"
                          [class]="getCustomizationButtonClass(service)">
                    <i [class]="'fa-solid ' + service.icon + ' ' + service.iconClass + ' mr-2'"></i>
                    <span class="font-medium">{{service.label}}</span>
                    <i *ngIf="service.isSelected" 
                       class="fas fa-check ml-2 text-green-500"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Transactions récentes -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Transactions récentes</h2>
                  <a routerLink="/transactions" 
                     class="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
                    Voir tout
                  </a>
                </div>
              </div>
              
              <!-- Conteneur avec hauteur fixe -->
              <div class="h-[400px] flex flex-col">
                <!-- Liste des transactions avec défilement si nécessaire -->
                <div class="flex-1 divide-y divide-gray-100 dark:divide-gray-700 overflow-y-auto">
                  <div *ngFor="let transaction of paginatedTransactions" 
                       (click)="openTransactionDetails(transaction)"
                       class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-4">
                        <div [class]="getTransactionIconClass(transaction.type)">
                          <i [class]="'fas ' + transaction.icon"></i>
                        </div>
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">{{transaction.description}}</p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{transaction.date | date:'short'}}
                            <span *ngIf="transaction.destinataire" class="ml-2 text-indigo-600 dark:text-indigo-400">
                              → {{transaction.destinataire.prenom}} {{transaction.destinataire.nom}}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p [class]="'font-medium ' + (transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')">
                          {{transaction.amount > 0 ? '+' : ''}}{{transaction.amount | currency:'EUR'}}
                        </p>
                        <span [class]="getStatusBadgeClass(transaction.status)"
                              class="text-xs px-2 py-1 rounded-full">
                          {{transaction.status}}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Message si aucune transaction -->
                  <div *ngIf="paginatedTransactions.length === 0" 
                       class="p-8 text-center text-gray-500 dark:text-gray-400">
                    Aucune transaction à afficher
                  </div>
                </div>

                <!-- Pagination avec design responsive -->
                <div class="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
                  <!-- Boutons de navigation -->
                  <div class="flex justify-center gap-2 w-full sm:w-auto order-2 sm:order-1">
                    <button 
                      (click)="previousPage()" 
                      [disabled]="currentPage === 1"
                      [class.opacity-50]="currentPage === 1"
                      class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:hover:bg-indigo-600 flex items-center gap-1 min-w-[100px] justify-center">
                      <i class="fas fa-chevron-left text-sm"></i>
                      <span class="hidden sm:inline">Précédent</span>
                    </button>
                    
                    <button 
                      (click)="nextPage()" 
                      [disabled]="currentPage === totalPages"
                      [class.opacity-50]="currentPage === totalPages"
                      class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:hover:bg-indigo-600 flex items-center gap-1 min-w-[100px] justify-center">
                      <span class="hidden sm:inline">Suivant</span>
                      <i class="fas fa-chevron-right text-sm"></i>
                    </button>
                  </div>

                  <!-- Indicateur de page -->
                  <div class="text-sm text-gray-600 dark:text-gray-300 order-1 sm:order-2">
                    <span class="hidden sm:inline">Page</span> {{currentPage}} 
                    <span class="hidden sm:inline">sur</span>
                    <span class="sm:hidden">/</span> {{totalPages}}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne de droite -->
          <div class="space-y-8">
            <!-- Objectifs financiers -->
            <app-financial-goals></app-financial-goals>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <!-- ... reste du code des modals ... -->

      <!-- Modal Transfert -->
      <div *ngIf="showTransferModal" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all"
             [class.scale-100]="showTransferModal"
             [class.scale-95]="!showTransferModal">
          <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            {{currentStep === 'pin' ? 'Confirmation' : 'Nouveau transfert'}}
          </h3>
          
          <div *ngIf="currentStep === 'details'" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Numéro de téléphone
              </label>
              <app-phone-input
                (phoneNumberChange)="onPhoneNumberChange($event)"
                (validityChange)="onPhoneValidityChange($event)"
                [inputClass]="'w-full border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all'"
              ></app-phone-input>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Montant
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i class="fas fa-euro-sign"></i>
                </span>
                <input type="number" [(ngModel)]="transferData.amount"
                       (input)="validateAmount($event)"
                       min="1" max="1000"
                       class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all">
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button *ngFor="let amount of quickAmounts"
                        (click)="selectQuickAmount(amount)"
                        class="px-3 py-1 rounded-full text-sm border transition-colors duration-200"
                        [class.bg-indigo-600]="transferData.amount === amount"
                        [class.text-white]="transferData.amount === amount">
                  {{amount}}€
                </button>
              </div>
              <p *ngIf="amountError" class="mt-1 text-sm text-red-500">{{amountError}}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optionnel)
              </label>
              <input type="text" [(ngModel)]="transferData.description"
                     placeholder="Ex: Remboursement restaurant"
                     class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>

            <div class="flex justify-end space-x-3">
              <button (click)="closeModal()" 
                      class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Annuler
              </button>
              <button (click)="nextStep()" 
                      [disabled]="!canProceedTransfer()"
                      [class.opacity-50]="!canProceedTransfer()"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Continuer
              </button>
            </div>
          </div>

          <div *ngIf="currentStep === 'pin'" class="space-y-6">
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">Destinataire</span>
                <span class="font-medium text-gray-900 dark:text-white">{{transferData.phoneNumber}}</span>
              </div>
              <div class="flex justify-between text-sm mt-2">
                <span class="text-gray-500 dark:text-gray-400">Montant</span>
                <span class="font-medium text-gray-900 dark:text-white">{{transferData.amount}}€</span>
              </div>
              <div *ngIf="transferData.description" class="flex justify-between text-sm mt-2">
                <span class="text-gray-500 dark:text-gray-400">Description</span>
                <span class="font-medium text-gray-900 dark:text-white">{{transferData.description}}</span>
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
                <input type="password" [(ngModel)]="transferData.pin"
                       maxlength="4" placeholder="****"
                       class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all">
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button (click)="previousStep()" 
                      class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Retour
              </button>
              <button (click)="confirmTransfer()" 
                      [disabled]="!transferData.pin"
                      [class.opacity-50]="!transferData.pin"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Transport -->
      <div *ngIf="showTransportModal" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all"
             [class.scale-100]="showTransportModal"
             [class.scale-95]="!showTransportModal">
          <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            {{currentStep === 'pin' ? 'Confirmation' : 'Achat de tickets'}}
          </h3>
          
          <div *ngIf="currentStep === 'details'" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de ticket
              </label>
              <div class="grid grid-cols-1 gap-3">
                <button *ngFor="let type of ticketTypes"
                        (click)="selectTicketType(type.value)"
                        class="flex items-center p-3 border rounded-lg transition-colors"
                        [class.bg-indigo-600]="transportData.ticketType === type.value"
                        [class.text-white]="transportData.ticketType === type.value"
                        [class.border-indigo-600]="transportData.ticketType === type.value">
                  <i [class]="'fas ' + type.icon + ' mr-3'"></i>
                  <div class="flex-1">
                    <div class="font-medium">{{type.label}}</div>
                    <div class="text-sm opacity-75">{{type.description}}</div>
                  </div>
                  <div class="font-bold">{{type.price}}€</div>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantité
              </label>
              <div class="flex items-center space-x-3">
                <button (click)="decrementQuantity()"
                        class="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
                        [class.opacity-50]="transportData.quantity <= 1">
                  <i class="fas fa-minus"></i>
                </button>
                <input type="number" [(ngModel)]="transportData.quantity"
                       min="1" max="10"
                       class="w-20 text-center p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                <button (click)="incrementQuantity()"
                        class="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
                        [class.opacity-50]="transportData.quantity >= 10">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-gray-500 dark:text-gray-400">Total</span>
                <span class="text-xl font-bold text-gray-900 dark:text-white">
                  {{calculateTotal()}}€
                </span>
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button (click)="closeModal()" 
                      class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Annuler
              </button>
              <button (click)="nextStep()" 
                      [disabled]="!canProceedTransport()"
                      [class.opacity-50]="!canProceedTransport()"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Continuer
              </button>
            </div>
          </div>

          <div *ngIf="currentStep === 'pin'" class="space-y-6">
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">Type</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{getTicketTypeLabel(transportData.ticketType)}}
                </span>
              </div>
              <div class="flex justify-between text-sm mt-2">
                <span class="text-gray-500 dark:text-gray-400">Quantité</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{transportData.quantity}}
                </span>
              </div>
              <div class="flex justify-between text-sm mt-2">
                <span class="text-gray-500 dark:text-gray-400">Total</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{calculateTotal()}}€
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
                <input type="password" [(ngModel)]="transportData.pin"
                       maxlength="4" placeholder="****"
                       class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all">
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button (click)="previousStep()" 
                      class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Retour
              </button>
              <button (click)="confirmTransport()" 
                      [disabled]="!transportData.pin"
                      [class.opacity-50]="!transportData.pin"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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

      <!-- Modal Recharge Mobile -->
      <div *ngIf="showMobileRechargeModal" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all"
             [class.scale-100]="showMobileRechargeModal"
             [class.scale-95]="!showMobileRechargeModal">
          <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            {{currentStep === 'pin' ? 'Confirmation' : 'Recharge mobile'}}
          </h3>
          
          <div *ngIf="currentStep === 'details'" class="space-y-6">
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
              <p *ngIf="amountError" class="mt-1 text-sm text-red-500">
                {{amountError}}
              </p>
            </div>

            <div class="flex justify-end space-x-3">
              <button (click)="closeModal()" 
                      class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Annuler
              </button>
              <button (click)="nextStep()" 
                      [disabled]="!canProceedMobile()"
                      [class.opacity-50]="!canProceedMobile()"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Continuer
              </button>
            </div>
          </div>

          <div *ngIf="currentStep === 'pin'" class="space-y-6">
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">Numéro</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{mobileRechargeData.isOwnNumber ? 'Mon numéro' : mobileRechargeData.phoneNumber}}
                </span>
              </div>
              <div class="flex justify-between text-sm mt-2">
                <span class="text-gray-500 dark:text-gray-400">Montant</span>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{mobileRechargeData.amount}}€
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
                <input type="password" [(ngModel)]="mobileRechargeData.pin"
                       maxlength="4" placeholder="****"
                       class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all">
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button (click)="previousStep()" 
                      class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Retour
              </button>
              <button (click)="confirmMobileRecharge()" 
                      [disabled]="!mobileRechargeData.pin"
                      [class.opacity-50]="!mobileRechargeData.pin"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ajoutez le composant Toast à la fin du template -->
      <app-toast></app-toast>

      <!-- Modal Détails Transaction -->
      <div *ngIf="showTransactionDetails && selectedTransaction" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              Détails de la transaction
            </h3>
            <button (click)="closeTransactionDetails()" 
                    class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="space-y-4">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    <i [class]="'fas ' + selectedTransaction.icon + ' mr-2'"></i>
                    {{selectedTransaction.type | titlecase}}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Montant</p>
                  <p [class]="'font-medium ' + (selectedTransaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')">
                    {{selectedTransaction.amount > 0 ? '+' : ''}}{{selectedTransaction.amount | currency:'EUR'}}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{selectedTransaction.date | date:'medium'}}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Statut</p>
                  <span [class]="getStatusBadgeClass(selectedTransaction.status)"
                        class="text-xs px-2 py-1 rounded-full">
                    {{selectedTransaction.status}}
                  </span>
                </div>
              </div>
            </div>

            <div *ngIf="selectedTransaction.destinataire" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Destinataire</h4>
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <i class="fas fa-user text-indigo-600 dark:text-indigo-400"></i>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{selectedTransaction.destinataire.prenom}} {{selectedTransaction.destinataire.nom}}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{selectedTransaction.destinataire.telephone}}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p class="font-medium text-gray-900 dark:text-white">
                {{selectedTransaction.description}}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    QuickActionsComponent,
    QRCodeComponent,
    StatsOverviewComponent,
    FinancialGoalsComponent,
    FormsModule,
    ToastComponent,
    PhoneInputComponent
  ],
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
export class DashboardComponent implements OnInit {
  balance$ = this.walletService.balance$;
  hideBalance$ = this.walletService.hideBalance$;
  isDarkMode$ = this.themeService.isDarkMode$.pipe(
    map((isDark: boolean | null) => isDark ?? false)
  );
  
  balance: number = 25000;
  monthlyGrowth: number = 3.5;
  monthlyIncome: number = 4500;
  monthlyExpenses: number = 2800;
  recentTransactions: Transaction[] = [];

  // QR Code related properties
  showQR = false;
  qrData = '';
  qrTitle = '';
  qrDescription = '';
  qrAction = '';

  expensesData = [
    { label: 'Services', value: 45, color: '#4F46E5' },
    { label: 'Shopping', value: 30, color: '#10B981' },
    { label: 'Transport', value: 15, color: '#F59E0B' },
    { label: 'Autres', value: 10, color: '#6B7280' }
  ];

  expenseCategories = [
    {
      name: 'Services',
      amount: 450,
      transactions: 5,
      trend: 2.5,
      icon: 'fa-tv',
      bgClass: 'bg-indigo-100 dark:bg-indigo-900',
      iconClass: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  quickActions = [
    {
      type: 'transfer',
      label: 'Transfert',
      icon: 'fas fa-exchange-alt',
      bgClass: 'bg-blue-100 dark:bg-blue-900',
      iconClass: 'text-blue-600 dark:text-blue-400'
    },
    {
      type: 'payment',
      label: 'Paiement',
      icon: 'fas fa-credit-card',
      bgClass: 'bg-purple-100 dark:bg-purple-900',
      iconClass: 'text-purple-600 dark:text-purple-400'
    }
  ];

  isModalOpen = false;
  currentAction: ActionModalData | null = null;

  isCustomizing = false;
  layout: 'grid' | 'list' = 'grid';
  
  availableServices: ServiceConfig[] = [
    {
      id: '1',
      type: 'transfer',
      name: 'Transfert',
      label: 'Transfert',
      icon: 'fa-exchange-alt',
      bgClass: 'bg-blue-100 dark:bg-blue-900',
      iconClass: 'text-blue-600 dark:text-blue-400',
      description: 'Transférer de l\'argent',
      isSelected: true
    },
    {
      id: '2',
      type: 'bills',
      name: 'Factures',
      label: 'Factures',
      icon: 'fa-file-invoice',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900',
      iconClass: 'text-yellow-600 dark:text-yellow-400',
      description: 'Payer vos factures',
      isSelected: false
    },
    {
      id: '3',
      type: 'mobile',
      name: 'Recharge mobile',
      label: 'Recharge mobile',
      icon: 'fa-mobile-alt',
      bgClass: 'bg-green-100 dark:bg-green-900',
      iconClass: 'text-green-600 dark:text-green-400',
      description: 'Recharger votre mobile',
      isSelected: false
    },
    {
      id: '4',
      type: 'transport',
      name: 'Transport',
      label: 'Transport',
      icon: 'fa-bus',
      bgClass: 'bg-purple-100 dark:bg-purple-900',
      iconClass: 'text-purple-600 dark:text-purple-400',
      description: 'Acheter des tickets',
      isSelected: false
    }
  ];

  get selectedServices(): QuickService[] {
    return this.availableServices.filter(s => s.isSelected);
  }

  toggleCustomization() {
    this.isCustomizing = !this.isCustomizing;
  }

  toggleService(service: QuickService) {
    if (service.isSelected) {
      service.isSelected = false;
    } else if (this.selectedServices.length < 4) {
      service.isSelected = true;
    }
  }

  getCustomizationButtonClass(service: QuickService): string {
    const baseClass = 'flex items-center justify-center p-4 rounded-lg transition-colors ';
    if (service.isSelected) {
      return baseClass + service.bgClass + ' ' + service.iconClass;
    }
    return baseClass + 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
  }

  getLayoutButtonClass(layoutType: 'grid' | 'list'): string {
    const baseClass = 'px-4 py-2 rounded-lg transition-colors ';
    if (this.layout === layoutType) {
      return baseClass + 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400';
    }
    return baseClass + 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
  }

  constructor(
    private walletService: WalletService,
    private themeService: ThemeService,
    private qrService: QRCodeService,
    private transactionService: TransactionService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadRecentTransactions();
  }

  loadRecentTransactions() {
    this.transactionService.getTransactionHistory().subscribe({
      next: (transactions) => {
        this.recentTransactions = transactions;
        this.totalTransactions = transactions.length;
        this.currentPage = 1; // Réinitialiser à la première page lors du chargement
      },
      error: (error) => {
        console.error('Erreur lors du chargement des transactions:', error);
        this.toastService.show('Erreur lors du chargement des transactions', 'error');
        this.recentTransactions = [];
      }
    });
  }

  // Méthode pour formater les transactions pour l'affichage
  formatTransaction(transaction: any): Transaction {
    return {
      id: transaction._id || transaction.id,
      type: this.mapTransactionType(transaction.type),
      amount: transaction.montant || transaction.amount,
      description: transaction.description || 'Transaction',
      date: new Date(transaction.creeLe || transaction.date),
      status: this.mapTransactionStatus(transaction.status),
      recipient: transaction.utilisateurDestination?.phoneNumber || transaction.recipient
    };
  }

  // Mapper les types de transaction du backend vers le frontend
  private mapTransactionType(type: string): TransactionType {
    const typeMap: { [key: string]: TransactionType } = {
      'transfer': 'transfer',
      'depot': 'deposit',
      'retrait': 'withdrawal',
      'paiement': 'payment',
      'achat': 'buy',
      'vente': 'sell'
    };
    return typeMap[type] || 'payment';
  }

  // Mapper les statuts de transaction
  private mapTransactionStatus(status: string): TransactionStatus {
    const statusMap: { [key: string]: TransactionStatus } = {
      'terminee': 'completed',
      'en_attente': 'pending',
      'echouee': 'failed'
    };
    return statusMap[status] || 'pending';
  }

  toggleBalanceVisibility() {
    this.walletService.toggleBalanceVisibility();
  }

  showQRForDeposit() {
    this.qrService.generateQRCode('deposit' as QRCodeAction).subscribe({
      next: (qrString: string) => {
        this.showQR = true;
        this.qrTitle = 'Dépôt';
        this.qrDescription = 'Scannez pour effectuer un dépôt';
        this.qrAction = 'déposer de l\'argent';
        this.qrData = qrString;
      },
      error: (error) => {
        console.error('Erreur lors de la génération du QR code:', error);
      }
    });
  }

  showQRForWithdrawal() {
    this.qrService.generateQRCode('withdrawal' as QRCodeAction).subscribe({
      next: (qrString: string) => {
        this.showQR = true;
        this.qrTitle = 'Retrait';
        this.qrDescription = 'Scannez pour effectuer un retrait';
        this.qrAction = 'retirer de l\'argent';
        this.qrData = qrString;
      },
      error: (error) => {
        console.error('Erreur lors de la génération du QR code:', error);
      }
    });
  }

  showQRForTransfer() {
    this.qrService.generateQRCode('transfer' as QRCodeAction).subscribe({
      next: (qrString: string) => {
        this.showQR = true;
        this.qrTitle = 'Transfert';
        this.qrDescription = 'Scannez pour effectuer un transfert';
        this.qrAction = 'transférer de l\'argent';
        this.qrData = qrString;
      },
      error: (error) => {
        console.error('Erreur lors de la génération du QR code:', error);
      }
    });
  }

  closeQR() {
    this.showQR = false;
  }

  getTransactionTypeClass(type: string): string {
    const classes: Record<TransactionType, string> = {
      deposit: 'bg-green-100 text-green-800',
      withdrawal: 'bg-red-100 text-red-800',
      transfer: 'bg-blue-100 text-blue-800',
      payment: 'bg-yellow-100 text-yellow-800',
      buy: 'bg-purple-100 text-purple-800',
      sell: 'bg-orange-100 text-orange-800'
    };
    return classes[type as TransactionType] || 'bg-gray-100 text-gray-800';
  }

  getTransactionTypeLabel(type: string): string {
    const labels: Record<TransactionType, string> = {
      deposit: 'Dépôt',
      withdrawal: 'Retrait',
      transfer: 'Transfert',
      payment: 'Paiement',
      buy: 'Achat',
      sell: 'Vente'
    };
    return labels[type as TransactionType] || type;
  }

  getStatusClass(status: 'completed' | 'pending' | 'failed'): string {
    const classes: Record<'completed' | 'pending' | 'failed', string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  isPositiveTransaction(type: string): boolean {
    return type === 'deposit' || type === 'sell';
  }

  openNewTransactionModal(type: string) {
    console.log(`Ouverture modale pour ${type}`);
  }

  getTransactionIconClass(type: string): string {
    const classes: Record<TransactionType, string> = {
      deposit: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
      withdrawal: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
      transfer: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
      payment: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
      buy: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
      sell: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
    };
    return classes[type as TransactionType] || 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400';
  }

  getTransactionIcon(type: string): string {
    const icons: Record<TransactionType, string> = {
      deposit: 'fa-solid fa-arrow-down',
      withdrawal: 'fa-solid fa-arrow-up',
      transfer: 'fa-solid fa-right-left',
      payment: 'fa-solid fa-shopping-cart',
      buy: 'fa-solid fa-cart-plus',
      sell: 'fa-solid fa-cart-arrow-down'
    };
    return icons[type as TransactionType] || 'fa-solid fa-circle';
  }

  getStatusBadgeClass(status: string): string {
    return {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
    }[status] || '';
  }

  handleQuickAction(type: string) {
    const service = this.availableServices.find(s => s.type === type);
    if (service) {
      switch (service.type) {
        case 'transfer':
          this.showTransferModal = true;
          break;
        case 'mobile':
          this.showMobileRechargeModal = true;
          break;
        case 'transport':
          this.showTransportModal = true;
          break;
        case 'bills':
          this.showBillsModal = true;
          break;
      }
      this.currentStep = 'details';
    }
  }

  getServiceName(type: string): string {
    const names: Record<string, string> = {
      'bills': 'Paiement de factures',
      'streaming': 'Abonnement streaming',
      'donation': 'Faire un don'
    };
    return names[type] || type;
  }

  closeModal() {
    this.showTransferModal = false;
    this.showMobileRechargeModal = false;
    this.showTransportModal = false;
    this.showBillsModal = false;
    this.resetData();
  }

  nextStep() {
    this.currentStep = 'pin';
  }

  previousStep() {
    this.currentStep = 'details';
  }

  resetData() {
    this.transferData = {
      phoneNumber: '',
      amount: 0,
      pin: ''
    };
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
    this.currentStep = 'details';
  }

  confirmTransfer() {
    if (!this.transferData.pin) {
      this.toastService.show('Veuillez entrer votre code PIN', 'error');
      return;
    }

    this.transactionService.createTransfer({
      type: 'transfer',
      phoneNumber: this.transferData.phoneNumber,
      amount: this.transferData.amount,
      description: this.transferData.description || 'Transfert',
      pin: this.transferData.pin
    }).subscribe({
      next: (response) => {
        console.log('Transfert réussi:', response);
        this.toastService.show('Transfert effectué avec succès', 'success');
        this.closeModal();
        this.loadRecentTransactions();
      },
      error: (error) => {
        console.error('Erreur de transfert:', error);
        this.toastService.show(error.message || 'Erreur lors du transfert', 'error');
      }
    });
  }

  confirmBillsPayment() {
    if (this.billsData.pin === '1234') { // Remplacer par une vraie validation
      console.log('Paiement de facture confirmé:', {
        type: 'bills',
        provider: this.billsData.provider,
        amount: this.billsData.amount
      });
      this.closeModal();
    } else {
      alert('Code PIN incorrect');
    }
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

  // États des modals
  showTransferModal = false;
  showMobileRechargeModal = false;
  showTransportModal = false;
  showBillsModal = false;
  currentStep: 'details' | 'pin' = 'details';

  // Données des différents services
  transferData: TransferData = {
    phoneNumber: '',
    amount: 0,
    pin: ''
  };

  mobileRechargeData: MobileRechargeData = {
    phoneNumber: '',
    amount: 0,
    isOwnNumber: true,
    pin: ''
  };

  transportData: TransportData = {
    ticketType: 'single',
    quantity: 1,
    pin: ''
  };

  billsData: BillsData = {
    provider: '',
    amount: 0,
    pin: '',
    reference: ''
  };

  billsAmount = 0;
  billsPin = '';

  quickAmounts = [5, 10, 20, 50, 100];
  phoneNumberError: string = '';
  amountError: string = '';
  isPhoneNumberValid: boolean = false;
  isAmountValid: boolean = false;

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
    console.log('Validation du montant:', value);
    
    if (value < 1) {
      this.amountError = 'Le montant minimum est de 1€';
      this.isAmountValid = false;
    } else if (value > 1000) {
      this.amountError = 'Le montant maximum est de 1000€';
      this.isAmountValid = false;
    } else {
      this.amountError = '';
      this.isAmountValid = true;
    }
  }

  selectQuickAmount(amount: number) {
    this.transferData.amount = amount;
    this.amountError = '';
    this.isAmountValid = true;
  }

  canProceedTransfer(): boolean {
    return this.isPhoneNumberValid && 
           this.isAmountValid && 
           this.transferData.amount >= 1 && 
           this.transferData.amount <= 1000;
  }

  // Données pour les tickets de transport
  ticketTypes = [
    {
      value: 'single',
      label: 'Ticket unique',
      description: 'Valable 1h après la première validation',
      icon: 'fa-ticket-alt',
      price: 1.90
    },
    {
      value: 'book',
      label: 'Carnet 10 tickets',
      description: 'Économisez avec le carnet',
      icon: 'fa-tickets-alt',
      price: 16.90
    },
    {
      value: 'monthly',
      label: 'Abonnement mensuel',
      description: 'Voyages illimités pendant 30 jours',
      icon: 'fa-calendar-alt',
      price: 75.00
    }
  ];

  // Données pour les fournisseurs de factures
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

  billAmountError: string = '';
  isBillAmountValid: boolean = false;

  selectTicketType(type: string) {
    this.transportData.ticketType = type;
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
    const ticket = this.ticketTypes.find(t => t.value === this.transportData.ticketType);
    return ticket ? ticket.price * this.transportData.quantity : 0;
  }

  getTicketTypeLabel(type: string): string {
    const ticket = this.ticketTypes.find(t => t.value === type);
    return ticket ? ticket.label : type;
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

  canProceedTransport(): boolean {
    const isValid: boolean = 
      Boolean(this.transportData.ticketType) && 
      this.transportData.quantity >= 1 && 
      this.transportData.quantity <= 10;
    
    return isValid;
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

  canProceedMobile(): boolean {
    if (this.mobileRechargeData.isOwnNumber) {
      return this.isAmountValid === true && 
             this.mobileRechargeData.amount >= 5 && 
             this.mobileRechargeData.amount <= 100;
    }
    return this.isPhoneNumberValid === true && 
           Boolean(this.mobileRechargeData.phoneNumber) && 
           this.isAmountValid === true && 
           this.mobileRechargeData.amount >= 5 && 
           this.mobileRechargeData.amount <= 100;
  }

  onPhoneNumberChange(phoneNumber: string) {
    console.log('Nouveau numéro de téléphone:', phoneNumber);
    this.transferData.phoneNumber = phoneNumber;
    this.phoneNumberError = '';
  }

  onPhoneValidityChange(isValid: boolean) {
    console.log('Validité du numéro:', isValid);
    this.isPhoneNumberValid = isValid;
  }

  selectedTransaction: Transaction | null = null;
  showTransactionDetails = false;

  openTransactionDetails(transaction: Transaction) {
    this.selectedTransaction = transaction;
    this.showTransactionDetails = true;
  }

  closeTransactionDetails() {
    this.selectedTransaction = null;
    this.showTransactionDetails = false;
  }

  getTransactionParticipant(transaction: Transaction): string {
    if (transaction.type === 'transfer') {
      return transaction.destinataire ? 
        `${transaction.destinataire.prenom} ${transaction.destinataire.nom}` : 
        'Destinataire inconnu';
    }
    return '';
  }

  // Propriétés pour la pagination
  currentPage = 1;
  pageSize = 3;
  totalTransactions = 0;

  get paginatedTransactions(): Transaction[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.recentTransactions.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.recentTransactions.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
} 