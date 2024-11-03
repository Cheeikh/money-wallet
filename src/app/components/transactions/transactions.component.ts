import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Transaction, CreateTransactionDTO, TransactionType } from '../../models/transaction.model';
import { DateFilter } from '../../models/filter.model';
import { WalletService } from '../../services/wallet.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- En-tête -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Historique des transactions</h1>
          
          <!-- Filtres -->
          <div class="flex flex-wrap gap-2">
            <button *ngFor="let filter of dateFilters"
                    (click)="setDateFilter(filter)"
                    [class.bg-indigo-600]="currentFilter === filter"
                    [class.text-white]="currentFilter === filter"
                    [class.bg-white]="currentFilter !== filter"
                    [class.dark:bg-gray-800]="currentFilter !== filter"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md">
              {{filter.label}}
            </button>
          </div>
        </div>

        <!-- Nouvelle transaction -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nouvelle transaction</h2>
          <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select formControlName="type" 
                        class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-400">
                  <option *ngFor="let type of transactionTypes" [value]="type.value">{{type.label}}</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input type="text" formControlName="description"
                       class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-400">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant</label>
                <input type="number" formControlName="amount"
                       class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-400">
              </div>
              
              <div class="flex items-end">
                <button type="submit" 
                        [disabled]="!transactionForm.valid"
                        class="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Ajouter
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Liste des transactions -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Montant</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let transaction of filteredTransactions" 
                    class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{transaction.date | date:'short'}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getTransactionTypeClass(transaction.type)"
                          class="px-2 py-1 text-xs font-medium rounded-full">
                      {{getTransactionTypeLabel(transaction.type)}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{transaction.description}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm" 
                      [class]="transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                    {{transaction.amount | currency:'EUR'}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getStatusBadgeClass(transaction.status)"
                          class="px-2 py-1 text-xs font-medium rounded-full">
                      {{transaction.status}}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TransactionsComponent implements OnInit {
  transactionForm: FormGroup;
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  currentFilter: DateFilter;

  dateFilters: DateFilter[] = [
    { label: 'Aujourd\'hui', value: 'day', days: 1 },
    { label: 'Cette semaine', value: 'week', days: 7 },
    { label: 'Ce mois', value: 'month', days: 30 },
    { label: 'Cette année', value: 'year', days: 365 }
  ];

  transactionTypes = [
    { value: 'deposit' as TransactionType, label: 'Dépôt' },
    { value: 'withdrawal' as TransactionType, label: 'Retrait' },
    { value: 'transfer' as TransactionType, label: 'Transfert' },
    { value: 'payment' as TransactionType, label: 'Paiement' },
    { value: 'buy' as TransactionType, label: 'Achat' },
    { value: 'sell' as TransactionType, label: 'Vente' }
  ];

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private notificationService: NotificationService
  ) {
    this.currentFilter = this.dateFilters[1]; // Par défaut : Cette semaine
    this.transactionForm = this.fb.group({
      type: ['deposit', Validators.required],
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.walletService.transactions$.subscribe(transactions => {
      this.transactions = transactions;
      this.filterTransactions();
    });
  }

  setDateFilter(filter: DateFilter) {
    this.currentFilter = filter;
    this.filterTransactions();
  }

  filterTransactions() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.currentFilter.days);
    
    this.filteredTransactions = this.transactions.filter(transaction => 
      new Date(transaction.date) >= cutoffDate
    );
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      
      const transactionDto: CreateTransactionDTO = {
        type: formValue.type as TransactionType,
        amount: formValue.amount,
        description: formValue.description,
        recipient: formValue.recipient
      };

      this.walletService.addTransaction(transactionDto);
      this.transactionForm.reset();
      
      this.notificationService.success(
        'Transaction réussie',
        'La transaction a été ajoutée avec succès'
      );
    }
  }

  getTransactionTypeClass(type: string): string {
    const classes: Record<TransactionType, string> = {
      deposit: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400',
      withdrawal: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400',
      transfer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400',
      payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400',
      buy: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-400',
      sell: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-400'
    };
    return classes[type as TransactionType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400';
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

  getStatusBadgeClass(status: string): string {
    const classes: Record<'completed' | 'pending' | 'failed', string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
    };
    return classes[status as 'completed' | 'pending' | 'failed'] || '';
  }
} 