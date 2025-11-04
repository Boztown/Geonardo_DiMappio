import net from "net";
import { config } from "./server.ts";

export function initializeSocketConnection(cfg: typeof config) {
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
        console.log("Error!");
        console.log(JSON.stringify(err));
        break;
    }
  });

  socket.on("data", (data: Buffer) => console.log(data.toString()));

  socket.connect(Number(config.telnetPort), config.telnetHost, () => {
    socket.write(`auth ${config.androidAuthCode}\r\n`);
  });

  return socket;
}
