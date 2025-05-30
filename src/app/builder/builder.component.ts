import { Component, inject } from '@angular/core';
import { StopLocationSearchComponent } from './locationsearch/locationsearch.component';
import { TripsEditor } from './tripeditor/tripeditor.component';
import { TripsEditorService } from './shared/tripSelection.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        StopLocationSearchComponent,
        TripsEditor
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
        </div>
      </main>
    </div>
  `
})
export class BuilderComponent {
    title = 'product-shopping-app';
}