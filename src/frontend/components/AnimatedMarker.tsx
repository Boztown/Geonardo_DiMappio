import { useEffect, useState } from "react";
import { Marker } from "react-leaflet";
import { DefaultIcon } from "../app";

export function AnimatedMarker({
  positions,
  speed = 500,
  onPositionChange,
}: {
  positions: [number, number][];
  speed?: number;
  onPositionChange?: (position: [number, number]) => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (positions.length < 2) return;
    const interval = setInterval(() => {
      setIndex((i) => (i < positions.length - 1 ? i + 1 : i));
    }, speed);
    return () => clearInterval(interval);
  }, [positions, speed]);

  useEffect(() => {
    if (onPositionChange) {
      onPositionChange(positions[index]);
    }
  }, [index, onPositionChange]);

  return <Marker position={positions[index]} icon={DefaultIcon} />;
}
