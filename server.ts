import cors from "cors";
import express from "express";
import net from "net";

const ANDROID_AUTH_CODE = process.env.ANDROID_AUTH_CODE || "3Y3NFY89DIIDK5DB";

const app = express();
const port = 1235;

interface Config {
  telnetHost: string;
  telnetPort: string;
}

const config: Config = {
  telnetHost: "127.0.0.1",
  telnetPort: "5554",
};

export function setConfig(options: Partial<Config>) {
  if (options.telnetHost) {
    config.telnetHost = options.telnetHost;
  }
  if (options.telnetPort) {
    config.telnetPort = options.telnetPort;
  }
}

const socket = new net.Socket();

socket.on("error", (err: any) => {
  switch (err.code) {
    case "ECONNREFUSED":
      console.log(
        `Error! Can't connect to Android Emulator via telnet using ${
          err.address ?? "unknown address"
        }:${err.port ?? "unknown port"}. Is the emulator running?`
      );
      break;
    default:
      console.log(
        "Error! Geonardo is having trouble getting started. Error message:"
      );
      console.log(JSON.stringify(err));
      break;
  }
});

socket.on("data", (data: Buffer) => console.log(data.toString()));

socket.connect(Number(config.telnetPort), config.telnetHost, () => {
  socket.write(`auth ${ANDROID_AUTH_CODE}\r\n`);
});

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

app.post(
  "/",
  (req: import("express").Request, res: import("express").Response) => {
    console.log("body:", req.body);
    const { lon, lat } = req.body;
    if (typeof lon === "number" && typeof lat === "number") {
      socket.write(`geo fix ${lon} ${lat}\r\n`);
      res.send("Got a POST request");
    } else {
      res.status(400).send("Invalid coordinates");
    }
  }
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
