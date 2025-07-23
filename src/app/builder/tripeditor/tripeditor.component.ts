import { Component, computed, inject, viewChild } from "@angular/core";
import { TripsEditorService } from "../shared/tripSelection.service";
import { TripsEditorItem } from "./tripseditoritem.component";
import { CdkAccordionModule } from "@angular/cdk/accordion";
import {
  GroupedTableComponent,
  TableItem,
} from "../../shared/groupedtable.component";
import { Line, TripToPlot } from "../shared/trip.model";
import { LuxonDateTimeFormat } from "../shared/luxon.pipe";

class TableTrip implements TableItem {
  tripToPlot: TripToPlot;

  constructor(tripToPlot: TripToPlot) {
    this.tripToPlot = tripToPlot;
  }

  get id(): string {
    return this.tripToPlot.trip.uuid;
  }
}

@Component({
  selector: "trips-editor",
  imports: [
    TripsEditorItem,
    CdkAccordionModule,
    GroupedTableComponent,
    LuxonDateTimeFormat,
  ],
  template: `
    <h2>Fahrten im Plot</h2>
    <app-grouped-table #groupedTable [groups]="tableGroups()">
      <ng-template #headerTemplate>
        <div class="table-header">
          <div class="header-row">
            <div class="checkbox-column">
              <input
                type="checkbox"
                [checked]="groupedTable.headerCheckboxState().checked"
                [indeterminate]="
                  groupedTable.headerCheckboxState().indeterminate
                "
                (change)="groupedTable.toggleSelectAll($event)"
                class="header-checkbox"
              />
            </div>
            <div class="action-column">
              <button (click)="removeSelected()">🗑</button>
            </div>
          </div>
        </div>
      </ng-template>

      <ng-template #groupHeaderTemplate let-group>
        <div class="trip-editor-group-header-container">
          <div class="trip-editor-group-header-label">
            {{ group.line.name }} nach {{ group.line.destinationDesc }}
          </div>
          <div class="trip-editor-group-header-actions">
            <input
              type="color"
              [value]="lineColor(group.line)"
              (change)="updateLineColor(group.line, $event)"
            />
          </div>
        </div>
      </ng-template>

      <ng-template #itemTemplate let-tableItem>
        <trips-editor-item [tripToPlot]="tableItem.tripToPlot" />
      </ng-template>
    </app-grouped-table>
  `,
})
export class TripsEditor {
  tripsEditorService = inject(TripsEditorService);

  groupedTable = viewChild.required(GroupedTableComponent<TableTrip>);

  tableGroups = computed(() => {
    const tripsToPlot = this.tripsEditorService.items();
    const lineToTrips: Map<string, TripToPlot[]> = new Map();
    const idToLine = new Map<string, Line>();

    for (const item of tripsToPlot) {
      const lineID = item.trip.line.id;
      idToLine.set(lineID, item.trip.line);
      if (lineToTrips.has(lineID)) {
        lineToTrips.get(lineID)!.push(item);
      } else {
        lineToTrips.set(lineID, [item]);
      }
    }

    return [...lineToTrips.entries()].map(
      ([lineID, tripsOfLine]: [string, TripToPlot[]]) => {
        const line: Line = idToLine.get(lineID)!;
        const items: TableTrip[] = tripsOfLine.map((x) => new TableTrip(x));

        return {
          id: line.id,
          line: line,
          items: items,
        };
      },
    );
  });

  removeSelected(): void {
    const selectedItems = this.groupedTable().selectedItems();
    for (const item of selectedItems) {
      this.tripsEditorService.remove(item.tripToPlot);
    }
  }

  lineColor(line: Line): string {
    return this.tripsEditorService.getLineColor(line);
  }

  updateLineColor(line: Line, ev: Event) {
    const color = (ev.target as HTMLInputElement).value;
    this.tripsEditorService.setLineColor(line, color);
  }
}
