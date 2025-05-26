import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, Category } from '../shared/tripApi.service';
import { ProductListComponent } from '../tripselector/tripselector.component';

@Component({
    selector: 'app-category-search',
    standalone: true,
    imports: [FormsModule, ProductListComponent],
    template: `
    <div>
      <h2>Search Categories</h2>
      <div>
        <input 
          type="text" 
          [(ngModel)]="searchTerm"
          (input)="onSearchInput()"
          placeholder="Search for categories..."
        />
      </div>
      
      <div>
        @if (loading()) {
          <div>Loading categories...</div>
        } @else if (categories().length) {
          <ul>
            @for (category of categories(); track category.id) {
              <li (click)="selectCategory(category)">{{ category.name }}</li>
            }
          </ul>
        } @else if (hasSearched()) {
          <div>No categories found</div>
        }
      </div>
      
      @if (selectedCategory()) {
        <app-product-list 
          [categoryId]="selectedCategory()!.id"
          [categoryName]="selectedCategory()!.name">
        </app-product-list>
      }
    </div>
  `
})
export class CategorySearchComponent {
    private apiService = inject(ApiService);

    searchTerm = '';
    searchTimeout: any = null;
    categories = signal<Category[]>([]);
    loading = signal<boolean>(false);
    hasSearched = signal<boolean>(false);
    selectedCategory = signal<Category | null>(null);

    onSearchInput(): void {
        // Clear any pending timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Set a new timeout to debounce the search
        this.searchTimeout = setTimeout(() => {
            this.searchCategories();
        }, 300);
    }

    async searchCategories(): Promise<void> {
        if (!this.searchTerm || this.searchTerm.length < 2) {
            this.categories.set([]);
            this.hasSearched.set(false);
            return;
        }

        this.loading.set(true);
        this.hasSearched.set(true);

        try {
            const results = await this.apiService.searchCategories(this.searchTerm);
            this.categories.set(results);
        } catch (error) {
            console.error('Error searching categories:', error);
            this.categories.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    selectCategory(category: Category): void {
        this.selectedCategory.set(category);
    }
}