import {Component, inject, input, signal, effect, computed, model} from '@angular/core';
import { ApiService } from '../shared/tripApi.service';
import { TripsEditorService } from '../shared/tripSelection.service';
import {Line, Stop, StopLocation, Trip} from "../shared/trip.model";
import {DateTime} from "luxon";
import {LuxonDateTimeFormat} from "../shared/luxon.pipe";

@Component({
    selector: 'trip-selector',
    imports: [LuxonDateTimeFormat],
    template: `
        <div>
            <h2>Stops at {{ stopLocation().name }}</h2>

            @if (loading()) {
                <div>Loading stops...</div>
            } @else {
                <div>
                    <span>{{ startDate() }}</span>
                    @for (line of stops().keys(); track line.id) {
                        <h3>{{ line.name }}</h3>
                        @for (stop of stops().get(line); track $index) {
                            <div>
                                <p> Nr. {{ stop.trip.tripCode }} um {{ stop.departureTime! | dateTimeFormat: 'HH:mm' }}
                                    nach {{ stop.trip.stops.at(-1)!.location.name }}
                                    <button (click)="addTripToEditor(stop)">Add to Plot</button>
                                </p>
                            </div>
                        }
                    }
                </div>
            }
        </div>
    `
})
export class TripSelectorComponent {
    private apiService = inject(ApiService);
    private editorService = inject(TripsEditorService);

    stopLocation = input.required<StopLocation>();

    stops = signal<Map<Line, Stop[]>>(new Map());
    loading = signal<boolean>(false);
    startDate = model<DateTime>();
    endDate = model<DateTime>();

    constructor() {
        effect(() => {
            this.loadStops();
        });
    }

    async loadStops(): Promise<void> {
        this.loading.set(true);
        try {
            if (this.startDate() === undefined || this.endDate() === undefined) {
                throw Error();
            }
            const stops = await this.apiService.getStopsAtLocation(this.stopLocation(), this.startDate()!, this.endDate()!);

            const idToLine: Map<string, Line> = new Map();
            const stopsGroupedByLine: Map<string, Stop[]> = new Map();
            for (const stop of stops) {
                const lineID = stop.trip.line.id;
                idToLine.set(lineID, stop.trip.line);
                if (stopsGroupedByLine.has(lineID)) {
                    stopsGroupedByLine.get(lineID)!.push(stop);
                } else {
                    stopsGroupedByLine.set(lineID, [stop]);
                }
            }

            this.stops.set(new Map([...stopsGroupedByLine.entries()].map(x => [idToLine.get(x[0])!, x[1]])));
        } catch (error) {
            console.error('Error loading products:', error);
            this.stops.set(new Map());
        } finally {
            this.loading.set(false);
        }
    }

    addTripToEditor(stop: Stop): void {
        const selectedStopsOfTrip = [...Array(stop.trip.stops.length).keys()].filter(i => i >= stop.tripIndex)
        this.editorService.addToTripsEditor(stop.trip, selectedStopsOfTrip);
    }
}