import {Component, inject, input, model} from "@angular/core";
import {TripsEditorService, TripToPlot} from "../shared/tripSelection.service";
import {LuxonDateTimeFormat} from "../shared/luxon.pipe";

@Component({
    selector: 'trips-editor-item',
    imports: [LuxonDateTimeFormat],
    template: `
        <div>
            <p>{{ tripToPlot().trip.line.name }} Code {{ tripToPlot().trip.tripCode }}</p>
            <p><button (click)="applyStopsToAllTrips()" >Apply stops to all trips</button></p>
            <ul>
                @for (stop of tripToPlot().trip.stops; track $index) {
                    <li>{{ stop.location.shortName ?? stop.location.name }} {{ (stop.arrivalTime ?? stop.departureTime)! | dateTimeFormat: 'HH:mm'}}
                        <input type="checkbox" [checked]="stopSelected($index)" (change)="changeSelected($index)"/></li>
                }
            </ul>
        </div>
    `
})
export class TripsEditorItem {
    tripToPlot = input.required<TripToPlot>();
    tripsEditorService = inject(TripsEditorService);


    stopSelected(idx: number): boolean {
        return this.tripToPlot().selectedStops.some(i => idx === i);
    }

    changeSelected(idx: number) {
        this.tripsEditorService.toggleStop(this.tripToPlot().trip.uuid, idx);
    }

    applyStopsToAllTrips() {
        this.tripsEditorService.applyStops(this.tripToPlot().selectedStops,
            (tripToPlot: TripToPlot) => tripToPlot.trip.line.id === this.tripToPlot().trip.line.id);
    }
}
