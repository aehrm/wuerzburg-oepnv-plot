// src/app/services/cart.service.ts
import { Injectable, computed, signal } from '@angular/core';
import { Product } from './tripApi.service';

export interface CartItem {
    product: Product;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems = signal<CartItem[]>([]);

    readonly items = this.cartItems.asReadonly();

    readonly totalItems = computed(() => {
        return this.cartItems().reduce((total, item) => total + item.quantity, 0);
    });

    readonly totalPrice = computed(() => {
        return this.cartItems().reduce((total, item) =>
            total + (item.product.price * item.quantity), 0);
    });

    addToCart(product: Product): void {
        const currentItems = this.cartItems();
        const existingItem = currentItems.find(item => item.product.id === product.id);

        if (existingItem) {
            this.cartItems.update(items =>
                items.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            this.cartItems.update(items => [...items, { product, quantity: 1 }]);
        }
    }

    removeFromCart(productId: string): void {
        this.cartItems.update(items =>
            items.filter(item => item.product.id !== productId)
        );
    }

    updateQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        this.cartItems.update(items =>
            items.map(item =>
                item.product.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    }

    clearCart(): void {
        this.cartItems.set([]);
    }
}