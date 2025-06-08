import {Component, effect, ElementRef, inject, OnInit} from "@angular/core";
import {TripsEditorService} from "../shared/tripSelection.service";
import * as d3 from 'd3';
import {Line, ScaleLinear, ScaleTime} from "d3";
import {DateTime} from "luxon";
import {Stop, TripToPlot} from "../shared/trip.model";

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
    dimensions = {
        width: 800,
        height: 800,
        margin: {
            left: 50,
            right: 10,
            top: 100,
            bottom: 100,
        }
    }

    constructor() {
        effect(() => {

            this.updatePlot();
        });
    }

    ngOnInit() {
        this.plotSvg = d3.select(this.elementRef.nativeElement).select('.chart')
            .append('svg')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height);

        // this.plotSvg.append('text').text('hello').attr('y', 20);

        this.updatePlot();
    }

    updatePlot() {
        const tripsToPlot: TripToPlot[] = this.tripsEditorService.items();

        const allStops = tripsToPlot.flatMap(tripToPlot => tripToPlot.selectedStops);
        const allStopLocations: Set<string> = new Set(allStops.map(stop => stop.location.id));
        const stopLocationLabels: Map<string, string> = new Map(allStops.map(stop => [stop.location.id, stop.location.shortName]));


        // TODO make dynamic!
        const stopPos: Map<string, number> = new Map();
        for (const [idx, stop] of Array.from(allStopLocations.values()).entries()) {
            stopPos.set(stop, idx);
        }

        const toMinutes = (dateObj: DateTime) => {
            const startOfDay = dateObj.startOf('day');
            const diff = dateObj.diff(startOfDay);
            return new Date(diff.toMillis());
        }

        const x: ScaleLinear<number, number> = d3.scaleLinear()
            .domain(<[number, number]>d3.extent(allStopLocations, (d): number => stopPos.get(d)!))
            .range([this.dimensions.margin.left, this.dimensions.width - this.dimensions.margin.right])

        const y: ScaleTime<number, number> = d3.scaleUtc()
            .domain([toMinutes(DateTime.fromFormat('08:30', 'HH:mm')), toMinutes(DateTime.fromFormat('10:30', 'HH:mm'))])
            .range([this.dimensions.margin.top, this.dimensions.height - this.dimensions.margin.bottom])

        const line: Line<Stop> = (<Line<Stop>>d3.line())
            .x((d: Stop): number => x(stopPos.get(d.location.id)!))
            .y((d: Stop): number => y(toMinutes((d.arrivalTime ?? d.departureTime)!)))

        this.plotSvg.selectAll("*").remove()
        const trips = this.plotSvg.append('g')
            .selectAll('g')
            .data(tripsToPlot)
            .join('g').attr('stroke-width', 1.5)

        trips.append('path')
            .attr('d', trip => line(trip.selectedStops))
            .attr('fill', 'none')
            .attr('stroke', 'black')

        this.plotSvg.append('g').attr("transform", `translate(${this.dimensions.margin.left},0)`)
            .call(d3.axisLeft(y).ticks(d3.utcMinute.every(15)))
            .call(g => g.selectAll(".tick line").clone().lower()
                .attr("stroke-opacity", 0.2)
                .attr("x2", this.dimensions.width))
            .call(g => g.selectAll(".tick text")
                .style("font", "10px sans-serif"))

        this.plotSvg.append('g')
            .style("font", "10px sans-serif")
            .selectAll("g")
            .data(allStopLocations)
            .join("g")
            .attr("transform", d => `translate(${x(stopPos.get(d)!)},0)`)
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
                .attr("x", 12)
                .attr("dy", "0.35em")
                .text(d => stopLocationLabels.get(d)!))
            .call(g => g.append("text")
                .attr("text-anchor", "end")
                .attr("transform", `translate(0,${this.dimensions.height - this.dimensions.margin.top}) rotate(-90)`)
                .attr("x", -12)
                .attr("dy", "0.35em")
                .text(d => stopLocationLabels.get(d)!));

        return;

    }
}
