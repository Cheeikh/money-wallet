import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
      <div class="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-10"></div>
      <div class="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <!-- Logo -->
        <div class="w-full max-w-md text-center mb-8">
          <img src="/assets/logo-white.png" alt="Logo" class="h-12 mx-auto mb-4">
          <h1 class="text-white text-2xl font-bold">MoneyWallet</h1>
          <p class="text-indigo-200">Gérez votre argent en toute simplicité</p>
        </div>
        
        <!-- Contenu -->
        <div class="w-full max-w-md">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {} 