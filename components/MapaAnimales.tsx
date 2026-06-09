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

function getL(): any {
  return typeof window !== "undefined" ? (window as any).L : null;
}

export default function MapaAnimales({ animales, selectedId, onSelect, onOpenModal }: Props) {
  const mapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const conCoords = animales.filter((a) => a.latitud != null && a.longitud != null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Esperar a que Leaflet cargue desde CDN
    const waitForL = () => new Promise<void>((resolve) => {
      if (getL()?.map) { resolve(); return; }
      const interval = setInterval(() => {
        if (getL()?.map) { clearInterval(interval); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(interval); resolve(); }, 5000);
    });

    waitForL().then(() => {
      const L = getL();
      if (!L) return;
      const hasCluster = typeof L.markerClusterGroup === "function";

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current!, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: true,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // Limpiar marcadores anteriores
      if (clusterRef.current) map.removeLayer(clusterRef.current);
      Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
      markersRef.current = {};

      // Crear cluster group (si el plugin está disponible)
      const cluster = hasCluster ? L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: false,
        disableClusteringAtZoom: 16,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (c: any) => {
          const count = c.getChildCount();
          return L.divIcon({
            className: "",
            html: `<div style="background:#65c3c8;color:white;border:3px solid white;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${count}</div>`,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          });
        },
      }) : null;

      conCoords.forEach((animal, idx) => {
        const isSelected = animal.id === selectedId;
        const foto = animal.fotoPortada;
        // Tiny offset so markers at exact same coords don't stack at max zoom
        const jitter = 0.0003;
        const angle = (idx * 137.5) * (Math.PI / 180); // golden angle for even distribution
        const lat = (animal.latitud as number) + jitter * Math.cos(angle);
        const lng = (animal.longitud as number) + jitter * Math.sin(angle);
        const icon = L.divIcon({
          className: "",
          html: foto
            ? `<div style="width:${isSelected ? 48 : 38}px;height:${isSelected ? 48 : 38}px;border-radius:50%;border:3px solid ${isSelected ? '#7c3aed' : 'white'};overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><img src="${foto}" style="width:100%;height:100%;object-fit:cover"/></div>`
            : `<div style="background:${isSelected ? '#7c3aed' : '#65c3c8'};border:2px solid white;border-radius:50% 50% 50% 0;width:${isSelected ? 36 : 28}px;height:${isSelected ? 36 : 28}px;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
          iconSize: isSelected ? [48, 48] : [38, 38],
          iconAnchor: isSelected ? [24, 48] : [19, 38],
          popupAnchor: [0, isSelected ? -48 : -38],
        });

        const marker = L.marker([lat, lng], { icon });
        marker.bindPopup(`
          <div style="min-width:150px;font-family:sans-serif">
            <strong style="font-size:14px">${animal.nombre}</strong><br/>
            <span style="color:#666;font-size:12px">${animal.raza || animal.especie}</span><br/>
            <button onclick="window.__mapaOpenModal&&window.__mapaOpenModal('${animal.id}')"
              style="margin-top:8px;padding:4px 10px;background:#65c3c8;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px">Ver ficha</button>
          </div>`, { maxWidth: 220 });
        marker.on("click", () => onSelect(animal.id));
        cluster ? cluster.addLayer(marker) : marker.addTo(map);
        markersRef.current[animal.id] = marker;
      });

      if (cluster) map.addLayer(cluster);
      clusterRef.current = cluster;

      if (conCoords.length > 0) {
        const bounds = L.latLngBounds(conCoords.map((a) => [a.latitud as number, a.longitud as number]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    });
  }, [animales]);

  // Actualizar ícono al seleccionar
  useEffect(() => {
    if (!mapRef.current) return;
    const L = getL();
    if (!L) return;
    Object.entries(markersRef.current).forEach(([id, marker]: [string, any]) => {
      const isSelected = id === selectedId;
      const animal = conCoords.find((a) => a.id === id);
      const foto = animal?.fotoPortada;
      const icon = L.divIcon({
        className: "",
        html: foto
          ? `<div style="width:${isSelected ? 48 : 38}px;height:${isSelected ? 48 : 38}px;border-radius:50%;border:3px solid ${isSelected ? '#7c3aed' : 'white'};overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><img src="${foto}" style="width:100%;height:100%;object-fit:cover"/></div>`
          : `<div style="background:${isSelected ? '#7c3aed' : '#65c3c8'};border:2px solid white;border-radius:50% 50% 50% 0;width:${isSelected ? 36 : 28}px;height:${isSelected ? 36 : 28}px;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
        iconSize: isSelected ? [48, 48] : [38, 38],
        iconAnchor: isSelected ? [24, 48] : [19, 38],
        popupAnchor: [0, isSelected ? -48 : -38],
      });
      marker.setIcon(icon);
      if (isSelected) { mapRef.current.panTo(marker.getLatLng(), { animate: true }); marker.openPopup(); }
    });
  }, [selectedId]);

  useEffect(() => {
    (window as any).__mapaOpenModal = onOpenModal;
    return () => { delete (window as any).__mapaOpenModal; };
  }, [onOpenModal]);

  useEffect(() => {
    const observer = new ResizeObserver(() => { mapRef.current?.invalidateSize(); });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full z-0">
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
