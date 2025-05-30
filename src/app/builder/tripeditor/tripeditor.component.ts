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

            @if (tripsEditorService.items()) {
                <div>
                    @for (item of tripsEditorService.items(); track item.trip.uuid) {
                        <trips-editor-item [tripToPlot]="item" />
                    }
                </div>
            } @else {
                <div>
                    <p>Your cart is empty</p>
                    <p>Start shopping to add items to your cart</p>
                </div>
            }
        </div>
    `
})
export class TripsEditor {
    tripsEditorService = inject(TripsEditorService);
}