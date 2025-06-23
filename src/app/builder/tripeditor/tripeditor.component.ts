import { Component, inject } from '@angular/core';
import { TripsEditorService } from '../shared/tripSelection.service';
import { TripsEditorItem } from './tripseditoritem.component';
import {CdkAccordionModule} from "@angular/cdk/accordion";

@Component({
    selector: 'trips-editor',
    imports: [TripsEditorItem, CdkAccordionModule],
    template: `
        <div>
            <h2>Selected Trips</h2>
            @for (line of tripsEditorService.itemsGroupedByLine().keys(); track line.id) {
                <cdk-accordion-item #accordionItem="cdkAccordionItem" class="example-accordion-item">
                    <button
                            class="example-accordion-item-header"
                            (click)="accordionItem.toggle()"
                            tabindex="0"
                            [id]="'accordion-header-' + $index"
                    > {{ line.name }}
                    </button>
                    @if(accordionItem.expanded) {
                        <div
                                class="example-accordion-item-body"
                                role="region"
                                [style.display]="accordionItem.expanded ? '' : 'none'"
                                [id]="'accordion-body-' + $index"
                        >
                            @for (item of tripsEditorService.itemsGroupedByLine().get(line); track item.trip.uuid) {
                                <trips-editor-item [tripToPlot]="item" />
                            }
                        </div>
                    }
                </cdk-accordion-item>
            }
        </div>
    `
})
export class TripsEditor {
    tripsEditorService = inject(TripsEditorService);
}