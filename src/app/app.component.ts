import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HttpClientModule],
  template: `
    <div class="app-container">
      <!-- Navbar masquée uniquement sur les pages d'auth -->
      <nav *ngIf="!isAuthRoute" class="bg-gradient-to-r from-indigo-600 to-indigo-800 fixed w-full z-50 top-0 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo et titre -->
            <div class="flex-shrink-0 flex items-center cursor-pointer" routerLink="/dashboard">
              <i class="fas fa-wallet text-white text-2xl mr-2"></i>
              <span class="text-white text-xl font-bold">MoneyWallet</span>
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

              <!-- Actions à droite -->
              <div class="flex items-center space-x-4">
                <!-- Bouton notifications -->
                <button class="text-white p-2 rounded-full hover:bg-indigo-700 transition-colors">
                  <i class="fas fa-bell"></i>
                </button>

                <!-- Bouton thème -->
                <button (click)="toggleTheme()" 
                        class="p-2 rounded-full hover:bg-indigo-700 transition-colors text-white">
                  <i class="fa-solid" [ngClass]="{'fa-sun': isDarkMode$ | async, 'fa-moon': !(isDarkMode$ | async)}"></i>
                </button>

                <!-- Menu profil -->
                <div class="relative">
                  <button (click)="toggleProfileMenu()" 
                          class="text-white p-2 rounded-full hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                    <i class="fas fa-user-circle"></i>
                    <span class="text-sm">{{ (currentUser$ | async)?.firstName || 'Mon compte' }}</span>
                    <i class="fas fa-chevron-down text-xs"></i>
                  </button>

                  <!-- Menu déroulant profil -->
                  <div *ngIf="isProfileMenuOpen" 
                       class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div class="py-1">
                      <a routerLink="/profile" 
                         class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i class="fas fa-user-circle mr-2"></i>Mon profil
                      </a>
                      <a routerLink="/settings" 
                         class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i class="fas fa-cog mr-2"></i>Paramètres
                      </a>
                      <button (click)="logout()" 
                              class="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <i class="fas fa-sign-out-alt mr-2"></i>Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
             [ngClass]="{'opacity-100 max-h-96': isMenuOpen, 'opacity-0 max-h-0': !isMenuOpen}">
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
            <div class="border-t border-indigo-700 my-2"></div>
            <a routerLink="/profile" 
               class="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-colors">
              <i class="fas fa-user-circle mr-2"></i>Mon profil
            </a>
            <a routerLink="/settings" 
               class="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-colors">
              <i class="fas fa-cog mr-2"></i>Paramètres
            </a>
            <button (click)="logout()" 
                    class="w-full text-left text-red-400 block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 transition-colors">
              <i class="fas fa-sign-out-alt mr-2"></i>Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <!-- Contenu principal -->
      <main [class.pt-16]="!isAuthRoute">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    main {
      flex: 1;
    }

    .max-h-0 {
      max-height: 0;
      overflow: hidden;
    }

    .max-h-96 {
      max-height: 24rem;
    }
  `]
})
export class AppComponent implements OnInit {
  isAuthRoute: boolean = false;
  isMenuOpen: boolean = false;
  isProfileMenuOpen: boolean = false;
  isDarkMode$ = this.themeService.isDarkMode$;
  currentUser$ = this.authService.currentUser$;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Vérifier la route initiale
    this.checkIfAuthRoute(this.router.url);

    // S'abonner aux changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkIfAuthRoute(event.url);
    });
  }

  private checkIfAuthRoute(url: string) {
    this.isAuthRoute = url === '/' || url.includes('/login') || url.includes('/register');
    if (this.isAuthRoute) {
      this.isMenuOpen = false;
      this.isProfileMenuOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.isProfileMenuOpen = false;
    }
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
