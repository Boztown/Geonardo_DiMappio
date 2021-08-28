import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

async function postPoint(coord) {
  try {
    const response = await axios.post("/", coord);
    console.log("axios res: ", response);
  } catch (error) {
    console.error(error);
  }
}

window.onload = () => {
  let map = L.map("map").setView([48.45521397711524, -123.38275390554121], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on("click", function (e) {
    // driver.geometry.coordinates[0] = e.latlng.lng;
    // driver.geometry.coordinates[1] = e.latlng.lat;
    console.log(e);
    postPoint({ lon: e.latlng.lng, lat: e.latlng.lat });
  });
};
