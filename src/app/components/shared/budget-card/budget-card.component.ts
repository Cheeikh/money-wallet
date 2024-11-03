import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../services/category.service';

@Component({
  selector: 'app-budget-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div [class]="'w-12 h-12 rounded-full flex items-center justify-center ' + getBgClass()">
            <i [class]="'fas ' + category.icon + ' ' + category.color + ' text-xl'"></i>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{category.name}}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{category.spent | currency:'EUR'}} / {{category.budget | currency:'EUR'}}
            </p>
          </div>
        </div>
        <div class="text-right">
          <p [class]="'text-sm font-medium ' + getPercentageClass()">
            {{getPercentage()}}%
          </p>
        </div>
      </div>

      <!-- Barre de progression -->
      <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div class="h-full transition-all duration-500"
             [class]="getProgressBarClass()"
             [style.width.%]="getPercentage()">
        </div>
      </div>

      <!-- Informations supplémentaires -->
      <div class="mt-4 flex justify-between text-sm">
        <p class="text-gray-500 dark:text-gray-400">
          Restant: {{getRemainingAmount() | currency:'EUR'}}
        </p>
        <p [class]="'font-medium ' + getDaysRemainingClass()">
          {{getDaysRemaining()}} jours restants
        </p>
      </div>
    </div>
  `
})
export class BudgetCardComponent {
  @Input() category!: Category;

  getBgClass(): string {
    return this.category.color.replace('text-', 'bg-').replace('600', '100') + 
           ' dark:' + this.category.color.replace('text-', 'bg-').replace('600', '900');
  }

  getPercentage(): number {
    if (!this.category.budget) return 0;
    return Math.round((this.category.spent || 0) / this.category.budget * 100);
  }

  getPercentageClass(): string {
    const percentage = this.getPercentage();
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  }

  getProgressBarClass(): string {
    const percentage = this.getPercentage();
    if (percentage >= 90) return 'bg-red-600 dark:bg-red-500';
    if (percentage >= 75) return 'bg-yellow-600 dark:bg-yellow-500';
    return 'bg-green-600 dark:bg-green-500';
  }

  getRemainingAmount(): number {
    if (!this.category.budget) return 0;
    return this.category.budget - (this.category.spent || 0);
  }

  getDaysRemaining(): number {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate();
  }

  getDaysRemainingClass(): string {
    const days = this.getDaysRemaining();
    if (days <= 3) return 'text-red-600 dark:text-red-400';
    if (days <= 7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  }
} 