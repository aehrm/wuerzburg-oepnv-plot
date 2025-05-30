import { Component, inject, input, signal, effect } from '@angular/core';
import { ApiService } from '../shared/tripApi.service';
import { TripsEditorService } from '../shared/tripSelection.service';
import {Stop, StopLocation, Trip} from "../shared/trip.model";
import {DateTime} from "luxon";

@Component({
    selector: 'trip-selector',
    // standalone: true,
    template: `
        <div>
            <h2>Stops at {{ stopLocation().name }}</h2>

            @if (loading()) {
                <div>Loading stops...</div>
            } @else if (stops().length) {
                <div>
                    @for (stop of stops(); track [stop.trip.uuid, stop.tripIndex]) {
                        <div>
                            <p>{{ stop.trip.line.name }} (Code {{ stop.trip.tripCode }}) 
                                nach {{ stop.trip.stops.at(-1)!.location.name }}
                                (um {{ stop.departureTime }})</p>
                            <button (click)="addTripToEditor(stop)">Add to Plot</button>
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
    private editorService = inject(TripsEditorService);

    stopLocation = input.required<StopLocation>();

    stops = signal<Stop[]>([]);
    loading = signal<boolean>(false);
    searchDate = signal<DateTime>(DateTime.fromISO("2025-05-13T00:00:00+0200"))

    constructor() {
        effect(() => {
            this.loadStops();
        });
    }

    async loadStops(): Promise<void> {
        this.loading.set(true);
        try {
            const stops = await this.apiService.getStopsAtLocation(this.stopLocation(), this.searchDate());
            this.stops.set(stops);
        } catch (error) {
            console.error('Error loading products:', error);
            this.stops.set([]);
        } finally {
            this.loading.set(false);
        }
    }

    addTripToEditor(stop: Stop): void {
        const selectedStopsOfTrip = [...Array(stop.trip.stops.length).keys()].filter(i => i >= stop.tripIndex)
        this.editorService.addToTripsEditor(stop.trip, selectedStopsOfTrip);
    }
}