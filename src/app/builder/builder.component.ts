import { Component, inject } from '@angular/core';
import { StopLocationSearchComponent } from './locationsearch/locationsearch.component';
import { TripsEditor } from './tripeditor/tripeditor.component';
import { TripsEditorService } from './shared/tripSelection.service';
import {TimetablePlotComponent} from "./plot/plot.component";

@Component({
    selector: 'builder-component',
    standalone: true,
    imports: [
        StopLocationSearchComponent,
        TripsEditor,
        TimetablePlotComponent,
    ],
    template: `
        <stop-location-search/>
        <trips-editor></trips-editor>
        <timetable-plot></timetable-plot>
  `
})
export class BuilderComponent {

}