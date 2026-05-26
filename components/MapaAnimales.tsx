"use client";

import { useEffect, useRef } from "react";
import type { AnimalResponse } from "@/lib/apiClient";

interface Props {
  animales: AnimalResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenModal: (id: string) => void;
}

const DEFAULT_CENTER: [number, number] = [23.6345, -102.5528];
const DEFAULT_ZOOM = 5;

export default function MapaAnimales({ animales, selectedId, onSelect, onOpenModal }: Props) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);

  const conCoords = animales.filter(
    (a) => a.latitud != null && a.longitud != null
  );

  // Cargar CSS de Leaflet una sola vez
  useEffect(() => {
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!containerRef.current) return;

    import("leaflet").then((L) => {
      leafletRef.current = L;

      // Fix íconos con webpack/Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current!, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      renderMarkers(L);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-renderizar marcadores cuando cambian los animales
  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) return;
    renderMarkers(leafletRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animales]);

  // Actualizar ícono del seleccionado
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !mapRef.current) return;

    Object.entries(markersRef.current).forEach(([id, marker]: [string, any]) => {
      const isSelected = id === selectedId;
      marker.setIcon(makeIcon(L, isSelected));
      if (isSelected) {
        mapRef.current.panTo(marker.getLatLng(), { animate: true });
        marker.openPopup();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Exponer callback para el botón del popup
  useEffect(() => {
    (window as any).__mapaOpenModal = onOpenModal;
    return () => { delete (window as any).__mapaOpenModal; };
  }, [onOpenModal]);

  // Invalidar tamaño al redimensionar
  useEffect(() => {
    const observer = new ResizeObserver(() => mapRef.current?.invalidateSize());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function makeIcon(L: any, selected: boolean) {
    const size = selected ? 36 : 28;
    const color = selected ? "#7c3aed" : "#f97316";
    const shadow = selected ? "rgba(124,58,237,0.6)" : "rgba(0,0,0,0.35)";
    return L.divIcon({
      className: "",
      html: `<div style="background:${color};border:2px solid white;border-radius:50% 50% 50% 0;width:${size}px;height:${size}px;transform:rotate(-45deg);box-shadow:0 2px 8px ${shadow}"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -(size + 4)],
    });
  }

  function renderMarkers(L: any) {
    // Limpiar marcadores anteriores
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    if (conCoords.length === 0) return;

    conCoords.forEach((animal) => {
      const isSelected = animal.id === selectedId;
      const marker = L.marker(
        [animal.latitud as number, animal.longitud as number],
        { icon: makeIcon(L, isSelected) }
      );

      const especie = animal.especie.toLowerCase().includes("gato") ? "🐱" : "🐶";
      marker.bindPopup(`
        <div style="min-width:150px;font-family:sans-serif;line-height:1.4">
          <strong style="font-size:13px">${especie} ${animal.nombre}</strong><br/>
          <span style="color:#666;font-size:11px">${animal.especie}${animal.raza ? " · " + animal.raza : ""}</span><br/>
          <button
            onclick="window.__mapaOpenModal && window.__mapaOpenModal('${animal.id}')"
            style="margin-top:6px;padding:3px 10px;background:#f97316;color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px"
          >Ver ficha</button>
        </div>
      `, { maxWidth: 200 });

      marker.on("click", () => onSelect(animal.id));
      marker.addTo(mapRef.current);
      markersRef.current[animal.id] = marker;
    });

    // Ajustar vista
    const bounds = L.latLngBounds(
      conCoords.map((a) => [a.latitud as number, a.longitud as number])
    );
    mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }

  return (
    <div className="relative w-full h-full">
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
