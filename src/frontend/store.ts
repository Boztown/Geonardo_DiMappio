import { LatLng, LatLngTuple } from "leaflet";
import { create } from "zustand";
import { Mode } from "./mode";

export interface AppState {
  map: L.Map | null;
  setMap: (map: L.Map | null) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  currentPointCoord: LatLng | null;
  setCurrentPointCoord: (coord: LatLng | null) => void;
  polylinePositions: LatLngTuple[];
  setPolylinePositions: (positions: LatLngTuple[]) => void;
  addPolylinePosition: (position: LatLngTuple) => void;
  polyline: [number, number][] | null;
  setPolyline: (polyline: [number, number][] | null) => void;
}

export const useAppStore = create<AppState>((set, get, store) => ({
  map: null,
  setMap: (map: L.Map | null) => set({ map }),
  mode: Mode.ONE_CLICK,
  setMode: (mode: Mode) => set({ mode }),
  currentPointCoord: null,
  setCurrentPointCoord: (coord: LatLng | null) =>
    set({ currentPointCoord: coord }),
  polylinePositions: [],
  setPolylinePositions: (positions: LatLngTuple[]) =>
    set({ polylinePositions: positions }),
  addPolylinePosition: (position: LatLngTuple) =>
    set({ polylinePositions: [...get().polylinePositions, position] }),
  polyline: null,
  setPolyline: (polyline: [number, number][] | null) => set({ polyline }),
}));
