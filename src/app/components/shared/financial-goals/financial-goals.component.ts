import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-financial-goals',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Objectifs financiers
      </h2>

      <div class="space-y-4">
        <div *ngFor="let goal of goals" 
             class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
             [@slideIn]>
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium text-gray-900 dark:text-white">{{goal.name}}</h3>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{goal.currentAmount | currency:'EUR'}} / {{goal.targetAmount | currency:'EUR'}}
            </span>
          </div>
          
          <div class="relative w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div class="absolute top-0 left-0 h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
                 [style.width.%]="(goal.currentAmount / goal.targetAmount) * 100">
            </div>
          </div>
          
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {{goal.description}}
          </p>
        </div>
      </div>
    </div>
  `
})
export class FinancialGoalsComponent {
  goals = [
    {
      name: 'Épargne vacances',
      targetAmount: 2000,
      currentAmount: 1200,
      description: 'Pour les vacances d\'été'
    },
    {
      name: 'Fond d\'urgence',
      targetAmount: 5000,
      currentAmount: 3500,
      description: '3 mois de dépenses'
    }
  ];
} 