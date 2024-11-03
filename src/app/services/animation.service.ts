import { Injectable } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  fadeInUp = trigger('fadeInUp', [
    state('in', style({ opacity: 1, transform: 'translateY(0)' })),
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('0.3s ease-out')
    ])
  ]);

  slideIn = trigger('slideIn', [
    state('in', style({ opacity: 1, transform: 'translateX(0)' })),
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(-20px)' }),
      animate('0.3s ease-out')
    ])
  ]);

  fadeIn = trigger('fadeIn', [
    state('in', style({ opacity: 1 })),
    transition(':enter', [
      style({ opacity: 0 }),
      animate('0.3s ease-out')
    ])
  ]);
} 