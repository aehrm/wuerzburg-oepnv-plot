import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Category {
    id: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(private http: HttpClient) {}

    // For demo purposes, using mock data
    private mockCategories: Category[] = [
        { id: 'electronics', name: 'Electronics' },
        { id: 'clothing', name: 'Clothing' },
        { id: 'books', name: 'Books' },
        { id: 'home', name: 'Home & Kitchen' },
        { id: 'beauty', name: 'Beauty & Personal Care' }
    ];

    private mockProducts: { [key: string]: Product[] } = {
        'electronics': [
            { id: 'e1', name: 'Smartphone', price: 699.99, description: 'Latest model with great camera', category: 'electronics' },
            { id: 'e2', name: 'Laptop', price: 1299.99, description: 'Powerful laptop for work and gaming', category: 'electronics' },
            { id: 'e3', name: 'Headphones', price: 199.99, description: 'Noise-cancelling wireless headphones', category: 'electronics' }
        ],
        'clothing': [
            { id: 'c1', name: 'T-shirt', price: 19.99, description: 'Cotton t-shirt in various colors', category: 'clothing' },
            { id: 'c2', name: 'Jeans', price: 49.99, description: 'Classic fit jeans', category: 'clothing' },
            { id: 'c3', name: 'Jacket', price: 89.99, description: 'Waterproof jacket for all seasons', category: 'clothing' }
        ],
        'books': [
            { id: 'b1', name: 'Fiction Novel', price: 12.99, description: 'Bestselling fiction novel', category: 'books' },
            { id: 'b2', name: 'Cookbook', price: 24.99, description: 'Recipes from around the world', category: 'books' },
            { id: 'b3', name: 'Self-help Book', price: 15.99, description: 'Guide to personal development', category: 'books' }
        ],
        'home': [
            { id: 'h1', name: 'Coffee Maker', price: 79.99, description: 'Programmable coffee maker', category: 'home' },
            { id: 'h2', name: 'Blender', price: 59.99, description: 'High-speed blender for smoothies', category: 'home' },
            { id: 'h3', name: 'Towel Set', price: 29.99, description: 'Luxury cotton towel set', category: 'home' }
        ],
        'beauty': [
            { id: 'be1', name: 'Facial Cleanser', price: 14.99, description: 'Gentle facial cleanser', category: 'beauty' },
            { id: 'be2', name: 'Moisturizer', price: 24.99, description: 'Hydrating facial moisturizer', category: 'beauty' },
            { id: 'be3', name: 'Shampoo', price: 9.99, description: 'Volumizing shampoo', category: 'beauty' }
        ]
    };

    // In a real app, these would make HTTP calls instead of returning mock data
    async searchCategories(searchTerm: string): Promise<Category[]> {
        // Filter categories based on search term
        return this.mockCategories.filter(
            category => category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Real API call would be:
        // return this.http.get<Category[]>(`/api/categories?search=${searchTerm}`).toPromise();
    }

    async getProductsByCategory(categoryId: string): Promise<Product[]> {
        // Get products for the selected category
        return this.mockProducts[categoryId] || [];

        // Real API call would be:
        // return this.http.get<Product[]>(`/api/products?category=${categoryId}`).toPromise();
    }
}