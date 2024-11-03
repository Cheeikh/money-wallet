import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    // Vérifier les préférences système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark);
  }

  toggleTheme() {
    this.isDarkMode.next(!this.isDarkMode.value);
    this.updateTheme();
  }

  private setTheme(isDark: boolean) {
    this.isDarkMode.next(isDark);
    this.updateTheme();
  }

  private updateTheme() {
    if (this.isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
} 