import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

interface StatItem {
  label: string;
  value: number;
  previousValue: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-stats-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div *ngFor="let stat of stats; let i = index"
           class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
           [@fadeInUp]="{value: '', params: { delay: i * 100 }}">
        <div class="flex items-center justify-between mb-4">
          <div [class]="'p-3 rounded-full ' + stat.color + '-light'">
            <i [class]="'fas ' + stat.icon + ' ' + stat.color + '-text'"></i>
          </div>
          <div class="flex items-center space-x-1">
            <span [class]="getPercentageClass(stat.value, stat.previousValue)">
              {{getPercentageChange(stat.value, stat.previousValue)}}%
            </span>
            <i class="fas fa-arrow-up text-xs" 
               [class.rotate-180]="stat.value < stat.previousValue"
               [class]="getPercentageClass(stat.value, stat.previousValue)">
            </i>
          </div>
        </div>
        
        <h3 class="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {{stat.label}}
        </h3>
        <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {{stat.value | currency:'EUR'}}
        </p>
        
        <!-- Mini graphique -->
        <div class="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full transition-all duration-500"
               [class]="stat.color"
               [style.width.%]="getProgressWidth(stat.value, stat.previousValue)">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .indigo-light { @apply bg-indigo-100 dark:bg-indigo-900/50; }
    .indigo-text { @apply text-indigo-600 dark:text-indigo-400; }
    .green-light { @apply bg-green-100 dark:bg-green-900/50; }
    .green-text { @apply text-green-600 dark:text-green-400; }
    .red-light { @apply bg-red-100 dark:bg-red-900/50; }
    .red-text { @apply text-red-600 dark:text-red-400; }
    .blue-light { @apply bg-blue-100 dark:bg-blue-900/50; }
    .blue-text { @apply text-blue-600 dark:text-blue-400; }
  `],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('{{delay}}ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class StatsOverviewComponent {
  @Input() stats: StatItem[] = [
    {
      label: 'Solde total',
      value: 25000,
      previousValue: 23000,
      icon: 'fa-wallet',
      color: 'indigo'
    },
    {
      label: 'Dépenses mensuelles',
      value: 2800,
      previousValue: 3000,
      icon: 'fa-arrow-trend-down',
      color: 'red'
    }
  ];

  getPercentageChange(current: number, previous: number): number {
    return Math.round(((current - previous) / previous) * 100);
  }

  getPercentageClass(current: number, previous: number): string {
    const change = this.getPercentageChange(current, previous);
    return change > 0 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  }

  getProgressWidth(current: number, previous: number): number {
    return Math.min(100, Math.max(0, (current / previous) * 100));
  }
} 