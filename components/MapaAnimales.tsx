"use client";

import { useEffect, useRef } from "react";
import type { AnimalResponse } from "@/lib/apiClient";

interface Props {
  animales: AnimalResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenModal: (id: string) => void;
}

// Centro de México como fallback
const DEFAULT_CENTER: [number, number] = [23.6345, -102.5528];
const DEFAULT_ZOOM = 5;

export default function MapaAnimales({ animales, selectedId, onSelect, onOpenModal }: Props) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Animales con coordenadas válidas
  const conCoords = animales.filter(
    (a) => a.latitud != null && a.longitud != null
  );

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Importar Leaflet dinámicamente (solo en cliente)
    import("leaflet").then((L) => {
      // Corregir íconos por defecto de Leaflet con webpack/Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Inicializar mapa solo una vez
      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current!, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // Limpiar marcadores anteriores
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      if (conCoords.length === 0) return;

      // Crear íconos personalizados
      const iconNormal = L.divIcon({
        className: "",
        html: `<div style="
          background:#f97316;border:2px solid white;border-radius:50% 50% 50% 0;
          width:28px;height:28px;transform:rotate(-45deg);
          box-shadow:0 2px 6px rgba(0,0,0,0.35);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });

      const iconSelected = L.divIcon({
        className: "",
        html: `<div style="
          background:#7c3aed;border:2px solid white;border-radius:50% 50% 50% 0;
          width:36px;height:36px;transform:rotate(-45deg);
          box-shadow:0 2px 10px rgba(124,58,237,0.6);
        "></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
      });

      // Agregar marcadores
      conCoords.forEach((animal) => {
        const isSelected = animal.id === selectedId;
        const marker = L.marker(
          [animal.latitud as number, animal.longitud as number],
          { icon: isSelected ? iconSelected : iconNormal }
        );

        const especie = animal.especie.toLowerCase().includes("gato") ? "🐱" : "🐶";
        marker.bindPopup(`
          <div style="min-width:160px;font-family:sans-serif">
            <strong style="font-size:14px">${especie} ${animal.nombre}</strong><br/>
            <span style="color:#666;font-size:12px">${animal.especie}${animal.raza ? " · " + animal.raza : ""}</span><br/>
            <button
              onclick="window.__mapaOpenModal && window.__mapaOpenModal('${animal.id}')"
              style="margin-top:8px;padding:4px 10px;background:#f97316;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px"
            >Ver ficha</button>
          </div>
        `, { maxWidth: 220 });

        marker.on("click", () => onSelect(animal.id));
        marker.addTo(map);
        markersRef.current[animal.id] = marker;
      });

      // Ajustar vista para mostrar todos los marcadores
      if (conCoords.length > 0) {
        const bounds = L.latLngBounds(
          conCoords.map((a) => [a.latitud as number, a.longitud as number])
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animales]);

  // Actualizar ícono del marcador seleccionado sin re-renderizar todo
  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    import("leaflet").then((L) => {
      Object.entries(markersRef.current).forEach(([id, marker]: [string, any]) => {
        const isSelected = id === selectedId;
        const icon = L.divIcon({
          className: "",
          html: isSelected
            ? `<div style="background:#7c3aed;border:2px solid white;border-radius:50% 50% 50% 0;width:36px;height:36px;transform:rotate(-45deg);box-shadow:0 2px 10px rgba(124,58,237,0.6)"></div>`
            : `<div style="background:#f97316;border:2px solid white;border-radius:50% 50% 50% 0;width:28px;height:28px;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
          iconSize: isSelected ? [36, 36] : [28, 28],
          iconAnchor: isSelected ? [18, 36] : [14, 28],
          popupAnchor: [0, isSelected ? -38 : -30],
        });
        marker.setIcon(icon);
        if (isSelected) {
          mapRef.current.panTo(marker.getLatLng(), { animate: true });
          marker.openPopup();
        }
      });
    });
  }, [selectedId]);

  // Exponer callback para el botón del popup
  useEffect(() => {
    (window as any).__mapaOpenModal = onOpenModal;
    return () => { delete (window as any).__mapaOpenModal; };
  }, [onOpenModal]);

  // Invalidar tamaño cuando el contenedor cambia
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Importar CSS de Leaflet */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={containerRef} className="w-full h-full" />
      {conCoords.length === 0 && animales.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-base-content/40 bg-base-100/80 px-3 py-2 rounded-lg">
            Sin coordenadas disponibles para los animales mostrados
          </p>
        </div>
      )}
    </div>
  );
}
