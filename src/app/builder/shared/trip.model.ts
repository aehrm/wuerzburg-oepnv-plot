import {DateTime} from "luxon";

export interface StopLocation {
    name: string;
    shortName: string;
    id: string;
}

export interface Stop {
    location: StopLocation;
    departureTime?: DateTime;
    arrivalTime?: DateTime;
    trip: Trip;
    tripIndex: number;
}

export interface Line {
    id: string;
    name: string;
}

export class Trip {

    line: Line;
    tripCode: string;
    description: string;
    stops: Stop[];

    constructor(params: { line: Line; tripCode: any; description: any; stops?: Stop[] }) {
        this.line = params.line;
        this.tripCode = params.tripCode;
        this.description = params.description;
        this.stops = params.stops ?? [];
    }

    get uuid(): string {
        return this.line.id + ":" + this.tripCode;
    }
}

export class TripToPlot {

    trip: Trip;
    selectedStopIndices: Set<number>

    constructor(params: {trip: Trip, selectedStopIndices: Set<number>}) {
        this.trip = params.trip;
        this.selectedStopIndices = params.selectedStopIndices;
    }

    get selectedStops(): Stop[] {
        return this.trip.stops.filter(stop => this.selectedStopIndices.has(stop.tripIndex));
    }

}
