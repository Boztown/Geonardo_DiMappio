import { serve } from "bun";
import { RouteRequestSchema, SetCoordsRequestSchema } from "./backend/schema";
import { TelnetSocket } from "./backend/socket";
import { OSRMRouteResponse } from "./frontend";
import homepage from "./frontend/index.html";

const socket = new TelnetSocket();

const server = serve({
  routes: {
    "/": homepage,
    "/api/coords": {
      async POST(req) {
        const requestBody = await req.json();
        const parseResult = SetCoordsRequestSchema.safeParse(requestBody);
        if (!parseResult.success) {
          return new Response("Invalid coordinates", { status: 400 });
        }
        const { lon, lat } = parseResult.data;
        const cmd = `geo fix ${lon} ${lat}`;
        console.log("Sending command to telnet:", cmd);
        socket.send(cmd);
        return Response.json({ status: "ok" });
      },
    },
    "/api/route": {
      async POST(req) {
        const requestBody = await req.json();
        const parseResult = RouteRequestSchema.safeParse(requestBody);
        if (!parseResult.success) {
          return Response.json({ error: "Invalid params" }, { status: 400 });
        }

        const formattedCoords = parseResult.data.coords
          .map((coord) => `${coord.lng},${coord.lat}`)
          .join(";");

        const res = await fetch(
          `http://router.project-osrm.org/route/v1/driving/${formattedCoords}?overview=full&geometries=polyline`
        );

        const data = (await res.json()) as OSRMRouteResponse;
        return Response.json(data);
      },
    },
  },

  // Enable development mode for:
  // - Detailed error messages
  // - Hot reloading (Bun v1.2.3+ required)
  development: true,
});

console.log(`Listening on ${server.url}`);
