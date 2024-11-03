import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  spent?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: Category[] = [
    {
      id: 'shopping',
      name: 'Shopping',
      icon: 'fa-shopping-bag',
      color: 'text-purple-600',
      budget: 500,
      spent: 320
    },
    {
      id: 'transport',
      name: 'Transport',
      icon: 'fa-bus',
      color: 'text-blue-600',
      budget: 200,
      spent: 150
    },
    {
      id: 'entertainment',
      name: 'Divertissement',
      icon: 'fa-film',
      color: 'text-pink-600',
      budget: 300,
      spent: 275
    },
    {
      id: 'food',
      name: 'Alimentation',
      icon: 'fa-utensils',
      color: 'text-green-600',
      budget: 600,
      spent: 450
    },
    {
      id: 'bills',
      name: 'Factures',
      icon: 'fa-file-invoice',
      color: 'text-red-600',
      budget: 800,
      spent: 800
    }
  ];

  private categoriesSubject = new BehaviorSubject<Category[]>(this.categories);
  categories$ = this.categoriesSubject.asObservable();

  getCategory(id: string): Category | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  updateCategory(id: string, updates: Partial<Category>) {
    this.categories = this.categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    );
    this.categoriesSubject.next(this.categories);
  }

  addSpending(categoryId: string, amount: number) {
    const category = this.categories.find(cat => cat.id === categoryId);
    if (category) {
      category.spent = (category.spent || 0) + amount;
      this.categoriesSubject.next(this.categories);
    }
  }

  getBudgetStatus(categoryId: string): {percentage: number; status: 'success' | 'warning' | 'danger'} {
    const category = this.getCategory(categoryId);
    if (!category || !category.budget) {
      return { percentage: 0, status: 'success' };
    }

    const percentage = (category.spent || 0) / category.budget * 100;
    let status: 'success' | 'warning' | 'danger' = 'success';

    if (percentage >= 90) {
      status = 'danger';
    } else if (percentage >= 75) {
      status = 'warning';
    }

    return { percentage, status };
  }
} 