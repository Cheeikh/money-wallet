import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceConfig } from '../../../models/service.model';

@Component({
  selector: 'app-quick-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-services.component.html'
})
export class QuickServicesComponent {
  @Input() isCustomizing = false;
  @Input() availableServices: ServiceConfig[] = [];
  @Input() selectedServices: ServiceConfig[] = [];

  @Output() onCustomizeToggle = new EventEmitter<void>();
  @Output() onServiceClick = new EventEmitter<string>();
  @Output() onServiceToggle = new EventEmitter<ServiceConfig>();

  getCustomizationButtonClass(service: ServiceConfig): string {
    const baseClass = 'flex items-center justify-center p-4 rounded-lg transition-colors ';
    if (service.isSelected) {
      return baseClass + service.bgClass + ' ' + service.iconClass;
    }
    return baseClass + 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
  }
} 