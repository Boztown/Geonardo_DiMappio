import net from "net";
import { config } from "./config";

export class TelnetSocket {
  private socket: net.Socket;

  constructor() {
    this.socket = new net.Socket();

    this.socket.on("error", (err: any) => {
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

    this.socket.on("data", (data: Buffer) => {
      // console.log(data.toString())
    });

    this.socket.connect(Number(config.telnetPort), config.telnetHost, () => {
      this.socket.write(`auth ${config.androidAuthCode}\r\n`);
    });
  }

  send(command: string) {
    this.socket.write(command + "\r\n");
  }
}
