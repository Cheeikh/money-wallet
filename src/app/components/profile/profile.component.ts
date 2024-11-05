import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  template: `
    <div class="container mx-auto px-4 py-8 mt-16">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Mon Profil</h1>
        
        <div class="space-y-6" *ngIf="user">
          <!-- Photo de profil -->
          <div class="flex items-center space-x-4">
            <div class="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden">
              <img *ngIf="user.photoUrl" [src]="user.photoUrl" alt="Photo de profil" class="w-full h-full object-cover">
              <i *ngIf="!user.photoUrl" class="fas fa-user text-3xl text-white"></i>
            </div>
            <button class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
              Modifier la photo
            </button>
          </div>

          <!-- Informations personnelles -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ user.lastName || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ user.firstName || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ user.email || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ user.phone || '-' }}</p>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-end space-x-4 pt-4">
            <button (click)="onEditProfile()" 
                    class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
              Modifier le profil
            </button>
            <button (click)="onChangePassword()" 
                    class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Changer le mot de passe
            </button>
          </div>
        </div>

        <!-- Loading state -->
        <div *ngIf="!user" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.authService.currentUser$.subscribe({
      next: (user: User | null) => {
        this.user = user;
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement du profil:', error);
      }
    });
  }

  onEditProfile(): void {
    // À implémenter : logique pour modifier le profil
  }

  onChangePassword(): void {
    // À implémenter : logique pour changer le mot de passe
  }
} 