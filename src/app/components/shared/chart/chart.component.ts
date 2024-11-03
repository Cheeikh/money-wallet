import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-6 bg-white dark:bg-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{title}}</h3>
        <div class="flex space-x-2">
          <button *ngFor="let period of periods"
                  (click)="changePeriod(period)"
                  [class.bg-indigo-600]="selectedPeriod === period"
                  [class.text-white]="selectedPeriod === period"
                  class="px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  [class.hover:bg-indigo-700]="selectedPeriod === period"
                  [class.text-gray-600]="selectedPeriod !== period"
                  [class.dark:text-gray-300]="selectedPeriod !== period"
                  [class.hover:bg-gray-100]="selectedPeriod !== period"
                  [class.dark:hover:bg-gray-700]="selectedPeriod !== period">
            {{period}}
          </button>
        </div>
      </div>
      <canvas #chartCanvas></canvas>
    </div>
  `
})
export class ChartComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @Input() title: string = '';
  @Input() type: 'line' | 'bar' | 'pie' = 'line';
  @Input() data: any;
  @Input() options: any;

  periods = ['1S', '1M', '3M', '1A'];
  selectedPeriod = '1M';
  chart: Chart | null = null;

  ngOnInit() {
    this.initChart();
  }

  private initChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: {
        ...this.options,
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  changePeriod(period: string) {
    this.selectedPeriod = period;
    // Implémenter la logique de mise à jour des données selon la période
  }
} 