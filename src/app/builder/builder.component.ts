import { Component, inject } from '@angular/core';
import { StopLocationSearchComponent } from './locationsearch/locationsearch.component';
import { TripsEditor } from './tripeditor/tripeditor.component';
import { TripsEditorService } from './shared/tripSelection.service';
import {TimetablePlotComponent} from "./plot/plot.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        StopLocationSearchComponent,
        TripsEditor,
        TimetablePlotComponent,
    ],
    template: `
  <main>
    <stop-location-search/>
    <trips-editor></trips-editor>
    <timetable-plot></timetable-plot>
  </main>
  `
})
export class BuilderComponent {
    
}