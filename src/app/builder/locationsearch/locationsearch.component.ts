import {Component, inject, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService  } from '../shared/tripApi.service';
import { TripSelectorComponent } from '../tripselector/tripselector.component';
import {StopLocation} from "../shared/trip.model";
import { DateTime } from "luxon";
import {SearchSelectComponent} from "../../shared/search-select.component";

@Component({
    selector: 'stop-location-search',
    standalone: true,
    imports: [FormsModule, TripSelectorComponent, SearchSelectComponent],
    template: `
            <h2>Abfahrten</h2>
            <div>
                <p>
                    Von <input type="time" [(ngModel)]="startTime" (input)="onUpdateDates()" />
                    bis <input type="time" [(ngModel)]="endTime" (change)="onUpdateDates()" />;
                    Tag <input type="date" [(ngModel)]="searchDay" (change)="onUpdateDates()" />
                </p>
                <div class="search-select-container">
                    <search-select placeholder="Suche nach Haltestelle..." [fetchOptions]="searchStops" (selectedChange)="onSelectChange($event)"></search-select>
                </div>
            </div>

            @if (selectedStopLocation()) {
                <trip-selector
                        [stopLocation]="selectedStopLocation()!"
                        [(startDate)]="startDate"
                        [(endDate)]="endDate"
                />
            }
    `
})
export class StopLocationSearchComponent {
    private apiService = inject(ApiService);

    searchDay = '';
    startTime = '08:00';
    endTime = '18:00';
    selectedStopLocation = signal<StopLocation | null>(null);

    startDate = signal<DateTime|undefined>(undefined);
    endDate = signal<DateTime|undefined>(undefined);

    constructor() {
        this.onUpdateDates();
        this.searchDay = DateTime.now().toFormat('yyyy-MM-dd');
        this.onUpdateDates();
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

    searchStops = async (query: string): Promise<[StopLocation, string][]> => {
        if (!query || query.length < 2) {
            return []
        }

        try {
            const results = await this.apiService.searchStops(query);
            return results.map(x => [x, x.name]);
        } catch (error) {
            console.error('Error searching stops:', error);
            throw error;
        }
    }

    onSelectChange(stop: StopLocation): void {
        this.selectedStopLocation.set(stop);
    }

}