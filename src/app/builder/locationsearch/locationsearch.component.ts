import {Component, inject, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService  } from '../shared/tripApi.service';
import { TripSelectorComponent } from '../tripselector/tripselector.component';
import {StopLocation} from "../shared/trip.model";
import { DateTime } from "luxon";

@Component({
    selector: 'stop-location-search',
    standalone: true,
    imports: [FormsModule, TripSelectorComponent],
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
                von <input type="time" [(ngModel)]="startTime" (input)="onUpdateDates()" />
                bis <input type="time" [(ngModel)]="endTime" (change)="onUpdateDates()" />;
                Tag <input type="date" [(ngModel)]="searchDay" (change)="onUpdateDates()" />
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
                        [(startDate)]="startDate"
                        [(endDate)]="endDate"
                />
            }
        </div>
    `
})
export class StopLocationSearchComponent {
    private apiService = inject(ApiService);

    searchTerm = '';
    searchTimeout: any = null;

    searchDay = ''; //signal('');
    startTime = '08:00';
    endTime = '18:00';
    stopLocations = signal<StopLocation[]>([]);
    loading = signal<boolean>(false);
    hasSearched = signal<boolean>(false);
    selectedStopLocation = signal<StopLocation | null>(null);

    startDate = signal<DateTime|undefined>(undefined);
    endDate = signal<DateTime|undefined>(undefined);

    constructor() {
        this.onUpdateDates();
        this.searchDay = DateTime.now().toFormat('yyyy-MM-dd');
    }

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

    onUpdateDates(): void {
        const newStartTime = DateTime.fromFormat(this.startTime, "HH:mm");
        const newStartDate = DateTime.fromISO(this.searchDay, {zone: "Europe/Berlin"}).set({
            hour: newStartTime.hour,
            minute: newStartTime.minute,
        })
        this.startDate.set(newStartDate)
        const newEndTime = DateTime.fromFormat(this.endTime, "HH:mm");
        const newEndDate = DateTime.fromISO(this.searchDay, {zone: "Europe/Berlin"}).set({
            hour: newEndTime.hour,
            minute: newEndTime.minute,
        })
        this.endDate.set(newEndDate)
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