declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

export interface OSRMRouteResponse {
  code: string;
  routes: {
    legs: {
      steps: any[];
      weight: number;
      summary: string;
      duration: number;
      distance: number;
    }[];
    weight_name: string;
    geometry: string;
    weight: number;
    duration: number;
    distance: number;
  }[];
  waypoints: {
    hint: string;
    location: number[];
    name: string;
    distance: number;
  }[];
}
