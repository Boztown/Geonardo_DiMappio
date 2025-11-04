import axios from "axios";
import L, { LatLng } from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41], // size of the icon
  iconAnchor: [12, 40], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -51],
});

const SERVER_HOST = "http://localhost:1235";

L.Marker.prototype.options.icon = DefaultIcon;

let map: L.Map;
let renderLayers: L.Marker[] = [];
let currentPointCoord: LatLng;

async function postPoint(coord: LatLng) {
  currentPointCoord = coord;
  render();

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

function addLayer(layer: L.Marker): void {
  renderLayers.push(layer);
}

function clear() {
  renderLayers.forEach((layer) => map.removeLayer(layer));
}

function render() {
  clear();
  console.log("render", currentPointCoord);
  addLayer(L.marker(currentPointCoord).addTo(map));
}

if (typeof window !== "undefined") {
  window.onload = () => {
    map = L.map("map").setView([48.45521397711524, -123.38275390554121], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", function (e) {
      postPoint(e.latlng);
    });
  };
}
