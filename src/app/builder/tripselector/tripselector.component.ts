import {Component, inject, input, signal, effect, computed, model} from '@angular/core';
import { ApiService } from '../shared/tripApi.service';
import { TripsEditorService } from '../shared/tripSelection.service';
import {Line, Stop, StopLocation, Trip} from "../shared/trip.model";
import {DateTime} from "luxon";
import {LuxonDateTimeFormat} from "../shared/luxon.pipe";
import {CdkAccordionModule} from '@angular/cdk/accordion';

@Component({
    selector: 'trip-selector',
    imports: [LuxonDateTimeFormat, CdkAccordionModule],
    template: `
        <div>
            <h2>Stops at {{ stopLocation().name }}</h2>

            @if (loading()) {
                <div>Loading stops...</div>
            } @else {
                <div>
                    @for (line of stops().keys(); track line.id) {
                        <cdk-accordion-item #accordionItem="cdkAccordionItem" class="example-accordion-item">
                            <button
                                    class="example-accordion-item-header"
                                    (click)="accordionItem.toggle()"
                                    tabindex="0"
                                    [attr.id]="'accordion-header-' + $index"
                                    [attr.aria-expanded]="accordionItem.expanded"
                                    [attr.aria-controls]="'accordion-body-' + $index"
                                > {{ line.name }} nach {{ line.destinationDesc }}
                            </button>
                            @if(accordionItem.expanded) {
                                <div
                                        class="example-accordion-item-body"
                                        role="region"
                                        [style.display]="accordionItem.expanded ? '' : 'none'"
                                        [attr.id]="'accordion-body-' + $index"
                                        [attr.aria-labelledby]="'accordion-header-' + $index"
                                >
                                @for (stop of stops().get(line); track $index) {
                                    <p> Nr. {{ stop.trip.tripCode }} um {{ stop.departureTime! | dateTimeFormat: 'HH:mm' }}
                                        nach {{ stop.trip.stops.at(-1)!.location.shortName }}
                                        <button (click)="addTripToEditor(stop)">Add to Plot</button>
                                    </p>
                                }
                                </div>
                            }
                        </cdk-accordion-item>
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
        const trip = stop.trip;
        let selectedStopsOfTrip: Set<number>

        const lineEquality = (x: Trip)=> {
            if (x.line.id !== trip.line.id) {
                return false;
            }

            if (x.stops.length !== trip.stops.length) {
                return false;
            }

            return [...Array(x.stops.length).keys()]
                .map((i: number): [Stop, Stop] => [x.stops[i], trip.stops[i]])
                .every(([a, b]) => a.location.id == b.location.id)
        }

        const tripsOfSameLine = this.editorService.items().filter(x => lineEquality(x.trip));
        if (tripsOfSameLine.length > 0) {
            selectedStopsOfTrip = tripsOfSameLine[0].selectedStopIndices;
        } else {
            selectedStopsOfTrip = new Set([...Array(trip.stops.length).keys()].filter(i => i >= stop.tripIndex));
        }
        this.editorService.addToTripsEditor(trip, selectedStopsOfTrip);
    }
}