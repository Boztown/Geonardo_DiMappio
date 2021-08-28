"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const port = 1235;
const Telnet = require("telnet-client");

const net = require("net");
const socket = new net.Socket();
socket.on("error", (err) => console.log(err));
socket.on("data", (data) => console.log(data.toString()));
socket.connect(5554, "127.0.0.1", () => {
  socket.write("auth 3Y3NFY89DIIDK5DB\r\n");
});

app.use(express.static("dist"));
app.use(express.json());

app.post("/", function (req, res) {
  console.log("body:", req.body);
  socket.write(`geo fix ${req.body.lon} ${req.body.lat}\r\n`);
  res.send("Got a POST request");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
