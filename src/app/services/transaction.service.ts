import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Transaction, CreateTransactionDTO, TransactionType, TransactionStatus } from '../models/transaction.model';
import { environment } from '../../environments/environment';
import { WalletService } from './wallet.service';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private apiUrl = `${environment.apiUrl}/transactions`;

    constructor(
        private http: HttpClient,
        private walletService: WalletService
    ) {}

    createTransfer(data: CreateTransactionDTO): Observable<Transaction> {
        const payload = {
            phoneNumber: data.phoneNumber,
            amount: Number(data.amount),
            description: data.description || 'Transfert',
            type: 'transfer',
            pin: data.pin
        };

        console.log('Client - Payload avant envoi:', {
            ...payload,
            pin: '****'
        });

        return this.http.post<any>(`${this.apiUrl}/transfer`, payload)
            .pipe(
                map(response => {
                    console.log('Client - Réponse reçue:', response);
                    if (response.success && response.data) {
                        this.walletService.updateBalance();
                        return response.data;
                    }
                    throw new Error('Format de réponse invalide');
                }),
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        console.error('Erreur HTTP:', error);
        
        let errorMessage = 'Une erreur est survenue';
        
        if (error.error instanceof ErrorEvent) {
            // Erreur côté client
            errorMessage = error.error.message;
        } else {
            // Erreur côté serveur
            errorMessage = error.error?.error || error.message;
        }

        return throwError(() => new Error(errorMessage));
    }

    getTransactionHistory(): Observable<Transaction[]> {
        return this.http.get<any>(`${this.apiUrl}/history`).pipe(
            map(response => {
                if (response && response.data && Array.isArray(response.data)) {
                    return response.data.map((transaction: any) => ({
                        id: transaction._id || transaction.id,
                        type: this.mapTransactionType(transaction.type),
                        amount: transaction.montant || transaction.amount,
                        description: transaction.description || 'Transaction',
                        date: new Date(transaction.creeLe || transaction.date),
                        status: this.mapTransactionStatus(transaction.status),
                        icon: this.getTransactionIcon(transaction.type),
                        destinataire: transaction.utilisateurDestination ? {
                            nom: transaction.utilisateurDestination.nom,
                            prenom: transaction.utilisateurDestination.prenom,
                            telephone: transaction.utilisateurDestination.telephone
                        } : undefined,
                        source: transaction.utilisateurSource ? {
                            nom: transaction.utilisateurSource.nom,
                            prenom: transaction.utilisateurSource.prenom,
                            telephone: transaction.utilisateurSource.telephone
                        } : undefined
                    }));
                }
                return [];
            }),
            catchError(error => {
                console.error('Erreur lors du chargement de l\'historique:', error);
                return throwError(() => new Error('Erreur lors du chargement de l\'historique'));
            })
        );
    }

    private mapTransactionType(type: string): TransactionType {
        const typeMap: { [key: string]: TransactionType } = {
            'transfert': 'transfer',
            'depot': 'deposit',
            'retrait': 'withdrawal',
            'paiement': 'payment',
            'achat': 'buy',
            'vente': 'sell'
        };
        return typeMap[type] || 'payment';
    }

    private mapTransactionStatus(status: string): TransactionStatus {
        const statusMap: { [key: string]: TransactionStatus } = {
            'terminee': 'completed',
            'en_attente': 'pending',
            'echouee': 'failed'
        };
        return statusMap[status] || 'pending';
    }

    private getTransactionIcon(type: string): string {
        const iconMap: { [key: string]: string } = {
            'transfert': 'fa-exchange-alt',
            'depot': 'fa-arrow-down',
            'retrait': 'fa-arrow-up',
            'paiement': 'fa-shopping-cart',
            'achat': 'fa-cart-plus',
            'vente': 'fa-cart-arrow-down'
        };
        return iconMap[type] || 'fa-circle';
    }

    getTransactionDetails(id: string): Observable<Transaction> {
        return this.http.get<Transaction>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(error => throwError(() => new Error(
                    'Erreur lors du chargement des détails de la transaction'
                )))
            );
    }
} 