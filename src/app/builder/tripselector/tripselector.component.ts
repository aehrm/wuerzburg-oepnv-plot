import {Component, signal, WritableSignal} from '@angular/core';
import { Trip } from '../shared/trip.model';
import {TripEditorComponent} from "../tripeditor/tripeditor.component";

@Component({
    selector: 'trip-selector',
    templateUrl: './tripselector.component.html',
    imports: [TripEditorComponent]
})
export class TripSelectorComponent {
    trips: WritableSignal<Trip[]> = signal([]);

    constructor() {
        this.trips.set([
            {
                uuid: "123",
                line: { id: '123', name: 'Linie 10' },
                tripCode: 'bla',
                stops: []
            }
        ])
    }

    removeTrip(uuid: string) {
        this.trips.update(trips => trips.filter(t => t.uuid !== uuid))
    }
}
