import { useMap } from "react-leaflet";

export function LocateButton() {
  const map = useMap();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], map.getZoom());
      },
      () => {
        alert("Unable to retrieve your location");
      }
    );
  };

  return (
    <button
      onClick={handleLocate}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1000,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 4,
        padding: "6px 12px",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      Locate Me
    </button>
  );
}
