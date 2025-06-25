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
            <button
                    class="example-accordion-item-header"
                    (click)="accordionItem.toggle()"
                    tabindex="0"
            > {{ tripToPlot().trip.line.name }} Code {{ tripToPlot().trip.tripCode }}
            </button>
            <button (click)="remove()">Delete</button>
            @if (accordionItem.expanded) {
                <div
                        class="example-accordion-item-body"
                        role="region"
                        [style.display]="accordionItem.expanded ? '' : 'none'"
                >
                    <div>
                        <p>{{ tripToPlot().trip.line.name }} Code {{ tripToPlot().trip.tripCode }}</p>
                        <p>
                            <button (click)="applyStopsToAllTrips()">Apply stops to all trips</button>
                        </p>
                        <ul>
                            @for (stop of tripToPlot().trip.stops; track $index) {
                                <li>{{ stop.location.shortName ?? stop.location.name }} {{ (stop.arrivalTime ?? stop.departureTime)! | dateTimeFormat: 'HH:mm' }}
                                    <input type="checkbox" [checked]="isStopSelected($index)"
                                           (change)="changeSelected($index)"/>
                                </li>
                            }
                        </ul>
                    </div>
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
