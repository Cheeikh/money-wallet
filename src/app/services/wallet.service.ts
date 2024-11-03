import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { Transaction, CreateTransactionDTO, TransactionType } from '../models/transaction.model';

@Injectable({
    providedIn: 'root'
})
export class WalletService {
    private apiUrl = `${environment.apiUrl}/users`;
    private balanceSubject = new BehaviorSubject<number>(0);
    private hideBalanceSubject = new BehaviorSubject<boolean>(false);
    private transactionsSubject = new BehaviorSubject<Transaction[]>([]);

    balance$ = this.balanceSubject.asObservable();
    hideBalance$ = this.hideBalanceSubject.asObservable();
    transactions$ = this.transactionsSubject.asObservable();

    constructor(private http: HttpClient) {
        this.updateBalance();
    }

    updateBalance(): void {
        this.http.get<any>(`${this.apiUrl}/profile`)
            .pipe(
                catchError(error => {
                    console.error('Erreur lors de la récupération du profil:', error);
                    return [];
                })
            )
            .subscribe({
                next: (response) => {
                    if (response?.success && response?.data?.solde !== undefined) {
                        this.balanceSubject.next(response.data.solde);
                    }
                },
                error: (error) => {
                    console.error('Erreur lors de la mise à jour du solde:', error);
                }
            });
    }

    refreshBalance(): void {
        this.updateBalance();
    }

    addTransaction(transactionDto: CreateTransactionDTO): void {
        const newTransaction: Transaction = {
            id: Date.now().toString(), // ID temporaire
            type: transactionDto.type,
            amount: transactionDto.amount,
            description: transactionDto.description,
            date: new Date(),
            status: 'pending', // Statut initial
            recipient: transactionDto.recipient,
            icon: this.getTransactionIcon(transactionDto.type)
        };

        const currentTransactions = this.transactionsSubject.value;
        this.transactionsSubject.next([newTransaction, ...currentTransactions]);
        this.updateBalance();
    }

    private getTransactionIcon(type: TransactionType): string {
        const iconMap: { [key in TransactionType]: string } = {
            'transfer': 'fa-exchange-alt',
            'deposit': 'fa-arrow-down',
            'withdrawal': 'fa-arrow-up',
            'payment': 'fa-shopping-cart',
            'buy': 'fa-cart-plus',
            'sell': 'fa-cart-arrow-down'
        };
        return iconMap[type] || 'fa-circle';
    }

    toggleBalanceVisibility(): void {
        this.hideBalanceSubject.next(!this.hideBalanceSubject.value);
    }
} 