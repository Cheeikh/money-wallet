import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="bg-gradient-to-r from-indigo-600 to-indigo-800 fixed w-full z-50 top-0 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo et titre -->
          <div class="flex-shrink-0 flex items-center">
            <i class="fas fa-chart-line text-white text-2xl mr-2"></i>
            <span class="text-white text-xl font-bold">MonPortefeuille</span>
          </div>
          
          <!-- Navigation desktop -->
          <div class="hidden md:flex items-center space-x-4">
            <div class="flex items-baseline space-x-4">
              <a routerLink="/dashboard" routerLinkActive="bg-indigo-700"
                class="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                <i class="fas fa-chart-pie mr-2"></i>Tableau de bord
              </a>
              <a routerLink="/services" routerLinkActive="bg-indigo-700"
                class="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                <i class="fas fa-concierge-bell mr-2"></i>Services
              </a>
              <a routerLink="/transactions" routerLinkActive="bg-indigo-700"
                class="text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                <i class="fas fa-exchange-alt mr-2"></i>Transactions
              </a>
            </div>

            <!-- Bouton thème -->
            <button (click)="toggleTheme()" 
                    class="ml-4 p-2 rounded-full hover:bg-indigo-700 transition-colors text-white">
              <i class="fa-solid" [ngClass]="{'fa-sun': isDarkMode$ | async, 'fa-moon': !(isDarkMode$ | async)}"></i>
            </button>
          </div>
          
          <!-- Menu mobile -->
          <div class="md:hidden flex items-center space-x-2">
            <!-- Bouton thème mobile -->
            <button (click)="toggleTheme()" 
                    class="p-2 rounded-full hover:bg-indigo-700 transition-colors text-white">
              <i class="fa-solid" [ngClass]="{'fa-sun': isDarkMode$ | async, 'fa-moon': !(isDarkMode$ | async)}"></i>
            </button>
            
            <!-- Bouton menu mobile -->
            <button (click)="toggleMenu()" class="text-white p-2 rounded-full hover:bg-indigo-700 transition-colors">
              <i class="fa-solid" [ngClass]="{'fa-times': isMenuOpen, 'fa-bars': !isMenuOpen}"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Menu mobile déroulant -->
      <div class="md:hidden transition-all duration-300 ease-in-out"
           [ngClass]="{'opacity-100 max-h-48': isMenuOpen, 'opacity-0 max-h-0': !isMenuOpen}">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-indigo-800">
          <a routerLink="/dashboard" routerLinkActive="bg-indigo-700"
            class="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-colors">
            <i class="fas fa-chart-pie mr-2"></i>Tableau de bord
          </a>
          <a routerLink="/services" routerLinkActive="bg-indigo-700"
            class="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-colors">
            <i class="fas fa-concierge-bell mr-2"></i>Services
          </a>
          <a routerLink="/transactions" routerLinkActive="bg-indigo-700"
            class="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-colors">
            <i class="fas fa-exchange-alt mr-2"></i>Transactions
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 4rem;
    }

    .max-h-0 {
      max-height: 0;
      overflow: hidden;
    }

    .max-h-48 {
      max-height: 12rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class NavbarComponent {
  isMenuOpen = false;
  isDarkMode$ = this.themeService.isDarkMode$;
  
  constructor(private themeService: ThemeService) {}
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
} 