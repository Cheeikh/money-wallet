import { Injectable, ComponentRef } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationData {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationData>();
  notifications$ = this.notificationSubject.asObservable();

  show(data: NotificationData) {
    this.notificationSubject.next(data);
  }

  success(title: string, message: string, duration = 5000) {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration = 5000) {
    this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration = 5000) {
    this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration = 5000) {
    this.show({ type: 'info', title, message, duration });
  }
} 