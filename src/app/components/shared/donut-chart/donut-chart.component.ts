import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full pt-[100%]">
      <svg class="absolute inset-0" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="10"/>
        
        <ng-container *ngFor="let segment of segments; let i = index">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            [attr.stroke]="segment.color"
            stroke-width="10"
            [attr.stroke-dasharray]="segment.dashArray"
            [attr.stroke-dashoffset]="segment.dashOffset"
            transform="rotate(-90 50 50)"
            class="transition-all duration-1000"
          />
        </ng-container>
        
        <circle cx="50" cy="50" r="35" class="fill-white dark:fill-gray-800"/>
      </svg>
      
      <div class="mt-4 space-y-2">
        <div *ngFor="let item of data" class="flex items-center justify-between text-sm">
          <div class="flex items-center">
            <div [style.backgroundColor]="item.color" class="w-3 h-3 rounded-full mr-2"></div>
            <span class="text-gray-600 dark:text-gray-300">{{item.label}}</span>
          </div>
          <span class="font-medium text-gray-900 dark:text-white">{{item.value}}%</span>
        </div>
      </div>
    </div>
  `
})
export class DonutChartComponent {
  @Input() set data(value: ChartData[]) {
    this._data = value;
    this.calculateSegments();
  }
  get data(): ChartData[] {
    return this._data;
  }

  private _data: ChartData[] = [];
  segments: any[] = [];

  private calculateSegments() {
    const total = this._data.reduce((sum, item) => sum + item.value, 0);
    let currentOffset = 0;

    this.segments = this._data.map(item => {
      const percentage = (item.value / total) * 100;
      const dashArray = `${percentage} ${100 - percentage}`;
      const dashOffset = -currentOffset;
      currentOffset += percentage;

      return {
        color: item.color,
        dashArray,
        dashOffset
      };
    });
  }
} 