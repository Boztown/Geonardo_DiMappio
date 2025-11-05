import axios from "axios";
import L, { LatLng, LatLngTuple } from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useCallback, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { OSRMRouteResponse } from ".";
import { AnimatedMarker } from "./components/AnimatedMarker";
import { LocateButton } from "./components/LocateButton";
import logo from "./img/logo.jpg";
import { Mode } from "./mode";
import { decodePolyline } from "./polyline";
import { useAppStore } from "./store";

const SERVER_HOST = "http://localhost:1235";

export const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 40],
  popupAnchor: [0, -51],
});

L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const store = useAppStore();
  const {
    map,
    setMap,
    mode,
    setMode,
    currentPointCoord,
    setCurrentPointCoord,
    polylinePositions,
    addPolylinePosition,
    polyline,
    showPolylinePositions,
    setShowPolylinePositions,
  } = store;

  useEffect(() => {
    if (store.mode === Mode.FOLLOW_MOUSE) {
      let lastCall = 0;
      const throttleMs = 0;
      const handleMouseMove = (e: MouseEvent) => {
        const now = Date.now();
        const mapElement = document.querySelector(".leaflet-container");
        if (mapElement && map) {
          const rect = mapElement.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const latlng = map.containerPointToLatLng([x, y]);
          setCurrentPointCoord(latlng);
          if (now - lastCall < throttleMs) return;
          lastCall = now;
          sendCoords(latlng);
        }
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }

    if (store.mode === Mode.POLYLINE && currentPointCoord) {
      setCurrentPointCoord(null);
    }
  }, [store.mode, store.map, store.setCurrentPointCoord]);

  const handleMapClick = useCallback(
    async (coord: LatLng) => {
      if (mode === Mode.ONE_CLICK) {
        setCurrentPointCoord(coord);
        sendCoords(coord);
      }
      if (mode === Mode.POLYLINE) {
        setShowPolylinePositions(true);
        addPolylinePosition([coord.lat, coord.lng]);
      }
    },
    [mode, setCurrentPointCoord, addPolylinePosition]
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

  return (
    <div id="sidebar" style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          flex: "0 0 200px",
          background: "#fff",
          padding: "10px",
        }}
      >
        <img src={logo} alt="Logo" style={{ width: "100%" }} />
        <ModeSelector onSelect={setMode} />
        <ModePanel mode={mode} />
      </div>
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: "100vh", width: "100%" }}
          ref={setMap}
        >
          <LocateButton />
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onClick={handleMapClick} />
          {currentPointCoord && (
            <Marker position={currentPointCoord} icon={DefaultIcon} />
          )}
          {showPolylinePositions &&
            polylinePositions.map((position: LatLngTuple, index: number) => (
              <Marker key={index} position={position} icon={DefaultIcon} />
            ))}
          {showPolylinePositions && polylinePositions.length > 1 && (
            <Polyline positions={polylinePositions} color="blue" />
          )}
          {polyline && <Polyline positions={polyline} />}
          {mode === Mode.POLYLINE && polyline && (
            <AnimatedMarker
              positions={polyline}
              onPositionChange={(p) => sendCoords(new LatLng(p[0], p[1]))}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

function MapClickHandler({ onClick }: { onClick: (coord: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

function ModePanel({ mode }: { mode: Mode }) {
  switch (mode) {
    case Mode.ONE_CLICK:
      return <ModePanelOneClick />;
    case Mode.FOLLOW_MOUSE:
      return <ModePanelFollowMouse />;
    case Mode.POLYLINE:
      return <ModePanelPolyline />;
    default:
      return null;
  }
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        marginTop: "10px",
        boxShadow: "0 0 5px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif",
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}

function ModePanelOneClick() {
  const currentPointCoord = useAppStore((state) => state.currentPointCoord);

  return (
    <Panel>
      <span>Click on the map to set a single coordinate.</span>
      <hr />
      <label style={{ fontWeight: "bold" }}>Current Coordinates:</label>
      <br />
      <DisplayCoordinates coord={currentPointCoord} />
    </Panel>
  );
}

function ModePanelFollowMouse() {
  return <Panel>Move your mouse over the map to update coordinates.</Panel>;
}

function ModePanelPolyline() {
  const polylinePositions = useAppStore((state) => state.polylinePositions);
  const setPolylinePositions = useAppStore(
    (state) => state.setPolylinePositions
  );
  const setPolyline = useAppStore((state) => state.setPolyline);
  const setShowPolylinePositions = useAppStore(
    (state) => state.setShowPolylinePositions
  );

  async function onClickSubmitHandler() {
    try {
      const response = await axios.post<OSRMRouteResponse>(
        SERVER_HOST + "/route",
        {
          coords: polylinePositions.map((pos) => ({
            lng: pos[1],
            lat: pos[0],
          })),
        }
      );
      const decodedPolyline = decodePolyline(response.data.routes[0].geometry);
      setPolyline(decodedPolyline);
      setShowPolylinePositions(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function onClickResetHandler() {
    setPolylinePositions([]);
    setPolyline(null);
  }

  return (
    <Panel>
      <span>Click on the map to add points to the polyline.</span>
      <hr />
      <ul style={{ padding: 0, marginLeft: 14 }}>
        {polylinePositions.map((pos, index) => (
          <li key={index}>
            <Monospace>
              {pos[1].toFixed(4)}, {pos[0].toFixed(4)}
            </Monospace>
          </li>
        ))}
      </ul>
      {polylinePositions.length ? (
        <div>
          <button onClick={onClickSubmitHandler}>Submit</button>
          <button onClick={onClickResetHandler}>Reset</button>
        </div>
      ) : null}
    </Panel>
  );
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
  const style: React.CSSProperties = {
    textAlign: "center",
  };

  if (coord) {
    return (
      <Monospace style={style}>
        {coord.lng.toFixed(6)}, {coord.lat.toFixed(6)}
      </Monospace>
    );
  } else {
    return <Monospace style={style}>--</Monospace>;
  }
}

function Monospace({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <span style={{ fontFamily: "monospace", ...style }}>{children}</span>;
}

// Initialize the React application
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
