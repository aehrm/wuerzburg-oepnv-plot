import { Injectable } from "@angular/core";
// @ts-ignore
import * as jsnx from "jsnetworkx";

function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

export type StationId = string;
export type Trip = StationId[];

@Injectable({
  providedIn: "root",
})
export class PlotLayouterService {
  constructor() {}

  private edges(trip: Trip): [StationId, StationId][] {
    return [...new Array(trip.length - 1).keys()].map((i) => [
      trip[i],
      trip[i + 1],
    ]);
  }

  private *decomposeTrip(trip: Trip): Generator<Trip, void, void> {
    let currentSegment: Trip = [];
    for (let i = 0; i < trip.length; i++) {
      const u = trip[i];

      if (currentSegment.includes(u)) {
        if (currentSegment.length > 1) {
          yield currentSegment;
        }
        currentSegment = [u];
      } else {
        currentSegment.push(u);
      }
    }

    if (currentSegment.length > 1) {
      yield currentSegment;
    }
  }

  private makeLocationGraph(trips: Trip[]): jsnx.classes.Graph {
    const L = new jsnx.classes.Graph();
    L.addNodesFrom(trips.flatMap((x) => x));
    trips.forEach((trip) => {
      for (let i = 0; i < trip.length - 1; i++) {
        const u = trip[i];
        const v = trip[i + 1];
        if (L.hasEdge(u, v)) {
          L.addEdge(u, v, { weight: L.get(u).get(v).weight + 1 });
        } else {
          L.addEdge(u, v, { weight: 1 });
        }
      }
    });

    return L;
  }

  private *splitTripIntoArcs(
    trip: Trip,
    G: jsnx.classes.DiGraph,
  ): Generator<Trip, void, void> {
    let currentSubpath: Trip = [];
    for (const q of trip) {
      currentSubpath.push(q);

      if (currentSubpath.length > 1 && G.hasNode(q)) {
        if (
          currentSubpath.length != 2 ||
          !G.hasNode(currentSubpath[0]) ||
          !G.hasNode(currentSubpath[1])
        ) {
          yield currentSubpath;
        }
        currentSubpath = [q];
      }
    }

    if (currentSubpath.length > 0) {
      if (
        currentSubpath.length != 2 ||
        !G.hasNode(currentSubpath[0]) ||
        !G.hasNode(currentSubpath[1])
      ) {
        yield currentSubpath;
      }
    }
  }

  layoutStops(trips: Trip[]): StationId[] {
    const decomposedTrips: Trip[] = trips.flatMap((x) => [
      ...this.decomposeTrip(x),
    ]);
    const L = this.makeLocationGraph(decomposedTrips);

    const edgeWeight = (u: StationId, v: StationId): number => {
      return L.get(u).get(v).weight;
    };

    const tripWeight = (trip: Trip): number => {
      return this.edges(trip)
        .map(([a, b]) => edgeWeight(a, b))
        .reduce((a, b) => a + b);
    };

    const tripsSortedByWeight = decomposedTrips
      .sort((a, b) => tripWeight(a) - tripWeight(b))
      .reverse();

    const G = new jsnx.classes.DiGraph();
    for (const line of tripsSortedByWeight) {
      for (const arc of this.splitTripIntoArcs(line, G)) {
        if (arc.length === 1) {
          continue;
        }
        this.edges(arc).forEach(([a, b]) => G.addEdge(a, b));

        const begin = arc[0];
        const end = arc[arc.length - 1];

        if (jsnx.algorithms.hasPath(G, { source: end, target: begin })) {
          const toFlip = this.edges(arc).sort(
            (edge1, edge2) => edgeWeight(...edge1) - edgeWeight(...edge2),
          )[0];
          G.removeEdge(toFlip[0], toFlip[1]);
          G.addEdge(toFlip[1], toFlip[0]);
          assert(
            jsnx.algorithms.isDirectedAcyclicGraph(G),
            "helper graph is not acyclic!",
          );
        }
      }
    }

    return jsnx.algorithms.topologicalSort(G);
  }
}
