"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { listarAnimales, type AnimalResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";

const DEFAULT_CENTER: [number, number] = [23.6345, -102.5528];
const DEFAULT_ZOOM = 5;

/**
 * Mapa preview en el home. Se puede arrastrar/zoom pero al hacer click en un marcador
 * redirige a /explorar.
 */
export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const router = useRouter();
  const [animales, setAnimales] = useState<AnimalResponse[]>([]);

  useEffect(() => {
    const token = getToken() ?? undefined;
    listarAnimales(token).then((res) => {
      if (res.ok) setAnimales(res.data);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || animales.length === 0) return;

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, { zoomControl: false }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const bounds: [number, number][] = [];

      animales.forEach((a) => {
        if (!a.latitud || !a.longitud) return;
        const lat = parseFloat(String(a.latitud));
        const lng = parseFloat(String(a.longitud));
        if (isNaN(lat) || isNaN(lng)) return;
        bounds.push([lat, lng]);

        const marker = L.circleMarker([lat, lng], {
          radius: 6, fillColor: "#65c3c8", fillOpacity: 0.8, color: "#fff", weight: 1,
        }).addTo(map);

        marker.on("click", () => router.push("/explorar"));
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [animales]);

  return (
    <div className="relative h-72 rounded-box overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      <button
        onClick={() => router.push("/explorar")}
        className="absolute bottom-3 right-3 btn btn-primary btn-sm shadow-lg z-[500]"
      >
        Explorar en mapa completo
      </button>
    </div>
  );
}
