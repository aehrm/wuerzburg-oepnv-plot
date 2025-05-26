import {Component, input, InputSignal, output, OutputEmitterRef} from '@angular/core';
import { Trip } from '../shared/trip.model';

@Component({
    selector: 'trip-editor',
    templateUrl: './tripeditor.component.html',
})
export class TripEditorComponent {
    trip: InputSignal<Trip> = input.required();
    removeFn: OutputEmitterRef<void> = output<void>();

    remove() {
        this.removeFn.emit()
    }
}
