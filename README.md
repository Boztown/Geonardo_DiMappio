# Geonardo DiMappio
A tool to send GPS events to the Android Emulator

## What is it?

It's a tool that opens a map in browser window and then allows you to click on it and send mock GPS coordinates to the Android Emualator via Telnet.

## Why?

At the time, the only Android emulator I could run properly on my Apple Silicone M1 Macbook was an early preview edition of an ARM compiled version. The GPS simulating settings were limited to putting in one set of coordinates or loading up a GPX file. Whether this was just because of that alpha status or was like this on all Mac versions; I don't know. However, on Linux there was an actual embedded map that you could click on. I wanted that.

## How?

This is simply an Node package that runs an Express server. It serves up page with OpenStreetMaps. Clicking on the map sends the coordinates to the backend which then talks through Telnet to your emulator. 
