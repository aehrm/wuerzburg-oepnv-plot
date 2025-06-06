import {Component, effect, ElementRef, inject, OnInit} from "@angular/core";
import {TripsEditorService} from "../shared/tripSelection.service";
import * as d3 from 'd3';
import {Line, ScaleLinear, ScaleTime} from "d3";
import {DateTime} from "luxon";

@Component({
    selector: 'timetable-plot',
    template: `
        <div class="chart"></div>
    `
})
export class TimetablePlotComponent implements OnInit {

    tripsEditorService = inject(TripsEditorService);
    elementRef = inject(ElementRef);
    plotSvg: d3.Selection<any, unknown, any, unknown> = d3.select('.chart');

    constructor() {
        effect(() => {
            // track data from service!
            const data = this.tripsEditorService.items();

            this.updatePlot();
        });
    }

    ngOnInit() {
        this.plotSvg = d3.select(this.elementRef.nativeElement).select('.chart')
            .append('svg')
            .attr('width', 400)
            .attr('height', 800);

        this.plotSvg.append('text').text('hello').attr('y', 20);
            // .attr('cx', 200)
            // .attr('cy', 100)
            // .attr('r', 50)
            // .style('fill', 'red');

        this.updatePlot();
    }

    updatePlot() {
        const width = 400; const height = 800;
        const margin = {left: 50, right: 10, top: 100, bottom: 100}

        const allStopIds: Set<number> = new Set(this.simpleDebugData.flatMap(trip => trip.map(stop => stop.stop)))
        const stopPos: Map<number, number> = new Map();
        for (const [idx, stop] of Array.from(allStopIds.values()).entries()) {
            stopPos.set(stop, idx);
        }

        const toMinutes = (timeStr: string) => {
            const dateObj = DateTime.fromFormat(timeStr, "HH:mm");
            const startOfDay = dateObj.startOf('day');
            const diff = dateObj.diff(startOfDay);
            return new Date(diff.toMillis());
        }

        const allStops = this.simpleDebugData.flat()

        const x: ScaleLinear<number, number> = d3.scaleLinear()
            .domain(<[number, number]>d3.extent(allStops, (d: any): number => stopPos.get(d.stop)!))
            .range([margin.left, width - margin.right])

        const y: ScaleTime<number, number> = d3.scaleUtc()
            .domain([toMinutes('09:50'), toMinutes('10:30')])
            .range([margin.top, height - margin.bottom])

        const line: Line<any> = d3.line()
            .x((d: any): number => x(stopPos.get(<number>d.stop)!))
            .y((d: any): number => y(toMinutes(d.time)))

        const trips = this.plotSvg.append('g')
            .selectAll('g')
            .data(this.simpleDebugData)
            .join('g').attr('stroke-width', 1.5)

        trips.append('path')
            .attr('d', trip => line(trip))
            .attr('fill', 'none')
            .attr('stroke', 'black')

        this.plotSvg.append('g').attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(d3.utcMinute.every(15)))
            .call(g => g.selectAll(".tick line").clone().lower()
                .attr("stroke-opacity", 0.2)
                .attr("x2", width))
            .call(g => g.selectAll(".tick text")
                .style("font", "10px sans-serif"))

        this.plotSvg.append('g')
            .style("font", "10px sans-serif")
            .selectAll("g")
            .data(allStopIds)
            .join("g")
            .attr("transform", d => `translate(${x(stopPos.get(d)!)},0)`)
            .call(g => g.append("line")
                .attr("y1", margin.top - 6)
                .attr("y2", margin.top)
                .attr("stroke", "currentColor"))
            .call(g => g.append("line")
                .attr("y1", height - margin.bottom + 6)
                .attr("y2", height - margin.bottom)
                .attr("stroke", "currentColor"))
            .call(g => g.append("line")
                .attr("y1", margin.top)
                .attr("y2", height - margin.bottom)
                .attr("stroke-opacity", 0.2)
                .attr("stroke-dasharray", "1.5,2")
                .attr("stroke", "currentColor"))
            .call(g => g.append("text")
                .attr("transform", `translate(0,${margin.top}) rotate(-90)`)
                .attr("x", 12)
                .attr("dy", "0.35em")
                .text(d => `Stop ID ${d}`))
            .call(g => g.append("text")
                .attr("text-anchor", "end")
                .attr("transform", `translate(0,${height - margin.top}) rotate(-90)`)
                .attr("x", -12)
                .attr("dy", "0.35em")
                .text(d => `Stop ID ${d}`))

