import axios from "axios";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { OSRMRouteResponse } from "../frontend";
import { config } from "./config";
import { TelnetSocket } from "./socket";

const app = express();
app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

const socket = new TelnetSocket();

const SetCoordsRequestSchema = z.object({
  lon: z.number(),
  lat: z.number(),
});

app.post("/", (req, res) => {
  const parseResult = SetCoordsRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).send("Invalid coordinates");
    return;
  }
  const { lon, lat } = parseResult.data;
  const cmd = `geo fix ${lon} ${lat}`;
  console.log("Sending command to telnet:", cmd);
  socket.send(cmd);
  res.status(200).send();
});

const RouteRequestSchema = z.object({
  coords: z.array(
    z.object({
      lat: z.number(),
      lng: z.number(),
    })
  ),
});

app.post("/route", async (req, res) => {
  const parseResult = RouteRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).send("Invalid route request");
    return;
  }

  const formattedCoords = parseResult.data.coords
    .map((coord) => `${coord.lng},${coord.lat}`)
    .join(";");

  const result = await axios.get<OSRMRouteResponse>(
    `http://router.project-osrm.org/route/v1/driving/${formattedCoords}?overview=full&geometries=polyline`
  );

  res.send(result.data);
});

const server = app.listen(config.serverPort, () => {
  console.log(`Server running at http://localhost:${config.serverPort}`);
});

server.on("error", (err: any) => {
  switch (err.code) {
    case "EADDRINUSE":
      console.error(
        `Port ${config.serverPort} is already in use. Please choose another port.`
      );
      process.exit(1);
    default:
      console.error(err);
      process.exit(1);
  }
});
