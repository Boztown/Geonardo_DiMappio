import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41], // size of the icon
  iconAnchor: [12, 40], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -51],
});

const SERVER_HOST = "http://localhost:1235";

L.Marker.prototype.options.icon = DefaultIcon;

var map;
let renderLayers = [];
let currentPointCoord;

async function postPoint(coord) {
  currentPointCoord = coord;
  render();

  try {
    const response = await axios.post(SERVER_HOST, {
      lon: coord[1],
      lat: coord[0],
    });
    console.log("axios res: ", response);
  } catch (error) {
    console.error(error);
  }
}

function addLayer(layer) {
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

window.onload = () => {
  map = L.map("map").setView([48.45521397711524, -123.38275390554121], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on("click", function (e) {
    postPoint([e.latlng.lat, e.latlng.lng]);
  });
};
