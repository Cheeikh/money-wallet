import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-6 bg-white dark:bg-gray-800 hover:scale-105 transition-all duration-300">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{title}}</h3>
        <div [class]="'p-3 rounded-full ' + iconBgClass">
          <i [class]="'fas ' + icon + ' ' + iconColorClass"></i>
        </div>
      </div>
      <p class="text-2xl font-bold text-gray-900 dark:text-white">{{value}}</p>
      <ng-container *ngIf="trend !== undefined">
        <p [class]="'text-sm mt-2 flex items-center ' + 
           (trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')">
          <i class="fas fa-arrow-{{trend > 0 ? 'up' : 'down'}} mr-1"></i>
          {{trend}}% vs période précédente
        </p>
      </ng-container>
      <div class="mt-4">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = '';
  @Input() iconBgClass: string = 'bg-blue-100 dark:bg-blue-900';
  @Input() iconColorClass: string = 'text-blue-600 dark:text-blue-400';
  @Input() trend?: number;
} 