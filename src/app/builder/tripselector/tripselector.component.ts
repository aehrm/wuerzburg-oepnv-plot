import { Component, inject, input, signal, effect } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ApiService, Product } from '../shared/tripApi.service';
import { CartService } from '../shared/tripSelection.service';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CurrencyPipe],
    template: `
    <div>
      <h2>Products in {{ categoryName() }}</h2>
      
      @if (loading()) {
        <div>Loading products...</div>
      } @else if (products().length) {
        <div>
          @for (product of products(); track product.id) {
            <div>
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
              <p>{{ product.price | currency }}</p>
              <button (click)="addToCart(product)">Add to Cart</button>
            </div>
          }
        </div>
      } @else {
        <div>No products found in this category</div>
      }
    </div>
  `
})
export class ProductListComponent {
    private apiService = inject(ApiService);
    private cartService = inject(CartService);

    categoryId = input.required<string>();
    categoryName = input.required<string>();

    products = signal<Product[]>([]);
    loading = signal<boolean>(false);

    constructor() {
        effect(() => {
            this.loadProducts();
        });
    }

    async loadProducts(): Promise<void> {
        this.loading.set(true);
        try {
            const products = await this.apiService.getProductsByCategory(this.categoryId());
            this.products.set(products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.products.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    addToCart(product: Product): void {
        this.cartService.addToCart(product);
    }
}