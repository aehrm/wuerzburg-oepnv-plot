import { Component } from '@angular/core';
import {TripSelectorComponent} from "./tripselector/tripselector.component";

@Component({
    selector: 'app-builder',
    templateUrl: './builder.component.html',
    imports: [TripSelectorComponent]
})
export class BuilderComponent {
}

