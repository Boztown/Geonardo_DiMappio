import cors from "cors";
import express from "express";
import { initializeSocketConnection } from "./socket";

const configDefaults = {
  serverPort: 1235,
  telnetHost: "127.0.0.1",
  telnetPort: "5554",
  androidAuthCode: "3Y3NFY89DIIDK5DB",
};

export const config = {
  serverPort: process.env.SERVER_PORT || configDefaults.serverPort,
  telnetHost: process.env.TELNET_HOST || configDefaults.telnetHost,
  telnetPort: process.env.TELNET_PORT || configDefaults.telnetPort,
  androidAuthCode:
    process.env.ANDROID_AUTH_CODE || configDefaults.androidAuthCode,
};

const app = express();
app.use(express.static("dist"));
app.use(express.json());
app.use(cors());
const socket = initializeSocketConnection(config);

app.post("/", (req, res) => {
  const { lon, lat } = req.body;
  if (typeof lon === "number" && typeof lat === "number") {
    socket.write(`geo fix ${lon} ${lat}\r\n`);
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