        return;

    }

    simpleDebugData = [
        [
            {"stop": 1, "time": "10:00"},
            {"stop": 2, "time": "10:01"},
            {"stop": 3, "time": "10:02"},
        ],
        [
            {"stop": 1, "time": "10:10"},
            {"stop": 2, "time": "10:11"},
            {"stop": 3, "time": "10:12"},
        ],
        [
            {"stop": 3, "time": "10:03"},
            {"stop": 2, "time": "10:05"},
            {"stop": 4, "time": "10:06"},
        ],
    ]

    debugData = [
        {
            "trip": {
                "line": {
                    "id": "wvv:01004:e:H:25a",
                    "name": "Straßenbahn 4"
                },
                "tripCode": 146,
                "description": "Sanderau - (HBF) - Zellerau",
                "stops": [
                    {
                        "location": {
                            "name": "Würzburg Königsberger Straße",
                            "shortName": "Königsberger Straße",
                            "id": "de:09663:230"
                        },
                        "trip": null,
                        "tripIndex": 0,
                        "departureTime": "2025-05-13T12:21:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Fechenbachstraße",
                            "shortName": "Fechenbachstraße",
                            "id": "de:09663:139"
                        },
                        "trip": null,
                        "tripIndex": 1,
                        "arrivalTime": "2025-05-13T12:21:42.000+02:00",
                        "departureTime": "2025-05-13T12:22:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Arndtstraße",
                            "shortName": "Arndtstraße",
                            "id": "de:09663:42"
                        },
                        "trip": null,
                        "tripIndex": 2,
                        "arrivalTime": "2025-05-13T12:22:42.000+02:00",
                        "departureTime": "2025-05-13T12:23:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Ehehaltenhaus",
                            "shortName": "Ehehaltenhaus",
                            "id": "de:09663:121"
                        },
                        "trip": null,
                        "tripIndex": 3,
                        "arrivalTime": "2025-05-13T12:23:42.000+02:00",
                        "departureTime": "2025-05-13T12:24:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Eichendorffstraße",
                            "shortName": "Eichendorffstraße",
                            "id": "de:09663:124"
                        },
                        "trip": null,
                        "tripIndex": 4,
                        "arrivalTime": "2025-05-13T12:24:42.000+02:00",
                        "departureTime": "2025-05-13T12:25:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Sanderring",
                            "shortName": "Sanderring",
                            "id": "de:09663:348"
                        },
                        "trip": null,
                        "tripIndex": 5,
                        "arrivalTime": "2025-05-13T12:26:42.000+02:00",
                        "departureTime": "2025-05-13T12:27:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Neubaustraße",
                            "shortName": "Neubaustraße",
                            "id": "de:09663:271"
                        },
                        "trip": null,
                        "tripIndex": 6,
                        "arrivalTime": "2025-05-13T12:28:42.000+02:00",
                        "departureTime": "2025-05-13T12:29:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Rathaus",
                            "shortName": "Rathaus",
                            "id": "de:09663:315"
                        },
                        "trip": null,
                        "tripIndex": 7,
                        "arrivalTime": "2025-05-13T12:30:12.000+02:00",
                        "departureTime": "2025-05-13T12:30:30.000+02:00"
                    },
                    {
                        "departureTime": "2025-05-13T12:32:00.000+02:00",
                        "location": {
                            "name": "Würzburg, Dom",
                            "shortName": "Dom",
                            "id": "de:09663:106"
                        },
                        "trip": null,
                        "tripIndex": 8
                    },
                    {
                        "location": {
                            "name": "Würzburg Juliuspromenade",
                            "shortName": "Juliuspromenade",
                            "id": "de:09663:208"
                        },
                        "trip": null,
                        "tripIndex": 9,
                        "arrivalTime": "2025-05-13T12:33:42.000+02:00",
                        "departureTime": "2025-05-13T12:34:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg, Hauptbahnhof West",
                            "shortName": "Hauptbahnhof West",
                            "id": "de:09663:179"
                        },
                        "trip": null,
                        "tripIndex": 10,
                        "arrivalTime": "2025-05-13T12:36:42.000+02:00",
                        "departureTime": "2025-05-13T12:37:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Juliuspromenade",
                            "shortName": "Juliuspromenade",
                            "id": "de:09663:208"
                        },
                        "trip": null,
                        "tripIndex": 11,
                        "arrivalTime": "2025-05-13T12:38:42.000+02:00",
                        "departureTime": "2025-05-13T12:40:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Ulmer Hof",
                            "shortName": "Ulmer Hof",
                            "id": "de:09663:431"
                        },
                        "trip": null,
                        "tripIndex": 12,
                        "arrivalTime": "2025-05-13T12:40:42.000+02:00",
                        "departureTime": "2025-05-13T12:41:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Congress-Centrum",
                            "shortName": "Congress-Centrum",
                            "id": "de:09663:96"
                        },
                        "trip": null,
                        "tripIndex": 13,
                        "arrivalTime": "2025-05-13T12:42:42.000+02:00",
                        "departureTime": "2025-05-13T12:43:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Talavera",
                            "shortName": "Talavera",
                            "id": "de:09663:415"
                        },
                        "trip": null,
                        "tripIndex": 14,
                        "arrivalTime": "2025-05-13T12:44:12.000+02:00",
                        "departureTime": "2025-05-13T12:45:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Nautiland",
                            "shortName": "Nautiland",
                            "id": "de:09663:276"
                        },
                        "trip": null,
                        "tripIndex": 15,
                        "arrivalTime": "2025-05-13T12:45:42.000+02:00",
                        "departureTime": "2025-05-13T12:46:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Wörthstraße",
                            "shortName": "Wörthstraße",
                            "id": "de:09663:457"
                        },
                        "trip": null,
                        "tripIndex": 16,
                        "arrivalTime": "2025-05-13T12:47:12.000+02:00",
                        "departureTime": "2025-05-13T12:47:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Hartmannstraße",
                            "shortName": "Hartmannstraße",
                            "id": "de:09663:174"
                        },
                        "trip": null,
                        "tripIndex": 17,
                        "arrivalTime": "2025-05-13T12:48:12.000+02:00",
                        "departureTime": "2025-05-13T12:48:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg DJK-Sportzentrum",
                            "shortName": "DJK-Sportzentrum",
                            "id": "de:09663:263"
                        },
                        "trip": null,
                        "tripIndex": 18,
                        "arrivalTime": "2025-05-13T12:49:42.000+02:00",
                        "departureTime": "2025-05-13T12:50:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Sieboldmuseum",
                            "shortName": "Sieboldmuseum",
                            "id": "de:09663:74"
                        },
                        "trip": null,
                        "tripIndex": 19,
                        "arrivalTime": "2025-05-13T12:51:12.000+02:00",
                        "departureTime": "2025-05-13T12:51:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Bürgerbräu",
                            "shortName": "Bürgerbräu",
                            "id": "de:09663:256"
                        },
                        "trip": null,
                        "tripIndex": 20,
                        "arrivalTime": "2025-05-13T12:54:00.000+02:00"
                    }
                ]
            },
            "selectedStops": [
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20
            ]
        },
        {
            "trip": {
                "line": {
                    "id": "wvv:01004:e:H:25a",
                    "name": "Straßenbahn 4"
                },
                "tripCode": 57,
                "description": "Sanderau - (HBF) - Zellerau",
                "stops": [
                    {
                        "location": {
                            "name": "Würzburg Königsberger Straße",
                            "shortName": "Königsberger Straße",
                            "id": "de:09663:230"
                        },
                        "trip": null,
                        "tripIndex": 0,
                        "departureTime": "2025-05-13T13:11:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Fechenbachstraße",
                            "shortName": "Fechenbachstraße",
                            "id": "de:09663:139"
                        },
                        "trip": null,
                        "tripIndex": 1,
                        "arrivalTime": "2025-05-13T13:11:42.000+02:00",
                        "departureTime": "2025-05-13T13:12:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Arndtstraße",
                            "shortName": "Arndtstraße",
                            "id": "de:09663:42"
                        },
                        "trip": null,
                        "tripIndex": 2,
                        "arrivalTime": "2025-05-13T13:12:42.000+02:00",
                        "departureTime": "2025-05-13T13:13:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Ehehaltenhaus",
                            "shortName": "Ehehaltenhaus",
                            "id": "de:09663:121"
                        },
                        "trip": null,
                        "tripIndex": 3,
                        "arrivalTime": "2025-05-13T13:13:42.000+02:00",
                        "departureTime": "2025-05-13T13:14:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Eichendorffstraße",
                            "shortName": "Eichendorffstraße",
                            "id": "de:09663:124"
                        },
                        "trip": null,
                        "tripIndex": 4,
                        "arrivalTime": "2025-05-13T13:14:42.000+02:00",
                        "departureTime": "2025-05-13T13:15:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Sanderring",
                            "shortName": "Sanderring",
                            "id": "de:09663:348"
                        },
                        "trip": null,
                        "tripIndex": 5,
                        "arrivalTime": "2025-05-13T13:16:42.000+02:00",
                        "departureTime": "2025-05-13T13:17:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Neubaustraße",
                            "shortName": "Neubaustraße",
                            "id": "de:09663:271"
                        },
                        "trip": null,
                        "tripIndex": 6,
                        "arrivalTime": "2025-05-13T13:18:42.000+02:00",
                        "departureTime": "2025-05-13T13:19:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Rathaus",
                            "shortName": "Rathaus",
                            "id": "de:09663:315"
                        },
                        "trip": null,
                        "tripIndex": 7,
                        "arrivalTime": "2025-05-13T13:20:12.000+02:00",
                        "departureTime": "2025-05-13T13:20:30.000+02:00"
                    },
                    {
                        "departureTime": "2025-05-13T13:22:00.000+02:00",
                        "location": {
                            "name": "Würzburg, Dom",
                            "shortName": "Dom",
                            "id": "de:09663:106"
                        },
                        "trip": null,
                        "tripIndex": 8
                    },
                    {
                        "location": {
                            "name": "Würzburg Juliuspromenade",
                            "shortName": "Juliuspromenade",
                            "id": "de:09663:208"
                        },
                        "trip": null,
                        "tripIndex": 9,
                        "arrivalTime": "2025-05-13T13:23:42.000+02:00",
                        "departureTime": "2025-05-13T13:24:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg, Hauptbahnhof West",
                            "shortName": "Hauptbahnhof West",
                            "id": "de:09663:179"
                        },
                        "trip": null,
                        "tripIndex": 10,
                        "arrivalTime": "2025-05-13T13:26:42.000+02:00",
                        "departureTime": "2025-05-13T13:27:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Juliuspromenade",
                            "shortName": "Juliuspromenade",
                            "id": "de:09663:208"
                        },
                        "trip": null,
                        "tripIndex": 11,
                        "arrivalTime": "2025-05-13T13:28:42.000+02:00",
                        "departureTime": "2025-05-13T13:30:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Ulmer Hof",
                            "shortName": "Ulmer Hof",
                            "id": "de:09663:431"
                        },
                        "trip": null,
                        "tripIndex": 12,
                        "arrivalTime": "2025-05-13T13:30:42.000+02:00",
                        "departureTime": "2025-05-13T13:31:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Congress-Centrum",
                            "shortName": "Congress-Centrum",
                            "id": "de:09663:96"
                        },
                        "trip": null,
                        "tripIndex": 13,
                        "arrivalTime": "2025-05-13T13:32:12.000+02:00",
                        "departureTime": "2025-05-13T13:32:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Talavera",
                            "shortName": "Talavera",
                            "id": "de:09663:415"
                        },
                        "trip": null,
                        "tripIndex": 14,
                        "arrivalTime": "2025-05-13T13:33:42.000+02:00",
                        "departureTime": "2025-05-13T13:34:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Nautiland",
                            "shortName": "Nautiland",
                            "id": "de:09663:276"
                        },
                        "trip": null,
                        "tripIndex": 15,
                        "arrivalTime": "2025-05-13T13:34:42.000+02:00",
                        "departureTime": "2025-05-13T13:35:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Wörthstraße",
                            "shortName": "Wörthstraße",
                            "id": "de:09663:457"
                        },
                        "trip": null,
                        "tripIndex": 16,
                        "arrivalTime": "2025-05-13T13:36:12.000+02:00",
                        "departureTime": "2025-05-13T13:36:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Hartmannstraße",
                            "shortName": "Hartmannstraße",
                            "id": "de:09663:174"
                        },
                        "trip": null,
                        "tripIndex": 17,
                        "arrivalTime": "2025-05-13T13:37:12.000+02:00",
                        "departureTime": "2025-05-13T13:37:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg DJK-Sportzentrum",
                            "shortName": "DJK-Sportzentrum",
                            "id": "de:09663:263"
                        },
                        "trip": null,
                        "tripIndex": 18,
                        "arrivalTime": "2025-05-13T13:38:42.000+02:00",
                        "departureTime": "2025-05-13T13:39:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Sieboldmuseum",
                            "shortName": "Sieboldmuseum",
                            "id": "de:09663:74"
                        },
                        "trip": null,
                        "tripIndex": 19,
                        "arrivalTime": "2025-05-13T13:40:12.000+02:00",
                        "departureTime": "2025-05-13T13:40:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Bürgerbräu",
                            "shortName": "Bürgerbräu",
                            "id": "de:09663:256"
                        },
                        "trip": null,
                        "tripIndex": 20,
                        "arrivalTime": "2025-05-13T13:43:00.000+02:00"
                    }
                ]
            },
            "selectedStops": [
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20
            ]
        },
        {
            "trip": {
                "line": {
                    "id": "wvv:01005:e:H:25a",
                    "name": "Straßenbahn 5"
                },
                "tripCode": 323,
                "description": "Rottenbauer - Heuchelhof - Heidingsfeld - HBF - Grombühl",
                "stops": [
                    {
                        "location": {
                            "name": "Würzburg Rottenbauer",
                            "shortName": "Rottenbauer",
                            "id": "de:09663:338"
                        },
                        "trip": null,
                        "tripIndex": 0,
                        "departureTime": "2025-05-13T11:44:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Brombergweg",
                            "shortName": "Brombergweg",
                            "id": "de:09663:63"
                        },
                        "trip": null,
                        "tripIndex": 1,
                        "arrivalTime": "2025-05-13T11:44:12.000+02:00",
                        "departureTime": "2025-05-13T11:44:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Delpstraße",
                            "shortName": "Delpstraße",
                            "id": "de:09663:298"
                        },
                        "trip": null,
                        "tripIndex": 2,
                        "arrivalTime": "2025-05-13T11:45:42.000+02:00",
                        "departureTime": "2025-05-13T11:46:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Athener Ring",
                            "shortName": "Athener Ring",
                            "id": "de:09663:43"
                        },
                        "trip": null,
                        "tripIndex": 3,
                        "arrivalTime": "2025-05-13T11:49:42.000+02:00",
                        "departureTime": "2025-05-13T11:50:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Madrider Ring",
                            "shortName": "Madrider Ring",
                            "id": "de:09663:255"
                        },
                        "trip": null,
                        "tripIndex": 4,
                        "arrivalTime": "2025-05-13T11:51:12.000+02:00",
                        "departureTime": "2025-05-13T11:51:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Wiener Ring",
                            "shortName": "Wiener Ring",
                            "id": "de:09663:453"
                        },
                        "trip": null,
                        "tripIndex": 5,
                        "arrivalTime": "2025-05-13T11:52:12.000+02:00",
                        "departureTime": "2025-05-13T11:52:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Straßburger Ring",
                            "shortName": "Straßburger Ring",
                            "id": "de:09663:404"
                        },
                        "trip": null,
                        "tripIndex": 6,
                        "arrivalTime": "2025-05-13T11:53:42.000+02:00",
                        "departureTime": "2025-05-13T11:54:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Berner Straße",
                            "shortName": "Berner Straße",
                            "id": "de:09663:67"
                        },
                        "trip": null,
                        "tripIndex": 7,
                        "arrivalTime": "2025-05-13T11:54:42.000+02:00",
                        "departureTime": "2025-05-13T11:55:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Heriedenweg",
                            "shortName": "Heriedenweg",
                            "id": "de:09663:185"
                        },
                        "trip": null,
                        "tripIndex": 8,
                        "arrivalTime": "2025-05-13T11:58:12.000+02:00",
                        "departureTime": "2025-05-13T11:58:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Klingenstraße",
                            "shortName": "Klingenstraße",
                            "id": "de:09663:220"
                        },
                        "trip": null,
                        "tripIndex": 9,
                        "arrivalTime": "2025-05-13T11:59:12.000+02:00",
                        "departureTime": "2025-05-13T11:59:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Reuterstraße",
                            "shortName": "Reuterstraße",
                            "id": "de:09663:321"
                        },
                        "trip": null,
                        "tripIndex": 10,
                        "arrivalTime": "2025-05-13T12:01:12.000+02:00",
                        "departureTime": "2025-05-13T12:02:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Wü Andreas-Grieser-Straße",
                            "shortName": "Andreas-Grieser-Straße",
                            "id": "de:09663:40"
                        },
                        "trip": null,
                        "tripIndex": 11,
                        "arrivalTime": "2025-05-13T12:03:42.000+02:00",
                        "departureTime": "2025-05-13T12:04:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Dallenbergbad",
                            "shortName": "Dallenbergbad",
                            "id": "de:09663:103"
                        },
                        "trip": null,
                        "tripIndex": 12,
                        "arrivalTime": "2025-05-13T12:04:42.000+02:00",
                        "departureTime": "2025-05-13T12:05:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Steinbachtal",
                            "shortName": "Steinbachtal",
                            "id": "de:09663:399"
                        },
                        "trip": null,
                        "tripIndex": 13,
                        "arrivalTime": "2025-05-13T12:06:42.000+02:00",
                        "departureTime": "2025-05-13T12:07:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Judenbühlweg",
                            "shortName": "Judenbühlweg",
                            "id": "de:09663:211"
                        },
                        "trip": null,
                        "tripIndex": 14,
                        "arrivalTime": "2025-05-13T12:07:42.000+02:00",
                        "departureTime": "2025-05-13T12:08:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Ruderzentrum",
                            "shortName": "Ruderzentrum",
                            "id": "de:09663:180"
                        },
                        "trip": null,
                        "tripIndex": 15,
                        "arrivalTime": "2025-05-13T12:08:42.000+02:00",
                        "departureTime": "2025-05-13T12:09:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Löwenbrücke",
                            "shortName": "Löwenbrücke",
                            "id": "de:09663:250"
                        },
                        "trip": null,
                        "tripIndex": 16,
                        "arrivalTime": "2025-05-13T12:09:42.000+02:00",
                        "departureTime": "2025-05-13T12:10:00.000+02:00"
                    },
                    {
                        "departureTime": "2025-05-13T12:12:30.000+02:00",
                        "location": {
                            "name": "Würzburg, Sanderring",
                            "shortName": "Sanderring",
                            "id": "de:09663:348"
                        },
                        "trip": null,
                        "tripIndex": 17
                    },
                    {
                        "location": {
                            "name": "Würzburg Neubaustraße",
                            "shortName": "Neubaustraße",
                            "id": "de:09663:271"
                        },
                        "trip": null,
                        "tripIndex": 18,
                        "arrivalTime": "2025-05-13T12:13:42.000+02:00",
                        "departureTime": "2025-05-13T12:14:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Rathaus",
                            "shortName": "Rathaus",
                            "id": "de:09663:315"
                        },
                        "trip": null,
                        "tripIndex": 19,
                        "arrivalTime": "2025-05-13T12:15:12.000+02:00",
                        "departureTime": "2025-05-13T12:15:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Dom",
                            "shortName": "Dom",
                            "id": "de:09663:106"
                        },
                        "trip": null,
                        "tripIndex": 20,
                        "arrivalTime": "2025-05-13T12:16:42.000+02:00",
                        "departureTime": "2025-05-13T12:17:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Juliuspromenade",
                            "shortName": "Juliuspromenade",
                            "id": "de:09663:208"
                        },
                        "trip": null,
                        "tripIndex": 21,
                        "arrivalTime": "2025-05-13T12:18:42.000+02:00",
                        "departureTime": "2025-05-13T12:20:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg, Hauptbahnhof Ost",
                            "shortName": "Hauptbahnhof Ost",
                            "id": "de:09663:170"
                        },
                        "trip": null,
                        "tripIndex": 22,
                        "arrivalTime": "2025-05-13T12:22:12.000+02:00",
                        "departureTime": "2025-05-13T12:22:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Berliner Platz",
                            "shortName": "Berliner Platz",
                            "id": "de:09663:95"
                        },
                        "trip": null,
                        "tripIndex": 23,
                        "arrivalTime": "2025-05-13T12:23:42.000+02:00",
                        "departureTime": "2025-05-13T12:24:00.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Wagnerplatz",
                            "shortName": "Wagnerplatz",
                            "id": "de:09663:440"
                        },
                        "trip": null,
                        "tripIndex": 24,
                        "arrivalTime": "2025-05-13T12:25:12.000+02:00",
                        "departureTime": "2025-05-13T12:25:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Felix-Fechenbach-Haus",
                            "shortName": "Felix-Fechenbach-Haus",
                            "id": "de:09663:157"
                        },
                        "trip": null,
                        "tripIndex": 25,
                        "arrivalTime": "2025-05-13T12:26:12.000+02:00",
                        "departureTime": "2025-05-13T12:26:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Senefelderstraße",
                            "shortName": "Senefelderstraße",
                            "id": "de:09663:352"
                        },
                        "trip": null,
                        "tripIndex": 26,
                        "arrivalTime": "2025-05-13T12:27:12.000+02:00",
                        "departureTime": "2025-05-13T12:27:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Würzburg Uni-Klinik. Bereich D",
                            "shortName": "Uni-Klinikum Bereich D",
                            "id": "de:09663:252"
                        },
                        "trip": null,
                        "tripIndex": 27,
                        "arrivalTime": "2025-05-13T12:28:12.000+02:00",
                        "departureTime": "2025-05-13T12:28:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "R.-Koch-Str. Uni-Klinikum Bereich B/C",
                            "id": "de:09663:328"
                        },
                        "trip": null,
                        "tripIndex": 28,
                        "arrivalTime": "2025-05-13T12:29:12.000+02:00",
                        "departureTime": "2025-05-13T12:29:30.000+02:00"
                    },
                    {
                        "location": {
                            "name": "Pestalozzistr. Uni-Klinikum Bereich A",
                            "id": "de:09663:307"
                        },
                        "trip": null,
                        "tripIndex": 29,
                        "arrivalTime": "2025-05-13T12:30:00.000+02:00"
                    }
                ]
            },
            "selectedStops": [
                18,
                19,
                20,
                21,
                22,
                23,
                24,
                25,
                26,
                27,
                28,
                29,
                17
            ]
        }
    ]
}
