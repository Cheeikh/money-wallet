import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" [@slideIn]
         class="fixed top-20 right-4 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden"
         [ngClass]="getBackgroundClass()">
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <i [class]="getIconClass()" class="text-2xl"></i>
          </div>
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{title}}
            </p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {{message}}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button (click)="close()"
                    class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      <!-- Barre de progression -->
      <div class="h-1 bg-opacity-20 bg-black dark:bg-white">
        <div class="h-full transition-all duration-75"
             [ngClass]="getProgressClass()"
             [style.width.%]="progress"></div>
      </div>
    </div>
  `,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationComponent {
  @Input() type: NotificationType = 'info';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() duration: number = 5000;

  show = true;
  progress = 100;
  private progressInterval: any;

  ngOnInit() {
    this.startProgressBar();
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  close() {
    this.show = false;
  }

  private startProgressBar() {
    const step = 100 / (this.duration / 100); // Update every 100ms
    this.progressInterval = setInterval(() => {
      this.progress -= step;
      if (this.progress <= 0) {
        this.close();
        clearInterval(this.progressInterval);
      }
    }, 100);
  }

  getBackgroundClass(): string {
    const classes = {
      success: 'bg-green-50 dark:bg-green-900',
      error: 'bg-red-50 dark:bg-red-900',
      warning: 'bg-yellow-50 dark:bg-yellow-900',
      info: 'bg-blue-50 dark:bg-blue-900'
    };
    return classes[this.type];
  }

  getIconClass(): string {
    const classes = {
      success: 'fas fa-check-circle text-green-400 dark:text-green-300',
      error: 'fas fa-exclamation-circle text-red-400 dark:text-red-300',
      warning: 'fas fa-exclamation-triangle text-yellow-400 dark:text-yellow-300',
      info: 'fas fa-info-circle text-blue-400 dark:text-blue-300'
    };
    return classes[this.type];
  }

  getProgressClass(): string {
    const classes = {
      success: 'bg-green-500 dark:bg-green-400',
      error: 'bg-red-500 dark:bg-red-400',
      warning: 'bg-yellow-500 dark:bg-yellow-400',
      info: 'bg-blue-500 dark:bg-blue-400'
    };
    return classes[this.type];
  }
} 