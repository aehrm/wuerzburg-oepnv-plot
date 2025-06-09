import {Component, effect, ElementRef, inject, OnInit} from "@angular/core";
import {TripsEditorService} from "../shared/tripSelection.service";
import * as d3 from 'd3';
import {DragContainerElement, Line, ScaleLinear, ScaleTime} from "d3";
import {DateTime} from "luxon";
import {Stop, TripToPlot} from "../shared/trip.model";

interface PlotStop {
    locationPos: number;
    stopTime: Date;
}

interface PlotTrip {
    tripUuid: string;
    stops: PlotStop[];
}

@Component({
    selector: 'timetable-plot',
    template: `
        <div class="chart"></div>
    `
})
export class TimetablePlotComponent implements OnInit {

    tripsEditorService = inject(TripsEditorService);
    elementRef = inject(ElementRef);
    plotSelection: d3.Selection<any, unknown, any, unknown> = d3.select('.chart');
    dimensions = {
        width: 800,
        height: 800,
        margin: {
            left: 50,
            right: 10,
            top: 100,
            bottom: 100,
        },
        padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
        }
    }

    stopPositions: Map<string, number> = new Map();
    brushExtent: [[number, number], [number, number]] = [[0,0], [0,0]];

    constructor() {
        effect(() => {

            this.updatePlot();
        });
    }

    ngOnInit() {
        this.plotSelection = d3.select(this.elementRef.nativeElement).select('.chart')
            .append('svg')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height);

        // this.plotSvg.append('text').text('hello').attr('y', 20);

        this.updatePlot();
    }

    updatePlot() {
        this.plotSelection.selectAll("*").remove()

        const toD3Time = (dateObj: DateTime) => {
            const startOfDay = dateObj.startOf('day');
            const diff = dateObj.diff(startOfDay);
            return new Date(diff.toMillis());
        }

        const tripsToPlot: TripToPlot[] = this.tripsEditorService.items();

        const locationLabels: Map<string, string> = new Map();
        const allLocationIds: Set<string> = new Set();
        const plotData: PlotTrip[] = [];

        for (const trip of tripsToPlot) {
            for (const stop of trip.selectedStops) {
                locationLabels.set(stop.location.id, stop.location.shortName ?? stop.location.name)
                allLocationIds.add(stop.location.id)
            }
        }

        this.dimensions.margin.top = this.dimensions.margin.bottom = Math.max(...[...locationLabels.values()].map(l => l.length)) * 10;

        const maxStopPos = d3.max(allLocationIds, i => this.stopPositions.get(i) ?? 0) ?? 0;
        Array.from(allLocationIds.values()).filter(i => !this.stopPositions.has(i)).forEach((i, idx) => {
            this.stopPositions.set(i, maxStopPos + 1 + idx);
        });

        for (const trip of tripsToPlot) {
            plotData.push({
                tripUuid: trip.trip.uuid,
                stops: trip.selectedStops.map((stop: Stop): PlotStop => {
                    return {
                        locationPos: this.stopPositions.get(stop.location.id)!,
                        stopTime: toD3Time((stop.departureTime ?? stop.arrivalTime)!)
                    }
                })
            })
        }

        if (plotData.length === 0) {
            return;
        }


        const x: ScaleLinear<number, number> = d3.scaleLinear()
            .domain(<[number, number]>d3.extent(allLocationIds, (d): number => this.stopPositions.get(d)!))
            .range([this.dimensions.margin.left + this.dimensions.padding.left, this.dimensions.width - this.dimensions.margin.right - this.dimensions.padding.right])

        const yExtent: [Date, Date] = <[Date, Date]>d3.extent(plotData.flatMap(x => x.stops), (stop: PlotStop): Date => stop.stopTime);
        const y: ScaleTime<number, number> = d3.scaleUtc()
            .domain(yExtent)
            .range([this.dimensions.margin.top + this.dimensions.padding.top, this.dimensions.height - this.dimensions.margin.bottom - this.dimensions.padding.bottom])

        const line: Line<PlotStop> = (<Line<PlotStop>>d3.line())
            .x((d: PlotStop): number => x(d.locationPos))
            .y((d: PlotStop): number => y(d.stopTime));

        const trips = this.plotSelection.append('g')
            .selectAll('g')
            .data(plotData)
            .join('g').attr('stroke-width', 1.5)

        trips.append('path')
            .attr('d', trip => line(trip.stops))
            .attr('fill', 'none')
            .attr('stroke', 'black')

        trips.append("g")
            .attr("stroke", "white")
            .attr("fill", d => "black")
            .selectAll("circle")
            .data(d => d.stops)
            .join("circle")
            .attr("transform", d => `translate(${x(d.locationPos)},${y(d.stopTime)})`)
            .attr("r", 2.5);

        this.plotSelection.append('g').attr("transform", `translate(${this.dimensions.margin.left},0)`)
            .call(d3.axisLeft(y).ticks(d3.utcMinute.every(15)))
            .call(g => g.selectAll(".tick line").clone().lower()
                .attr("stroke-opacity", 0.2)
                .attr("x2", this.dimensions.width))
            .call(g => g.selectAll(".tick text")
                .style("font", "10px sans-serif"))

        const drag = (<d3.DragBehavior<SVGTextElement, string, any>>d3.drag())
            .container(<DragContainerElement>this.plotSelection.select('svg').node()!)
            .on("drag", (event, d: string) => {
                this.stopPositions.set(<string>d, x.invert(x(this.stopPositions.get(<string>d)!)+event.dx));
                this.updatePlot()
            })

        this.plotSelection.append('g')
            .style("font", "12px sans-serif")
            .selectAll("g")
            .data(allLocationIds)
            .join("g")
            .attr("transform", d => `translate(${x(this.stopPositions.get(d)!)},0)`)
            .call(g => g.append("line")
                .attr("y1", this.dimensions.margin.top - 6)
                .attr("y2", this.dimensions.margin.top)
                .attr("stroke", "currentColor"))
            .call(g => g.append("line")
                .attr("y1", this.dimensions.height - this.dimensions.margin.bottom + 6)
                .attr("y2", this.dimensions.height - this.dimensions.margin.bottom)
                .attr("stroke", "currentColor"))
            .call(g => g.append("line")
                .attr("y1", this.dimensions.margin.top)
                .attr("y2", this.dimensions.height - this.dimensions.margin.bottom)
                .attr("stroke-opacity", 0.2)
                .attr("stroke-dasharray", "1.5,2")
                .attr("stroke", "currentColor"))
            .call(g => g.append("text")
                .attr("transform", `translate(0,${this.dimensions.margin.top}) rotate(-90)`)
                .style("cursor", "ew-resize")
                .attr("x", 12)
                .attr("dy", "0.35em")
                .text(d => locationLabels.get(d)!)
                .call(drag))
            .call(g => g.append("text")
                .attr("text-anchor", "end")
                .attr("transform", `translate(0,${this.dimensions.height - this.dimensions.margin.top}) rotate(-90)`)
                .style("cursor", "ew-resize")
                .attr("x", -12)
                .attr("dy", "0.35em")
                .text(d => locationLabels.get(d)!)
                .call(drag))

        return;

    }
}
