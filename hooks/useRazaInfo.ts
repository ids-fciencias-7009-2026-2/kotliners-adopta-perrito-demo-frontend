"use client";

import { useEffect, useState } from "react";

/** Informacion de una raza obtenida de la API externa */
export interface RazaInfo {
  nombre: string;
  temperamento: string | null;
  descripcion: string | null;
  esperanzaVida: string | null;
  nivelEnergia: string | null;
  pesoPromedio: string | null;
  imagenUrl: string | null;
}

type Estado = "cargando" | "ok" | "no_encontrado" | "error";

const DOG_API = "https://api.thedogapi.com/v1";
const CAT_API = "https://api.thecatapi.com/v1";

/**
 * Hook que consulta la API externa de razas (The Dog API / The Cat API)
 * segun la especie y nombre de raza del animal.
 *
 * Fallback: si la API no responde o no encuentra la raza, estado queda
 * en "no_encontrado" o "error" y el componente muestra solo datos propios.
 *
 * @param especie  "PERRO" o "GATO" (o variantes en minusculas)
 * @param raza     Nombre de la raza a buscar. Null = no buscar.
 */
export function useRazaInfo(especie: string, raza: string | null): { info: RazaInfo | null; estado: Estado } {
  const [info, setInfo] = useState<RazaInfo | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");

  useEffect(() => {
    if (!raza || raza.trim() === "") {
      setEstado("no_encontrado");
      return;
    }

    const esPerro = especie.toUpperCase().includes("PERRO") || especie.toUpperCase().includes("DOG");
    const baseUrl = esPerro ? DOG_API : CAT_API;

    setEstado("cargando");
    setInfo(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(`${baseUrl}/breeds/search?q=${encodeURIComponent(raza.trim())}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        clearTimeout(timeoutId);
        if (!data || data.length === 0) {
          setEstado("no_encontrado");
          return;
        }
        const r = data[0];
        setInfo({
          nombre: r.name ?? raza,
          temperamento: r.temperament ?? null,
          descripcion: r.description ?? null,
          esperanzaVida: r.life_span ?? null,
          nivelEnergia: r.energy_level != null ? `${r.energy_level} / 5` : null,
          pesoPromedio: r.weight?.metric ? `${r.weight.metric} kg` : null,
          imagenUrl: r.image?.url ?? null,
        });
        setEstado("ok");
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
          // Timeout — fallback silencioso
          setEstado("error");
        } else {
          setEstado("error");
        }
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [especie, raza]);

  return { info, estado };
}
