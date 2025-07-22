import {Component, computed, inject, input, model} from "@angular/core";
import {TripsEditorService} from "../shared/tripSelection.service";
import {LuxonDateTimeFormat} from "../shared/luxon.pipe";
import {TripToPlot} from "../shared/trip.model";
import {CdkAccordionItem} from "@angular/cdk/accordion";

@Component({
    selector: 'trips-editor-item',
    imports: [LuxonDateTimeFormat, CdkAccordionItem],
    template: `
        <cdk-accordion-item #accordionItem="cdkAccordionItem" class="example-accordion-item">
            <div class="trip-editor-item-head">
                <div class="trip-editor-item-label">
                    {{ tripToPlot().trip.line.name }} nach {{ tripToPlot().trip.line.destinationDesc }} ab {{ tripToPlot().trip.stops[0].departureTime! | dateTimeFormat: 'HH:mm' }}
                </div>
                <div class="trip-editor-item-control">
                    <button (click)="remove()">Delete</button>
                    
                    <button
                            (click)="accordionItem.toggle()"
                            tabindex="0"
                    >▶</button>
                </div>
            </div>
            @if (accordionItem.expanded) {
                <div class="trip-editor-item-content-container">
                    <ul>
                        @for (stop of tripToPlot().trip.stops; track $index) {
                            <li>
                                <input type="checkbox" [checked]="isStopSelected($index)"
                                       (change)="changeSelected($index)"/>
                                <span>{{ stop.location.shortName ?? stop.location.name }} {{ (stop.arrivalTime ?? stop.departureTime)! | dateTimeFormat: 'HH:mm' }}</span>
                            </li>
                        }
                    </ul>
                    <p>
                        <button (click)="applyStopsToAllTrips()">Apply stops to all trips</button>
                    </p>
                </div>
            }
        </cdk-accordion-item>
    `
})
export class TripsEditorItem {
    tripToPlot = input.required<TripToPlot>();
    tripsEditorService = inject(TripsEditorService);

    isStopSelected(idx: number): boolean {
        return this.tripToPlot().selectedStopIndices.has(idx);
    }

    changeSelected(idx: number) {
        this.tripsEditorService.toggleStop(this.tripToPlot().trip.uuid, idx);
    }

    applyStopsToAllTrips() {
        this.tripsEditorService.applyStops(this.tripToPlot().selectedStopIndices,
            (tripToPlot: TripToPlot) => tripToPlot.trip.line.id === this.tripToPlot().trip.line.id);
    }

    remove(): void {
        this.tripsEditorService.remove(this.tripToPlot())
    }
}
