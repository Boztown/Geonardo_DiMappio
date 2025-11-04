import axios from "axios";
import L, { LatLng } from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useCallback, useState } from "react";
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

function LocationMarker({ onClick }: { onClick: (coord: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

function App() {
  const [currentPointCoord, setCurrentPointCoord] = useState<LatLng | null>(
    null
  );

  const handleMapClick = useCallback(async (coord: LatLng) => {
    setCurrentPointCoord(coord);
    try {
      const response = await axios.post(SERVER_HOST, {
        lon: coord.lng,
        lat: coord.lat,
      });
      console.log("axios res: ", response);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
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
  );
}

import { createRoot } from "react-dom/client";
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
