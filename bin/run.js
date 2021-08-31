#! /usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

console.log("YARGS!", argv);

var server = require("../server.js")(argv);
