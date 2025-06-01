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
                            [attr.id]="'accordion-header-' + $index"
                            [attr.aria-expanded]="accordionItem.expanded"
                            [attr.aria-controls]="'accordion-body-' + $index"
                    > {{ line.name }}
                    </button>
                    @if(accordionItem.expanded) {
                        <div
                                class="example-accordion-item-body"
                                role="region"
                                [style.display]="accordionItem.expanded ? '' : 'none'"
                                [attr.id]="'accordion-body-' + $index"
                                [attr.aria-labelledby]="'accordion-header-' + $index"
                        >
                            @for (item of tripsEditorService.itemsGroupedByLine().get(line); track item.trip.uuid) {
                                <cdk-accordion-item #accordionItem2="cdkAccordionItem" class="example-accordion-item">
                                    <button
                                            class="example-accordion-item-header"
                                            (click)="accordionItem2.toggle()"
                                            tabindex="0"
                                            [attr.id]="'accordion-header-' + $index"
                                            [attr.aria-expanded]="accordionItem2.expanded"
                                            [attr.aria-controls]="'accordion-body-' + $index"
                                    > {{ item.trip.line.name }} Code {{ item.trip.tripCode }}
                                    </button>
                                    @if(accordionItem2.expanded) {
                                        <div
                                                class="example-accordion-item-body"
                                                role="region"
                                                [style.display]="accordionItem2.expanded ? '' : 'none'"
                                                [attr.id]="'accordion-body-' + $index"
                                                [attr.aria-labelledby]="'accordion-header-' + $index"
                                        >
                                            <trips-editor-item [tripToPlot]="item" />
                                        </div>
                                    }
                                </cdk-accordion-item>
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