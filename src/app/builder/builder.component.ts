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
    <div>
      <header>
        <div>
          <h1>Product Store</h1>
        </div>
      </header>
      
      <main>
        <div>
          <div>
            <stop-location-search/>
          </div>
          
          <div>
            <trips-editor></trips-editor>
          </div>
            
          <div>
              <timetable-plot></timetable-plot>
          </div>
        </div>
      </main>
    </div>
  `
})
export class BuilderComponent {
    title = 'product-shopping-app';
}