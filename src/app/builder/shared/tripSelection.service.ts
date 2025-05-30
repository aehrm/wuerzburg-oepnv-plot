import {Injectable, computed, signal, WritableSignal, Signal} from '@angular/core';
import {Trip} from "./trip.model";

export interface TripToPlot {
    trip: Trip;
    selectedStops: number[];
}

@Injectable({
    providedIn: 'root'
})
export class TripsEditorService {
    private tripsToPlot: WritableSignal<TripToPlot[]> = signal([]);

    readonly items: Signal<TripToPlot[]> = this.tripsToPlot.asReadonly();

    addToTripsEditor(trip: Trip, selectedStops?: number[]) {
        const currentItems = this.items();
        const existingItem = currentItems.find(item => item.trip.uuid === trip.uuid);

        if (selectedStops === undefined) {
            selectedStops = Array.from(Array(trip.stops.length).keys());
        }

        if (existingItem) {
            // TODO do something here!
            return;
        } else {
            this.tripsToPlot.update(items => [...items, {trip: trip, selectedStops: selectedStops}])
        }
    }

    toggleStop(uuid: string, idx: number) {
        this.tripsToPlot.update(items => items.map(tripToPlot => {
            if (tripToPlot.trip.uuid == uuid) {
                let newSelectedStops;
                if (tripToPlot.selectedStops.some(i => i == idx)) {
                    newSelectedStops = tripToPlot.selectedStops.filter(i => i !== idx);
                } else {
                    newSelectedStops = [...tripToPlot.selectedStops, idx];
                }
                return {...tripToPlot, selectedStops: newSelectedStops }
            } else {
                return tripToPlot;
            }
        }));
    }
}