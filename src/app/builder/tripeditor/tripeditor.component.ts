import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TripsEditorService } from '../shared/tripSelection.service';
import { TripsEditorItem } from './tripseditoritem.component';

@Component({
    selector: 'trips-editor',
    imports: [TripsEditorItem],
    // standalone: true,
    template: `
        <div>
            <h2>Your Shopping Cart</h2>
            <div>
                @for (line of tripsEditorService.itemsGroupedByLine().keys(); track line.id) {
                    <h5>{{ line.name }}</h5>
                    <div>
                    @for (item of tripsEditorService.itemsGroupedByLine().get(line); track item.trip.uuid) {
                        <trips-editor-item [tripToPlot]="item" />
                    }
                    </div>
                }
            </div>
        </div>
    `
})
export class TripsEditor {
    tripsEditorService = inject(TripsEditorService);
}