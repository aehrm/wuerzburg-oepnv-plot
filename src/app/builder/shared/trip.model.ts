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

    constructor(
        public line: Line,
        public tripCode: string,
        public description: string,
        public stops: Stop[]) {
    }

    getDepartureTime(stopLocation: StopLocation): DateTime | undefined {
        return this.stops.find(stop => stop.location === stopLocation)?.departureTime;
    }

    get uuid(): string {
        return this.line.id + ":" + this.tripCode;
    }
}