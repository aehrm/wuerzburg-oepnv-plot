import {
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { TripsEditorService } from "../shared/tripSelection.service";
import * as d3 from "d3";
import { DragContainerElement, Line, ScaleLinear, ScaleTime } from "d3";
import { DateTime } from "luxon";
import { Stop, TripToPlot } from "../shared/trip.model";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { jsPDF } from "jspdf";
import * as layoutService from "./plotLayouter.service";
import "svg2pdf.js";
import "../../shared/RobotoCondensed-Regular-normal.js";

interface PlotStop {
  locationPos: number;
  stopTime: Date;
}

interface PlotTrip {
  tripUuid: string;
  color: string;
  stops: PlotStop[];
}

@Component({
  imports: [FormsModule],
  selector: "timetable-plot",
  template: `
    <div class="plot-header">
      <h2>Plot</h2>
      <div class="chart-control">
        <button (click)="export()">Export als PDF</button> &nbsp;
        <button (click)="layout()">Automagisches Layout</button> &nbsp;
      </div>
      <div class="chart-settings">
        <label>Breite:</label> <input [(ngModel)]="width" type="number" /><br />
        <label>Höhe:</label> <input [(ngModel)]="height" type="number" /><br />
      </div>
    </div>
    @if (tripsEditorService.items().length == 0) {
      <div class="chart-placeholder">
        Suche nach Abfahrten an einer Station, um dem Plot Fahrten hinzuzufügen
      </div>
    }
    <div class="chart"></div>
  `,
})
export class TimetablePlotComponent {
  tripsEditorService = inject(TripsEditorService);
  elementRef = inject(ElementRef);
  layouter = inject(layoutService.PlotLayouterService);
  plotSelection: d3.Selection<any, unknown, any, unknown> = d3.select(".chart");
  width = signal(800);
  height = signal(800);
  plot_config = {
    margin: {
      left: 80,
      right: 10,
      top: 100,
      bottom: 100,
    },
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  };

  stopPositions: Map<string, number> = new Map();

  constructor() {
    effect(() => {
      this.updatePlot();
    });
  }

  layout() {
    const tripsToPlot: TripToPlot[] = this.tripsEditorService.items();

    const stopClusters = new Map(
      Object.entries({
        sanderring: new Set(["de:09663:348", "de:09663:346"]),
        jupo: new Set(["de:09663:208", "de:09663:56"]),
        hbf: new Set([
          "de:09663:177",
          "de:09663:68",
          "de:09663:170",
          "de:09663:179",
          "de:09663:75",
        ]),
      }),
    );

    const convertStopId = (stopId: string) => {
      const matchingClusters = [...stopClusters.entries()].filter(
        ([_, cluster]) => cluster.has(stopId),
      );
      if (matchingClusters.length > 0) {
        return matchingClusters[0][0];
      } else {
        return stopId;
      }
    };

    // const layoutTrips: layoutService.Trip[] = tripsToPlot.map(trip => {
    //   return trip.selectedStops.map(stop => stop.location.id);
    // })
    const allStopIds = new Set<string>();
    const layoutTrips: layoutService.Trip[] = [];
    for (const trip of tripsToPlot) {
      const stopIds = trip.selectedStops.map((stop) => stop.location.id);
      stopIds.forEach((stopId) => allStopIds.add(stopId));
      layoutTrips.push(stopIds.map(convertStopId));
    }

    const locationOrder: string[] = this.layouter.layoutStops(layoutTrips);

    function* generateCoordinates(): Generator<[string, number], void, void> {
      let x = 0;
      for (const location of locationOrder) {
        if (stopClusters.has(location)) {
          const cluster = stopClusters.get(location)!;
          for (const clusterMember of cluster) {
            if (allStopIds.has(clusterMember)) {
              yield [clusterMember, x];
              x = x + 0.5;
            }
          }
          x = x + 0.5;
        } else {
          yield [location, x];
          x = x + 1;
        }
      }
    }

    this.stopPositions.clear();
    [...generateCoordinates()].forEach(([id, x]) =>
      this.stopPositions.set(id, x),
    );
    this.updatePlot();
  }

  updatePlot() {
    d3.select(this.elementRef.nativeElement)
      .select(".chart")
      .selectChildren()
      .remove();
    this.plotSelection = d3
      .select(this.elementRef.nativeElement)
      .select(".chart")
      .append("svg")
      .attr("width", this.width())
      .attr("height", this.height());

    const chart = this.elementRef.nativeElement.querySelector(".chart");
    const containerWidth = chart.clientWidth;
    if (this.width() > containerWidth) {
      const scale = containerWidth / this.width();
      this.plotSelection
        .style("transform", `scale(${scale})`)
        .style("transform-origin", "top left");
      chart.style.height = `${this.height() * scale}px`;
    } else {
      chart.style.height = "auto";
    }

    const toD3Time = (dateObj: DateTime) => {
      const startOfDay = dateObj.startOf("day");
      const diff = dateObj.diff(startOfDay);
      return new Date(diff.toMillis());
    };

    const tripsToPlot: TripToPlot[] = this.tripsEditorService.items();

    if (tripsToPlot.length === 0) {
      chart.style["display"] = "none";
    } else {
      chart.style["display"] = "block";
    }

    const locationLabels: Map<string, string> = new Map();
    const allLocationIds: Set<string> = new Set();
    const plotData: PlotTrip[] = [];

    for (const trip of tripsToPlot) {
      for (const stop of trip.selectedStops) {
        locationLabels.set(
          stop.location.id,
          stop.location.shortName ?? stop.location.name,
        );
        allLocationIds.add(stop.location.id);
      }
    }

    this.plot_config.margin.top = this.plot_config.margin.bottom =
      Math.max(...[...locationLabels.values()].map((l) => l.length)) * 10;

    const maxStopPos =
      d3.max(allLocationIds, (i) => this.stopPositions.get(i) ?? 0) ?? 0;
    Array.from(allLocationIds.values())
      .filter((i) => !this.stopPositions.has(i))
      .forEach((i, idx) => {
        this.stopPositions.set(i, maxStopPos + 1 + idx);
      });

    for (const trip of tripsToPlot) {
      plotData.push({
        tripUuid: trip.trip.uuid,
        color: this.tripsEditorService.getLineColor(trip.trip.line),
        stops: trip.selectedStops.map((stop: Stop): PlotStop => {
          return {
            locationPos: this.stopPositions.get(stop.location.id)!,
            stopTime: toD3Time((stop.departureTime ?? stop.arrivalTime)!),
          };
        }),
      });
    }

    const x: ScaleLinear<number, number> = d3
      .scaleLinear()
      .domain(
        <[number, number]>(
          d3.extent(allLocationIds, (d): number => this.stopPositions.get(d)!)
        ),
      )
      .range([
        this.plot_config.margin.left + this.plot_config.padding.left,
        this.width() -
          this.plot_config.margin.right -
          this.plot_config.padding.right,
      ]);

    const timeInterval = d3.utcMinute.every(15)!;
    let yExtent: [Date, Date] = <[Date, Date]>d3.extent(
      plotData.flatMap((x) => x.stops),
      (stop: PlotStop): Date => stop.stopTime,
    );
    yExtent[0] = timeInterval.floor(yExtent[0]);
    yExtent[1] = timeInterval.ceil(yExtent[1]);

    const y: ScaleTime<number, number> = d3
      .scaleUtc()
      .domain(yExtent)
      .range([
        this.plot_config.margin.top + this.plot_config.padding.top,
        this.height() -
          this.plot_config.margin.bottom -
          this.plot_config.padding.bottom,
      ]);

    const line: Line<PlotStop> = (<Line<PlotStop>>d3.line())
      .x((d: PlotStop): number => x(d.locationPos))
      .y((d: PlotStop): number => y(d.stopTime));

    const trips = this.plotSelection
      .append("g")
      .selectAll("g")
      .data(plotData)
      .join("g")
      .attr("stroke-width", 2.5);

    trips
      .append("path")
      .attr("d", (trip) => line(trip.stops))
      .attr("fill", "none")
      .attr("stroke", (trip) => trip.color);

    trips
      .append("g")
      .attr("stroke", "white")
      .attr("fill", (d) => "black")
      .selectAll("circle")
      .data((d) => d.stops)
      .join("circle")
      .attr(
        "transform",
        (d) => `translate(${x(d.locationPos)},${y(d.stopTime)})`,
      )
      .attr("r", 4);

    this.plotSelection
      .append("g")
      .attr("transform", `translate(${this.plot_config.margin.left},0)`)
      .call(
        d3
          .axisLeft(<d3.AxisScale<Date>>y)
          .ticks(timeInterval)
          .tickFormat(d3.utcFormat("%I:%M")),
      )
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .lower()
          .attr("stroke-opacity", 0.2)
          .attr("stroke-width", 1.6)
          .attr(
            "x2",
            this.width() -
              this.plot_config.margin.right -
              this.plot_config.margin.left,
          ),
      )
      .call((g) =>
        g.selectAll(".tick text").style("font", "18px 'Roboto Condensed'"),
      );

    const drag = (<d3.DragBehavior<SVGTextElement, string, any>>d3.drag())
      .container(<DragContainerElement>this.plotSelection.select("svg").node()!)
      .on("drag", (event, d: string) => {
        this.stopPositions.set(
          <string>d,
          x.invert(x(this.stopPositions.get(<string>d)!) + event.dx),
        );
        this.updatePlot();
      });

    this.plotSelection
      .append("g")
      .style("font", "18px 'Roboto Condensed'")
      .selectAll("g")
      .data(allLocationIds)
      .join("g")
      .attr("transform", (d) => `translate(${x(this.stopPositions.get(d)!)},0)`)
      .call((g) =>
        g
          .append("line")
          .attr("y1", this.plot_config.margin.top - 6)
          .attr("y2", this.plot_config.margin.top)
          .attr("stroke", "currentColor"),
      )
      .call((g) =>
        g
          .append("line")
          .attr("y1", this.height() - this.plot_config.margin.bottom + 6)
          .attr("y2", this.height() - this.plot_config.margin.bottom)
          .attr("stroke", "currentColor"),
      )
      .call((g) =>
        g
          .append("line")
          .attr("y1", this.plot_config.margin.top)
          .attr("y2", this.height() - this.plot_config.margin.bottom)
          .attr("stroke-opacity", 0.2)
          .attr("stroke-width", 1.6)
          .attr("stroke-dasharray", "1.5,2")
          .attr("stroke", "currentColor"),
      )
      .call((g) =>
        g
          .append("text")
          .attr(
            "transform",
            `translate(0,${this.plot_config.margin.top}) rotate(-90)`,
          )
          .style("cursor", "ew-resize")
          .attr("x", 12)
          .attr("dy", "0.35em")
          .text((d) => locationLabels.get(d)!)
          .call(drag),
      )
      .call((g) =>
        g
          .append("text")
          .attr("text-anchor", "end")
          .attr(
            "transform",
            `translate(0,${this.height() - this.plot_config.margin.top}) rotate(-90)`,
          )
          .style("cursor", "ew-resize")
          .attr("x", -12)
          .attr("dy", "0.35em")
          .text((d) => locationLabels.get(d)!)
          .call(drag),
      );

    return;
  }

  async export() {
    const svgElement = this.elementRef.nativeElement.querySelector("svg");
    svgElement.getBoundingClientRect();
    const width = svgElement.width.baseVal.value;
    const height = svgElement.height.baseVal.value;
    const pdf = new jsPDF(width > height ? "l" : "p", "pt", [width, height]);

    pdf.setFont("Roboto Condensed");
    await pdf.svg(svgElement, { width, height });
    const timestamp = DateTime.now().toFormat("yyyyMMddHHmmss");
    pdf.save(`plot_${timestamp}.pdf`);
  }
}
