import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService  } from '../shared/tripApi.service';
import { ProductListComponent } from '../tripselector/tripselector.component';
import {StopLocation} from "../shared/trip.model";

@Component({
    selector: 'stop-location-search',
    standalone: true,
    imports: [FormsModule, ProductListComponent],
    template: `
        <div>
            <h2>Search Stops</h2>
            <div>
                <input
                        type="text"
                        [(ngModel)]="searchTerm"
                        (input)="onSearchInput()"
                        placeholder="Search for stops..."
                />
            </div>

            <div>
                @if (loading()) {
                    <div>Loading stops...</div>
                } @else if (stopLocations().length) {
                    <ul>
                        @for (stop of stopLocations(); track stop.id) {
                            <li (click)="selectCategory(stop)">{{ stop.name }}</li>
                        }
                    </ul>
                } @else if (hasSearched()) {
                    <div>No stops found</div>
                }
            </div>

            @if (selectedStopLocation()) {
                <trip-selector
                        [stopLocation]="selectedStopLocation()!"
                />
            }
        </div>
    `
})
export class StopLocationSearchComponent {
    private apiService = inject(ApiService);

    searchTerm = '';
    searchTimeout: any = null;
    stopLocations = signal<StopLocation[]>([]);
    loading = signal<boolean>(false);
    hasSearched = signal<boolean>(false);
    selectedStopLocation = signal<StopLocation | null>(null);

    onSearchInput(): void {
        // Clear any pending timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Set a new timeout to debounce the search
        this.searchTimeout = setTimeout(() => {
            this.searchStops();
        }, 300);
    }

    async searchStops(): Promise<void> {
        if (!this.searchTerm || this.searchTerm.length < 2) {
            this.stopLocations.set([]);
            this.hasSearched.set(false);
            return;
        }

        this.loading.set(true);
        this.hasSearched.set(true);

        try {
            const results = await this.apiService.searchStops(this.searchTerm);
            this.stopLocations.set(results);
        } catch (error) {
            console.error('Error searching stops:', error);
            this.stopLocations.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    selectCategory(stop: StopLocation): void {
        this.selectedStopLocation.set(stop);
    }
}