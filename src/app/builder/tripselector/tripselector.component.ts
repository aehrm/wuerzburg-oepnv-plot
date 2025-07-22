import {
    Component,
    inject,
    input,
    signal,
    effect,
    computed,
    model,
    Signal,
    contentChild,
    viewChild
} from '@angular/core';
import { ApiService } from '../shared/tripApi.service';
import { TripsEditorService } from '../shared/tripSelection.service';
import {Line, Stop, StopLocation, Trip} from "../shared/trip.model";
import {DateTime} from "luxon";
import {LuxonDateTimeFormat} from "../shared/luxon.pipe";
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {GroupedTableComponent, TableGroup, TableItem} from "../shared/groupedtable.component";

class TableStop implements TableItem {

    stop: Stop;
    disabled: boolean;

    constructor(stop: Stop, disabled: boolean) {
        this.stop = stop;
        this.disabled = disabled;
    }

    get id(): string {
        return this.stop.trip.uuid;
    }

}

@Component({
    selector: 'trip-selector',
    imports: [LuxonDateTimeFormat, CdkAccordionModule, GroupedTableComponent],
    template: `
            <h2>Stops at {{ stopLocation().name }}</h2>

            @if (loading()) {
                <div>Loading stops...</div>
            } @else {
                <app-grouped-table #groupedTable [groups]="tableGroups()" >
                    <ng-template #headerTemplate>
                        <div class="table-header">
                            <div class="header-row">
                                <div class="checkbox-column">
                                    <input
                                            type="checkbox"
                                            [checked]="groupedTable.headerCheckboxState().checked"
                                            [indeterminate]="groupedTable.headerCheckboxState().indeterminate"
                                            (change)="groupedTable.toggleSelectAll($event)"
                                            class="header-checkbox"
                                    >
                                </div>
                                <div class="actions-column">
                                  <button (click)="addSelectedTripsToEditor()">Add Selected to Plot</button>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                    
                    <ng-template #groupHeaderTemplate let-group>
                        {{ group.line.name }} nach {{ group.line.destinationDesc }}
                    </ng-template>

                    <ng-template #itemTemplate let-item>
                        <div class="trip-table-item-container">
                            <div class="trip-table-item-label">
                                {{ item.stop.departureTime! | dateTimeFormat: 'HH:mm' }}
                                nach {{ item.stop.trip.stops.at(-1)!.location.shortName ?? item.stop.trip.stops.at(-1)!.location.name }}
                            </div>
                            <div class="trip-table-item-actions">
                                <button (click)="addTripToEditor(item.stop)" [disabled]="item.disabled!">Add to Plot</button>
                            </div>
                        </div>
                    </ng-template>
                </app-grouped-table>
            }
    `
})
export class TripSelectorComponent {
    private apiService = inject(ApiService);
    private editorService = inject(TripsEditorService);

    stopLocation = input.required<StopLocation>();

    stops = signal<Map<Line, Stop[]>>(new Map());
    tableGroups  = computed(() => {
        return [...this.stops().entries()]
            .sort(([a, ignore1], [b, ignore2]) => {
                return (a.name + a.destinationDesc).localeCompare((b.name + b.destinationDesc));
            })
            .map(([line, stops]) => {
                const tableStops: TableStop[] = stops.map(s => {
                    const isAlreadyInEditor = this.editorService.has(s.trip);
                    return new TableStop(s, isAlreadyInEditor)
                });
                return {
                    id: line.id,
                    line: line,
                    items: tableStops
                }
            })
    })
    loading = signal<boolean>(false);
    startDate = model<DateTime>();
    endDate = model<DateTime>();

    groupedTable = viewChild.required(GroupedTableComponent<TableStop>);

    constructor() {
        effect(() => {
            this.loadStops();
        });
    }

    async loadStops(): Promise<void> {
        this.loading.set(true);
        try {
            if (this.startDate() === undefined || this.endDate() === undefined) {
                throw Error();
            }
            const stops = await this.apiService.getStopsAtLocation(this.stopLocation(), this.startDate()!, this.endDate()!);

            const idToLine: Map<string, Line> = new Map();
            const stopsGroupedByLine: Map<string, Stop[]> = new Map();
            for (const stop of stops) {
                const lineID = stop.trip.line.id;
                idToLine.set(lineID, stop.trip.line);
                if (stopsGroupedByLine.has(lineID)) {
                    stopsGroupedByLine.get(lineID)!.push(stop);
                } else {
                    stopsGroupedByLine.set(lineID, [stop]);
                }
            }

            this.stops.set(new Map([...stopsGroupedByLine.entries()].map(x => [idToLine.get(x[0])!, x[1]])));
        } catch (error) {
            console.error('Error loading products:', error);
            this.stops.set(new Map());
        } finally {
            this.loading.set(false);
        }
    }

    addTripToEditor(stop: Stop): void {
        const trip = stop.trip;
        let selectedStopsOfTrip: Set<number>

        const lineEquality = (x: Trip)=> {
            if (x.line.id !== trip.line.id) {
                return false;
            }

            if (x.stops.length !== trip.stops.length) {
                return false;
            }

            return [...Array(x.stops.length).keys()]
                .map((i: number): [Stop, Stop] => [x.stops[i], trip.stops[i]])
                .every(([a, b]) => a.location.id == b.location.id)
        }

        const tripsOfSameLine = this.editorService.items().filter(x => lineEquality(x.trip));
        if (tripsOfSameLine.length > 0) {
            selectedStopsOfTrip = tripsOfSameLine[0].selectedStopIndices;
        } else {
            selectedStopsOfTrip = new Set([...Array(trip.stops.length).keys()].filter(i => i >= stop.tripIndex));
        }
        this.editorService.addToTripsEditor(trip, selectedStopsOfTrip);
    }

    addSelectedTripsToEditor(): void {
        const selectedTrips = this.groupedTable().selectedItems();

        for (const item of selectedTrips) {
            this.addTripToEditor(item.stop);
        }
    }
}