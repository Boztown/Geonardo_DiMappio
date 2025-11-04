import cors from "cors";
import express from "express";
import net from "net";

const app = express();

const configDefaults = {
  serverPort: 1235,
  telnetHost: "127.0.0.1",
  telnetPort: "5554",
  androidAuthCode: "3Y3NFY89DIIDK5DB",
};

const config = {
  serverPort: process.env.SERVER_PORT || configDefaults.serverPort,
  telnetHost: process.env.TELNET_HOST || configDefaults.telnetHost,
  telnetPort: process.env.TELNET_PORT || configDefaults.telnetPort,
  androidAuthCode:
    process.env.ANDROID_AUTH_CODE || configDefaults.androidAuthCode,
};

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
  socket.write(`auth ${config.androidAuthCode}\r\n`);
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

app.listen(config.serverPort, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
