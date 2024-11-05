import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction, TransactionType, TransactionStatus } from '../../models/transaction.model';
import { DateFilter } from '../../models/filter.model';
import { TransactionService } from '../../services/transaction.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- En-tête avec statistiques -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Total transactions</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{totalTransactions}}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <i class="fas fa-exchange-alt text-indigo-600 dark:text-indigo-400 text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Dépenses du mois</p>
                <p class="text-2xl font-bold text-red-600 dark:text-red-400">
                  {{getTotalExpenses() | currency:'EUR'}}
                </p>
              </div>
              <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <i class="fas fa-arrow-down text-red-600 dark:text-red-400 text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Revenus du mois</p>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                  {{getTotalIncome() | currency:'EUR'}}
                </p>
              </div>
              <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <i class="fas fa-arrow-up text-green-600 dark:text-green-400 text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Balance du mois</p>
                <p class="text-2xl font-bold" 
                   [class]="getMonthlyBalance() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{getMonthlyBalance() | currency:'EUR'}}
                </p>
              </div>
              <div class="w-12 h-12 rounded-full" 
                   [class]="getMonthlyBalance() >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'">
                <i class="fas fa-chart-line text-xl" 
                   [class]="getMonthlyBalance() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtres -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Historique des transactions</h1>
            
            <div class="flex flex-wrap gap-2">
              <button *ngFor="let filter of dateFilters"
                      (click)="setDateFilter(filter)"
                      [class]="getFilterButtonClass(filter)"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <i [class]="filter.icon"></i>
                {{filter.label}}
              </button>
            </div>
          </div>
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
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destinataire</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Montant</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
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
                          class="px-3 py-1 text-xs font-medium rounded-full flex items-center gap-2 w-fit">
                      <i [class]="getTransactionIcon(transaction.type)"></i>
                      {{getTransactionTypeLabel(transaction.type)}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{transaction.description}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div *ngIf="transaction.destinataire" class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <i class="fas fa-user text-gray-600 dark:text-gray-400"></i>
                      </div>
                      <span>{{transaction.destinataire.prenom}} {{transaction.destinataire.nom}}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" 
                      [class]="transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                    {{transaction.amount | currency:'EUR'}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getStatusBadgeClass(transaction.status)"
                          class="px-3 py-1 text-xs font-medium rounded-full flex items-center gap-2 w-fit">
                      <i [class]="getStatusIcon(transaction.status)"></i>
                      {{transaction.status}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <button (click)="openTransactionDetails(transaction)"
                            class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>

                <!-- Message si aucune transaction -->
                <tr *ngIf="filteredTransactions.length === 0">
                  <td colspan="7" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>Aucune transaction pour cette période</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Affichage de {{(currentPage - 1) * pageSize + 1}} à 
                {{Math.min(currentPage * pageSize, totalTransactions)}}
                sur {{totalTransactions}} transactions
              </div>
              
              <div class="flex gap-2">
                <button (click)="previousPage()"
                        [disabled]="currentPage === 1"
                        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50
                               bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                               hover:bg-gray-100 dark:hover:bg-gray-700">
                  <i class="fas fa-chevron-left mr-2"></i>
                  Précédent
                </button>
                
                <button (click)="nextPage()"
                        [disabled]="currentPage === totalPages"
                        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50
                               bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                               hover:bg-gray-100 dark:hover:bg-gray-700">
                  Suivant
                  <i class="fas fa-chevron-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Détails Transaction -->
      <div *ngIf="selectedTransaction" 
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
                    <i [class]="getTransactionIcon(selectedTransaction.type) + ' mr-2'"></i>
                    {{getTransactionTypeLabel(selectedTransaction.type)}}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Montant</p>
                  <p [class]="'font-medium ' + (selectedTransaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')">
                    {{selectedTransaction.amount | currency:'EUR'}}
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
                        class="px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-2">
                    <i [class]="getStatusIcon(selectedTransaction.status)"></i>
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
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  currentFilter: DateFilter;
  Math = Math; // Pour utiliser Math dans le template

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalTransactions = 0;

  dateFilters: DateFilter[] = [
    { label: 'Aujourd\'hui', value: 'day', days: 1, icon: 'fas fa-calendar-day' },
    { label: 'Cette semaine', value: 'week', days: 7, icon: 'fas fa-calendar-week' },
    { label: 'Ce mois', value: 'month', days: 30, icon: 'fas fa-calendar-alt' },
    { label: 'Cette année', value: 'year', days: 365, icon: 'fas fa-calendar' }
  ];

  constructor(
    private transactionService: TransactionService,
    private toastService: ToastService
  ) {
    this.currentFilter = this.dateFilters[1]; // Par défaut : Cette semaine
  }

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getTransactionHistory().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.totalTransactions = transactions.length;
        this.filterTransactions();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des transactions:', error);
        this.toastService.show('Erreur lors du chargement des transactions', 'error');
      }
    });
  }

  setDateFilter(filter: DateFilter) {
    this.currentFilter = filter;
    this.currentPage = 1; // Réinitialiser à la première page
    this.filterTransactions();
  }

  filterTransactions() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.currentFilter.days);
    
    this.filteredTransactions = this.transactions
      .filter(transaction => new Date(transaction.date) >= cutoffDate)
      .slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.transactions.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterTransactions();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterTransactions();
    }
  }

  getFilterButtonClass(filter: DateFilter): string {
    if (this.currentFilter === filter) {
      return 'bg-indigo-600 text-white';
    }
    return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
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

  getTransactionIcon(type: string): string {
    const icons: Record<TransactionType, string> = {
      deposit: 'fas fa-arrow-down',
      withdrawal: 'fas fa-arrow-up',
      transfer: 'fas fa-exchange-alt',
      payment: 'fas fa-shopping-cart',
      buy: 'fas fa-cart-plus',
      sell: 'fas fa-cart-arrow-down'
    };
    return icons[type as TransactionType] || 'fas fa-circle';
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<TransactionStatus, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
    };
    return classes[status as TransactionStatus] || '';
  }

  getStatusIcon(status: string): string {
    const icons: Record<TransactionStatus, string> = {
      completed: 'fas fa-check',
      pending: 'fas fa-clock',
      failed: 'fas fa-times'
    };
    return icons[status as TransactionStatus] || 'fas fa-circle';
  }

  openTransactionDetails(transaction: Transaction) {
    this.selectedTransaction = transaction;
  }

  closeTransactionDetails() {
    this.selectedTransaction = null;
  }

  getTotalExpenses(): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(1); // Premier jour du mois
    return this.transactions
      .filter(t => new Date(t.date) >= cutoffDate && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  getTotalIncome(): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(1); // Premier jour du mois
    return this.transactions
      .filter(t => new Date(t.date) >= cutoffDate && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getMonthlyBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }
} 