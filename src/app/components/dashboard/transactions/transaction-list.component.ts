import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-list.component.html'
})
export class TransactionListComponent {
  @Input() paginatedTransactions: Transaction[] = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Output() onTransactionClick = new EventEmitter<Transaction>();
  @Output() onPreviousPage = new EventEmitter<void>();
  @Output() onNextPage = new EventEmitter<void>();
} 