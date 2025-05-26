export interface StopLocation {
    name: string;
    id: string;
}

export interface Stop {
    location: StopLocation;
    departureTime: Date;
    arrivalTime: Date;
}

export interface Line {
    id: string;
    name: string;
}

export interface Trip {
    uuid: string;
    line: Line;
    tripCode: string;
    stops: Stop[];
}