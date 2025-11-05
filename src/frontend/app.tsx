import axios from "axios";
import L, { LatLng, LatLngTuple } from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

const SERVER_HOST = "http://localhost:1235";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 40],
  popupAnchor: [0, -51],
});

L.Marker.prototype.options.icon = DefaultIcon;

enum Mode {
  ONE_CLICK = "one_click",
  FOLLOW_MOUSE = "follow_mouse",
  POLYLINE = "polyline",
}

function App() {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mode, setMode] = useState<Mode>(Mode.ONE_CLICK);
  const [currentPointCoord, setCurrentPointCoord] = useState<LatLng | null>(
    null
  );
  const [polylinePositions, setPolylinePositions] = useState<LatLngTuple[]>([]);

  useEffect(() => {
    if (mode === Mode.FOLLOW_MOUSE) {
      let lastCall = 0;
      const throttleMs = 0;

      const handleMouseMove = (e: MouseEvent) => {
        const now = Date.now();

        const mapElement = document.querySelector(".leaflet-container");
        if (mapElement) {
          const rect = mapElement.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          if (map) {
            const latlng = map.containerPointToLatLng([x, y]);
            setCurrentPointCoord(latlng);
            if (now - lastCall < throttleMs) return;
            lastCall = now;
            sendCoords(latlng);
          }
        }
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [mode]);

  const handleMapClick = useCallback(
    async (coord: LatLng) => {
      if (mode === Mode.ONE_CLICK) {
        setCurrentPointCoord(coord);
        sendCoords(coord);
      }

      if (mode === Mode.POLYLINE) {
        console.log("Adding polyline point:", coord);
        setPolylinePositions((prev) => [...prev, [coord.lat, coord.lng]]);
      }
    },
    [mode]
  );

  async function sendCoords(coord: LatLng) {
    try {
      await axios.post(SERVER_HOST, {
        lon: coord.lng,
        lat: coord.lat,
      });
    } catch (error) {
      console.error(error);
    }
  }

  // Example encoded polyline string (replace with your own)
  const encoded = "omzeHdkdqV??";
  // const polylinePositions: LatLngTuple[] = decodePolyline(encoded).map(
  //   ([lat, lng]) => [lat, lng]
  // );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          flex: "0 0 200px",
          background: "#fff",
          padding: "10px",
        }}
      >
        <h1>Geonardo DiMappio</h1>
        <ModeSelector onSelect={(mode) => setMode(mode)} />
        <DisplayCoordinates coord={currentPointCoord} />
      </div>
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: "100vh", width: "100%" }}
          ref={setMap}
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <LocationMarker onClick={handleMapClick} />
          {currentPointCoord && (
            <Marker position={currentPointCoord} icon={DefaultIcon} />
          )}
          {polylinePositions.map((position, index) => (
            <Marker key={index} position={position} icon={DefaultIcon} />
          ))}
          {polylinePositions.length > 1 && (
            <Polyline positions={polylinePositions} color="blue" />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

function LocationMarker({ onClick }: { onClick: (coord: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

function ModeSelector({ onSelect }: { onSelect: (mode: Mode) => void }) {
  return (
    <div>
      <select
        onChange={(e) => onSelect(e.target.value as Mode)}
        style={{
          width: "100%",
          padding: "5px",
          marginBottom: "10px",
          boxShadow: "0 0 5px rgba(0,0,0,0.2)",
          borderRadius: "4px",
        }}
      >
        <option value={Mode.ONE_CLICK}>One Click</option>
        <option value={Mode.FOLLOW_MOUSE}>Follow Mouse</option>
        <option value={Mode.POLYLINE}>Polyline</option>
      </select>
    </div>
  );
}

function DisplayCoordinates({ coord }: { coord: LatLng | null }) {
  if (coord) {
    return (
      <span style={{ fontFamily: "monospace" }}>
        {coord.lng.toFixed(6)}, {coord.lat.toFixed(6)}
      </span>
    );
  } else {
    return <span>Click on the map to set coordinates</span>;
  }
}

// Initialize the React application
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
