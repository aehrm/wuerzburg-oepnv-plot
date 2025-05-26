import { Component, inject } from '@angular/core';
import { CategorySearchComponent } from './locationsearch/locationsearch.component';
import { ShoppingCartComponent } from './tripeditor/tripeditor.component';
import { CartService } from './shared/tripSelection.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CategorySearchComponent,
        ShoppingCartComponent
    ],
    template: `
    <div>
      <header>
        <div>
          <h1>Product Store</h1>
          <div>
            🛒 <span>{{ cartItemsCount() }}</span>
          </div>
        </div>
      </header>
      
      <main>
        <div>
          <div>
            <app-category-search></app-category-search>
          </div>
          
          <div>
            <app-shopping-cart></app-shopping-cart>
          </div>
        </div>
      </main>
    </div>
  `
})
export class BuilderComponent {
    title = 'product-shopping-app';
    cartItemsCount = inject(CartService).totalItems;
}