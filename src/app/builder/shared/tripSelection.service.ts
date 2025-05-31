import {computed, Injectable, signal, Signal, WritableSignal} from '@angular/core';
import {Line, Trip} from "./trip.model";

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

    readonly itemsGroupedByLine: Signal<Map<Line, TripToPlot[]>> = computed(() => this.computeItemsGroupedByLine());

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

    private computeItemsGroupedByLine(): Map<Line, TripToPlot[]> {
        const items = this.items();

        const lineToTrips: Map<string, TripToPlot[]> = new Map();
        const idToLine = new Map<string, Line>();

        for (const item of items) {
            const lineID = item.trip.line.id;
            idToLine.set(lineID, item.trip.line);
            if (lineToTrips.has(lineID)) {
                lineToTrips.get(lineID)!.push(item);
            } else {
                lineToTrips.set(lineID, [item]);
            }
        }

        return new Map([...lineToTrips.entries()].map(x => [idToLine.get(x[0])!, x[1]]));
    }

    applyStops(selectedStops: number[], selectFn: (tripToPlot: TripToPlot) => boolean) {
        this.tripsToPlot.update(items => items.map(tripToPlot => {
            if (selectFn(tripToPlot)) {
                return {...tripToPlot, selectedStops: selectedStops};
            } else {
                return tripToPlot;
            }
        }))
    }
}