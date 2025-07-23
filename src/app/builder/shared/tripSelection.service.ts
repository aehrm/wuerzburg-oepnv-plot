import {
  computed,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from "@angular/core";
import { Line, Trip, TripToPlot } from "./trip.model";

@Injectable({
  providedIn: "root",
})
export class TripsEditorService {
  static COLOR_PALETTE = [
    "#5778a4",
    "#e49444",
    "#d1615d",
    "#85b6b2",
    "#6a9f58",
    "#e7ca60",
    "#a87c9f",
    "#f1a2a9",
    "#967662",
    "#b8b0ac",
  ];

  private tripsToPlot: WritableSignal<TripToPlot[]> = signal([]);
  colorMapping: WritableSignal<Map<string, string>> = signal(new Map());

  readonly items: Signal<TripToPlot[]> = this.tripsToPlot.asReadonly();

  addToTripsEditor(trip: Trip, selectedStopIndices?: Set<number>): void {
    const currentItems = this.items();
    const existingItem = currentItems.find(
      (item) => item.trip.uuid === trip.uuid,
    );

    if (selectedStopIndices === undefined) {
      selectedStopIndices = new Set(Array(trip.stops.length).keys());
    }

    if (existingItem) {
      // TODO do something here!
      return;
    } else {
      this.tripsToPlot.update((items) => [
        ...items,
        new TripToPlot({
          trip: trip,
          selectedStopIndices: selectedStopIndices,
        }),
      ]);
    }
  }

  toggleStop(uuid: string, idx: number) {
    this.tripsToPlot.update((items) =>
      items.map((tripToPlot) => {
        if (tripToPlot.trip.uuid == uuid) {
          let newSelectedStops;
          if (tripToPlot.selectedStopIndices.has(idx)) {
            newSelectedStops = [...tripToPlot.selectedStopIndices].filter(
              (i) => i !== idx,
            );
          } else {
            newSelectedStops = [...tripToPlot.selectedStopIndices, idx];
          }
          return new TripToPlot({
            ...tripToPlot,
            selectedStopIndices: new Set(newSelectedStops),
          });
        } else {
          return tripToPlot;
        }
      }),
    );
  }

  copyStopsFuzzy(tgt: TripToPlot, src: TripToPlot) {
    const convertToLabels = (
      tripToPlot: TripToPlot,
    ): {
      name: string;
      index: number;
      selected: boolean;
    }[] => {
      const counter = new Map<string, number>();
      return tripToPlot.trip.stops.map((stop, i) => {
        const locationName = stop.location.name;
        const locationIndex = counter.get(locationName) ?? 0;

        counter.set(locationName, locationIndex + 1);
        return {
          name: locationName,
          index: locationIndex,
          selected: tripToPlot.selectedStopIndices.has(i),
        };
      });
    };

    const srcLabels = convertToLabels(src);
    const tgtLabels = convertToLabels(tgt);
    const newStopIndices = new Set<number>();
    for (const [index, tgtLabel] of tgtLabels.entries()) {
      const hasLabelInSrc = srcLabels.some(
        (x) =>
          x.name == tgtLabel.name && x.index == tgtLabel.index && x.selected,
      );
      if (hasLabelInSrc) {
        newStopIndices.add(index);
      }
    }

    this.tripsToPlot.update((items) =>
      items.map((tripToPlot) => {
        if (tripToPlot !== tgt) {
          return tripToPlot;
        } else {
          return new TripToPlot({
            ...tripToPlot,
            selectedStopIndices: newStopIndices,
          });
        }
      }),
    );
  }

  remove(toRemove: TripToPlot): void {
    this.tripsToPlot.update((items) =>
      items.filter((tripToPlot) => tripToPlot.trip.uuid !== toRemove.trip.uuid),
    );
  }

  getLineColor(line: Line): string {
    if (this.colorMapping().has(line.id)) {
      return this.colorMapping().get(line.id)!;
    } else {
      const usedColors = new Set(this.colorMapping().values());
      const freeColors = TripsEditorService.COLOR_PALETTE.filter(
        (x) => !usedColors.has(x),
      );
      let nextFreeColor: string;
      if (freeColors.length > 0) {
        nextFreeColor = freeColors[0];
      } else {
        nextFreeColor = "#000000";
      }

      this.colorMapping.update((map) =>
        new Map(map).set(line.id, nextFreeColor),
      );
      return nextFreeColor;
    }
  }

  setLineColor(line: Line, color: string): void {
    this.colorMapping.update((map) => new Map(map).set(line.id, color));
  }

  has(trip: Trip): boolean {
    return this.tripsToPlot().some((t) => t.trip.uuid == trip.uuid);
  }
}
