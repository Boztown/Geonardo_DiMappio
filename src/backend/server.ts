import cors from "cors";
import express from "express";
import { config } from "./config";
import { TelnetSocket } from "./socket";

const app = express();
app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

const socket = new TelnetSocket();

app.post("/", (req, res) => {
  const { lon, lat } = req.body;
  if (typeof lon === "number" && typeof lat === "number") {
    socket.send(`geo fix ${lon} ${lat}`);
    res.send("Got a POST request");
  } else {
    res.status(400).send("Invalid coordinates");
  }
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
      break;
    default:
      console.error(err);
      process.exit(1);
      break;
  }
});
