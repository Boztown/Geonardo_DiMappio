import z from "zod";

export const SetCoordsRequestSchema = z.object({
  lon: z.number(),
  lat: z.number(),
});

export const RouteRequestSchema = z.object({
  coords: z.array(
    z.object({
      lat: z.number(),
      lng: z.number(),
    })
  ),
});
