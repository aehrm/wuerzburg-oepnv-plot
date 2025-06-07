import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new Error(msg);
    }
}

import {Trip, StopLocation, Line, Stop} from "./trip.model";
import {DateTime} from "luxon";

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(private http: HttpClient) {}

    async searchStops(searchTerm: string): Promise<StopLocation[]> {
        const baseUrl = 'https://bahnland-bayern.de/efa/XML_STOPFINDER_REQUEST';
        const params = new URLSearchParams({
            coordOutputFormat: 'WGS84[dd.ddddd]',
            commonMacro: 'stopfinder',
            trans_company: "wvv",
            outputFormat: 'rapidJSON',
            version: '10.6.14.22',
            type_sf: 'any',
            name_sf: searchTerm,
        });

        const url = `${baseUrl}?${params.toString()}`;
        const data = await lastValueFrom(this.http.get<any>(url, {responseType: 'json'}));

        const locations: StopLocation[] = data.locations.filter((location: any) => {
            return location.type === 'stop';
        }).map((location: any): StopLocation => {
            return {
                name: location.name,
                shortName: location.disassembledName,
                id: location.id,
            }
        })

        return locations;
    }

    async getStopsAtLocation(stopLocation: StopLocation, startDate: DateTime, endDate: DateTime): Promise<Stop[]> {
        const baseUrl = 'https://bahnland-bayern.de/efa/XML_DM_REQUEST';
        const params = new URLSearchParams({
            coordOutputFormat: 'WGS84[dd.ddddd]',
            deleteAssignedStops_dm: '1',
            depType: 'stopEvents',
            imparedOptionsActive: '1',
            inclMOT_1: 'true',
            inclMOT_2: 'true',
            inclMOT_3: 'true',
            inclMOT_4: 'true',
            inclMOT_5: 'true',
            inclMOT_6: 'true',
            inclMOT_7: 'true',
            inclMOT_8: 'true',
            inclMOT_9: 'true',
            inclMOT_10: 'true',
            inclMOT_11: 'true',
            inclMOT_13: 'true',
            inclMOT_14: 'true',
            inclMOT_15: 'true',
            inclMOT_16: 'true',
            inclMOT_17: 'true',
            includeCompleteStopSeq: '1',
            itOptionsActive: '1',
            itdDateDayMonthYear: startDate.toFormat("dd.MM.yyyy"),  // Added date parameter
            itdDateTimeDepArr: 'dep',
            itdTime: startDate.toFormat("HH:MM"),                   // Added time parameter
            limit: '2000',
            mode: 'direct',
            name_dm: stopLocation.id,
            outputFormat: 'rapidJSON',
            ptOptionsActive: '1',
            type_dm: 'any',
            useAllStops: '1',
            version: '10.6.14.22'
        });

        const url = `${baseUrl}?${params.toString()}`;
        const response = await fetch(url)
        const data = await response.json();

        const getStopLocation = function(stopLocationObj: any): StopLocation {
            if (stopLocationObj.type === "stop") {
                return { name: stopLocationObj.name, shortName: stopLocationObj.disassembledName, id: stopLocationObj.id }
            } else {
                return getStopLocation(stopLocationObj.parent)
            }
        }

        const toStop = function(loc: any, trip: Trip, tripIndex: number): Stop {
            const stopLocation: StopLocation = getStopLocation(loc);
            return {
                location: stopLocation,
                trip: trip,
                tripIndex: tripIndex,
                arrivalTime: loc.arrivalTimePlanned !== undefined ? DateTime.fromISO(loc.arrivalTimePlanned) : undefined,
                departureTime: loc.departureTimePlanned !== undefined ? DateTime.fromISO(loc.departureTimePlanned) : undefined,
            }
        }

        const stops: Stop[] = (<any[]>data.stopEvents).map((stopEvent: any) => {
            assert(getStopLocation(stopEvent.location).id === stopLocation.id);
            const line: Line = {id: stopEvent.transportation.id, name: stopEvent.transportation.name}
            const trip: Trip = new Trip({line: line, tripCode: stopEvent.transportation.properties.tripCode, description: stopEvent.transportation.description});
            const mainTripIndex: number = stopEvent.previousLocations?.length ?? 0;

            const mainStop: Stop = {
                departureTime: DateTime.fromISO(stopEvent.departureTimePlanned),
                arrivalTime: undefined,
                location: stopLocation, trip: trip, tripIndex: mainTripIndex
            }

            const previousLocations: any[] = (<any[]|undefined>stopEvent.previousLocations) ?? [];
            const onwardLocations: any[] = (<any[]|undefined>stopEvent.onwardLocations) ?? [];

            const previousStops: Stop[] = previousLocations.map((locObj, i) => toStop(locObj, trip, i)).sort((a, b) => a.departureTime!.toMillis() - b.departureTime!.toMillis())
            const onwardStops: Stop[] = onwardLocations.map((locObj, i) => toStop(locObj, trip, i + mainTripIndex + 1)).sort((a, b) => a.arrivalTime!.toMillis() - b.arrivalTime!.toMillis());
            trip.stops = [...previousStops, mainStop, ...onwardStops];

            return mainStop;
        }).filter(stop => (stop.departureTime ?? stop.arrivalTime)! <= endDate);

        return stops;
    }
}