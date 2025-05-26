import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../shared/tripSelection.service';

@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    imports: [CurrencyPipe],
    template: `
    <div>
      <h2>Your Shopping Cart</h2>
      
      @if (cartService.totalItems()) {
        <div>
          @for (item of cartService.items(); track item.product.id) {
            <div>
              <div>
                <h3>{{ item.product.name }}</h3>
                <p>{{ item.product.price | currency }} each</p>
              </div>
              
              <div>
                <button (click)="decreaseQuantity(item.product.id)">-</button>
                <span>{{ item.quantity }}</span>
                <button (click)="increaseQuantity(item.product.id, item.quantity)">+</button>
              </div>
              
              <div>
                <p>{{ item.product.price * item.quantity | currency }}</p>
                <button (click)="removeItem(item.product.id)">✕</button>
              </div>
            </div>
          }
          
          <div>
            <div>
              <span>Subtotal ({{ cartService.totalItems() }} items):</span>
              <span>{{ cartService.totalPrice() | currency }}</span>
            </div>
            <button>Proceed to Checkout</button>
            <button (click)="clearCart()">Clear Cart</button>
          </div>
        </div>
      } @else {
        <div>
          <p>Your cart is empty</p>
          <p>Start shopping to add items to your cart</p>
        </div>
      }
    </div>
  `
})
export class ShoppingCartComponent {
    cartService = inject(CartService);

    increaseQuantity(productId: string, currentQuantity: number): void {
        this.cartService.updateQuantity(productId, currentQuantity + 1);
    }

    decreaseQuantity(productId: string): void {
        const item = this.cartService.items().find(item => item.product.id === productId);
        if (item && item.quantity > 1) {
            this.cartService.updateQuantity(productId, item.quantity - 1);
        } else {
            this.cartService.removeFromCart(productId);
        }
    }

    removeItem(productId: string): void {
        this.cartService.removeFromCart(productId);
    }

    clearCart(): void {
        this.cartService.clearCart();
    }
}