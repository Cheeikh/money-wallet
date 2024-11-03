import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioItem } from '../../models/portfolio.model';

@Component({
  selector: 'app-portfolio',
  template: `
    <div class="portfolio-page">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Mon Portefeuille</h5>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Symbole</th>
                  <th>Quantité</th>
                  <th>Prix Moyen</th>
                  <th>Prix Actuel</th>
                  <th>Valeur Totale</th>
                  <th>Profit/Perte</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of portfolioItems">
                  <td>{{item.symbol}}</td>
                  <td>{{item.quantity}}</td>
                  <td>{{item.averagePrice | currency:'EUR'}}</td>
                  <td>{{item.currentPrice | currency:'EUR'}}</td>
                  <td>{{item.totalValue | currency:'EUR'}}</td>
                  <td [ngClass]="{'text-success': item.profitLoss > 0, 'text-danger': item.profitLoss < 0}">
                    {{item.profitLoss | currency:'EUR'}}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .portfolio-page {
      padding: 20px;
    }
    @media (max-width: 768px) {
      .portfolio-page {
        padding: 10px;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class PortfolioComponent {
  portfolioItems: PortfolioItem[] = [
    {
      symbol: 'AAPL',
      quantity: 10,
      averagePrice: 150,
      currentPrice: 170,
      totalValue: 1700,
      profitLoss: 200
    }
  ];
} 