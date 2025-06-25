import {computed, Injectable, signal, Signal, WritableSignal} from '@angular/core';
import {Line, Trip, TripToPlot} from "./trip.model";

@Injectable({
    providedIn: 'root'
})
export class TripsEditorService {
    private tripsToPlot: WritableSignal<TripToPlot[]> = signal([]);

    readonly items: Signal<TripToPlot[]> = this.tripsToPlot.asReadonly();

    addToTripsEditor(trip: Trip, selectedStopIndices?: Set<number>): void {
        const currentItems = this.items();
        const existingItem = currentItems.find(item => item.trip.uuid === trip.uuid);

        if (selectedStopIndices === undefined) {
            selectedStopIndices = new Set(Array(trip.stops.length).keys());
        }

        if (existingItem) {
            // TODO do something here!
            return;
        } else {
            this.tripsToPlot.update(items => [...items, new TripToPlot({trip: trip, selectedStopIndices: selectedStopIndices})])
        }
    }

    toggleStop(uuid: string, idx: number) {
        this.tripsToPlot.update(items => items.map(tripToPlot => {
            if (tripToPlot.trip.uuid == uuid) {
                let newSelectedStops;
                if (tripToPlot.selectedStopIndices.has(idx)) {
                    newSelectedStops = [...tripToPlot.selectedStopIndices].filter(i => i !== idx);
                } else {
                    newSelectedStops = [...tripToPlot.selectedStopIndices, idx];
                }
                return new TripToPlot({...tripToPlot, selectedStopIndices: new Set(newSelectedStops) })
            } else {
                return tripToPlot;
            }
        }));
    }

    applyStops(selectedStopIndices: Set<number>, selectFn: (tripToPlot: TripToPlot) => boolean) {
        this.tripsToPlot.update(items => items.map(tripToPlot => {
            if (selectFn(tripToPlot)) {
                return new TripToPlot({...tripToPlot, selectedStopIndices: selectedStopIndices});
            } else {
                return tripToPlot;
            }
        }))
    }
}