import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  template: `
    <div class="container mx-auto px-4 py-8 mt-16">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Paramètres</h1>
        
        <!-- Apparence -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Apparence</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-700 dark:text-gray-300">Mode sombre</span>
              <button (click)="toggleTheme()" 
                      class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                {{ (isDarkMode$ | async) ? 'Désactiver' : 'Activer' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Notifications -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Notifications</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-700 dark:text-gray-300">Notifications par email</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" checked>
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                            peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full 
                            peer dark:bg-gray-700 peer-checked:after:translate-x-full 
                            peer-checked:after:border-white after:content-[''] after:absolute 
                            after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                            after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                            dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </section>

        <!-- Sécurité -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Sécurité</h2>
          <div class="space-y-4">
            <button class="w-full px-4 py-2 text-left bg-gray-100 dark:bg-gray-700 
                         text-gray-900 dark:text-white rounded-md hover:bg-gray-200 
                         dark:hover:bg-gray-600 transition-colors">
              Activer l'authentification à deux facteurs
            </button>
            <button class="w-full px-4 py-2 text-left bg-gray-100 dark:bg-gray-700 
                         text-gray-900 dark:text-white rounded-md hover:bg-gray-200 
                         dark:hover:bg-gray-600 transition-colors">
              Gérer les appareils connectés
            </button>
          </div>
        </section>

        <!-- Données -->
        <section>
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Données</h2>
          <div class="space-y-4">
            <button class="w-full px-4 py-2 text-left bg-gray-100 dark:bg-gray-700 
                         text-gray-900 dark:text-white rounded-md hover:bg-gray-200 
                         dark:hover:bg-gray-600 transition-colors">
              Exporter mes données
            </button>
            <button class="w-full px-4 py-2 text-left bg-red-100 dark:bg-red-900 
                         text-red-900 dark:text-red-100 rounded-md hover:bg-red-200 
                         dark:hover:bg-red-800 transition-colors">
              Supprimer mon compte
            </button>
          </div>
        </section>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class SettingsComponent {
  isDarkMode$ = this.themeService.isDarkMode$;

  constructor(
    private themeService: ThemeService,
    private notificationService: NotificationService
  ) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
} 