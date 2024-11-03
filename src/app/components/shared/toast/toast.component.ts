import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="toast" 
         class="fixed bottom-4 right-4 z-50 animate-slideIn"
         [ngClass]="getToastClass()">
      <div class="flex items-center p-4 rounded-lg shadow-lg">
        <i class="fas" [class]="getIconClass()"></i>
        <span class="ml-2">{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: Toast | null = null;
  private subscription: Subscription | null = null;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.toast = toast;
      setTimeout(() => {
        this.toast = null;
      }, 3000);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getToastClass(): string {
    const baseClass = 'text-white ';
    switch (this.toast?.type) {
      case 'success':
        return baseClass + 'bg-green-600';
      case 'error':
        return baseClass + 'bg-red-600';
      case 'warning':
        return baseClass + 'bg-yellow-600';
      default:
        return baseClass + 'bg-blue-600';
    }
  }

  getIconClass(): string {
    switch (this.toast?.type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      default:
        return 'fa-info-circle';
    }
  }
} 