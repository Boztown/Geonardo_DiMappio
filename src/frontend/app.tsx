import axios from "axios";
import L, { LatLng } from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

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
}

function App() {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mode, setMode] = useState<Mode>(Mode.ONE_CLICK);
  const [currentPointCoord, setCurrentPointCoord] = useState<LatLng | null>(
    null
  );

  useEffect(() => {
    if (mode === Mode.FOLLOW_MOUSE) {
      const handleMouseMove = (e: MouseEvent) => {
        const mapElement = document.querySelector(".leaflet-container");
        if (mapElement) {
          const rect = mapElement.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          // Convert pixel coordinates to lat/lng using Leaflet
          // You need access to the Leaflet map instance
          // We'll use window.L for this quick hack (not recommended for production)
          // Or you can refactor to use a ref to the map instance
          // Here is a safe fallback:
          if (map) {
            const latlng = map.containerPointToLatLng([x, y]);
            setCurrentPointCoord(latlng);
            sendCoords(latlng);
          }
        }
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [mode]);

  const handleMapClick = useCallback(async (coord: LatLng) => {
    setCurrentPointCoord(coord);
    sendCoords(coord);
  }, []);

  async function sendCoords(coord: LatLng) {
    try {
      const response = await axios.post(SERVER_HOST, {
        lon: coord.lng,
        lat: coord.lat,
      });
      console.log("axios res: ", response);
    } catch (error) {
      console.error(error);
    }
  }

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
