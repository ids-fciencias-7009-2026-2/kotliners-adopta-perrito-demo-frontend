"use client";

import { useState, useEffect, useCallback } from "react";
import RangeSlider from "@/components/RangeSlider";
import { listarRazas, type FiltrosAnimales, type RazaResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";

const EDAD_MAX_DEFAULT = 20;
const DISTANCIA_MAX_DEFAULT = 100;

interface FiltroForm {
  busqueda: string;
  especie: string;
  sexo: string;
  esterilizado: boolean;
  codigoPostal: string;
  vacuna: string;
  sinPadecimientos: boolean;
  soloVacunados: boolean;
  ordenar: string;
  ordenDesc: boolean;
  edadMin: number;
  edadMax: number;
  distanciaKm: number;
  razaId: string;
}

const FILTRO_INICIAL: FiltroForm = {
  busqueda: "",
  especie: "",
  sexo: "",
  esterilizado: false,
  codigoPostal: "",
  vacuna: "",
  sinPadecimientos: false,
  soloVacunados: false,
  ordenar: "",
  ordenDesc: true,
  edadMin: 0,
  edadMax: EDAD_MAX_DEFAULT,
  distanciaKm: DISTANCIA_MAX_DEFAULT,
  razaId: "",
};

function toFiltrosBackend(form: FiltroForm): FiltrosAnimales {
  return {
    especie: form.especie || undefined,
    sexo: form.sexo || undefined,
    esterilizado: form.esterilizado || undefined,
    codigoPostal: form.codigoPostal.trim() || undefined,
    vacuna: form.vacuna.trim() || undefined,
    sinPadecimientos: form.sinPadecimientos || undefined,
    soloVacunados: form.soloVacunados || undefined,
    ordenar: form.ordenar || undefined,
    ordenDesc: form.ordenDesc,
    razaId: form.razaId || undefined,
    edadMinAnios: form.edadMin > 0 ? form.edadMin : undefined,
    edadMaxAnios: form.edadMax < EDAD_MAX_DEFAULT ? form.edadMax : undefined,
    distanciaKm: form.distanciaKm < DISTANCIA_MAX_DEFAULT ? form.distanciaKm : undefined,
  };
}

interface FiltrosPanelProps {
  onFiltrosChange: (filtros: FiltrosAnimales) => void;
  onBusquedaChange: (busqueda: string) => void;
}

/**
 * Panel de filtros reutilizable — mismo que /explorar pero como componente independiente.
 */
export default function FiltrosPanel({ onFiltrosChange, onBusquedaChange }: FiltrosPanelProps) {
  const [filtroForm, setFiltroForm] = useState<FiltroForm>(FILTRO_INICIAL);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [razasDisponibles, setRazasDisponibles] = useState<RazaResponse[]>([]);
  const [especieAnterior, setEspecieAnterior] = useState("");
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosAnimales>({});

  useEffect(() => {
    if (filtroForm.especie === especieAnterior) return;
    setEspecieAnterior(filtroForm.especie);
    if (!filtroForm.especie) {
      setRazasDisponibles([]);
      setFiltroForm((f) => ({ ...f, razaId: "" }));
      return;
    }
    const token = getToken();
    if (!token) return;
    listarRazas(token, filtroForm.especie.toUpperCase()).then((res) => {
      if (res.ok) setRazasDisponibles(res.data.sort((a, b) => a.nombreEs.localeCompare(b.nombreEs)));
    });
    setFiltroForm((f) => ({ ...f, razaId: "" }));
  }, [filtroForm.especie]);

  useEffect(() => {
    onBusquedaChange(filtroForm.busqueda);
  }, [filtroForm.busqueda]);

  const aplicarFiltros = useCallback(() => {
    const f = toFiltrosBackend(filtroForm);
    setFiltrosAplicados(f);
    onFiltrosChange(f);
  }, [filtroForm, onFiltrosChange]);

  function limpiarFiltros() {
    setFiltroForm(FILTRO_INICIAL);
    setFiltrosAplicados({});
    onFiltrosChange({});
  }

  const hayFiltrosActivos = Object.values(filtrosAplicados).some((v) => v !== undefined && v !== false);

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex gap-2">
        <label className="input input-bordered flex items-center gap-2 flex-1">
          <Search size={16} className="text-base-content/40" />
          <input type="text" placeholder="Buscar por nombre o raza..."
            value={filtroForm.busqueda}
            onChange={(e) => setFiltroForm((f) => ({ ...f, busqueda: e.target.value }))}
            className="grow" />
          {filtroForm.busqueda && (
            <button onClick={() => setFiltroForm((f) => ({ ...f, busqueda: "" }))}>
              <X size={14} className="text-base-content/40" />
            </button>
          )}
        </label>
        <button onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn btn-square btn-outline ${filtersOpen || hayFiltrosActivos ? "btn-primary" : ""}`}>
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {filtersOpen && (
        <div className="flex flex-col gap-4 p-4 bg-base-200 rounded-box">

          {/* Especie + Sexo */}
          <div className="grid grid-cols-2 gap-2">
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Especie</span></label>
              <select className="select select-bordered select-sm" value={filtroForm.especie}
                onChange={(e) => setFiltroForm((f) => ({ ...f, especie: e.target.value }))}>
                <option value="">Todos</option>
                <option value="PERRO">Perro</option>
                <option value="GATO">Gato</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label py-0"><span className="label-text text-xs">Sexo</span></label>
              <select className="select select-bordered select-sm" value={filtroForm.sexo}
                onChange={(e) => setFiltroForm((f) => ({ ...f, sexo: e.target.value }))}>
                <option value="">Todos</option>
                <option value="MACHO">Macho</option>
                <option value="HEMBRA">Hembra</option>
              </select>
            </div>
          </div>

          {/* Raza */}
          <div className="form-control">
            <label className="label py-0"><span className="label-text text-xs">Raza</span></label>
            <select className="select select-bordered select-sm" value={filtroForm.razaId}
              disabled={!filtroForm.especie}
              onChange={(e) => setFiltroForm((f) => ({ ...f, razaId: e.target.value }))}>
              <option value="">{filtroForm.especie ? "Todas las razas" : "Selecciona especie primero"}</option>
              {razasDisponibles.map((r) => (
                <option key={r.id} value={r.id}>{r.nombreEs}</option>
              ))}
            </select>
          </div>

          {/* Ordenar */}
          <div className="form-control">
            <label className="label py-0"><span className="label-text text-xs">Ordenar por</span></label>
            <div className="flex gap-1">
              <select className="select select-bordered select-sm flex-1" value={filtroForm.ordenar}
                onChange={(e) => setFiltroForm((f) => ({ ...f, ordenar: e.target.value }))}>
                <option value="">Más reciente</option>
                <option value="nombre">Nombre</option>
                <option value="fechaNacimiento">Edad</option>
                <option value="distancia">Distancia</option>
              </select>
              <button type="button"
                title={filtroForm.ordenDesc ? "Descendente" : "Ascendente"}
                onClick={() => setFiltroForm((f) => ({ ...f, ordenDesc: !f.ordenDesc }))}
                className="btn btn-sm btn-square btn-outline">
                <ArrowUpDown size={14} className={filtroForm.ordenDesc ? "text-primary" : "text-base-content/40"} />
              </button>
            </div>
          </div>

          {/* Rango de edad */}
          <div className="form-control gap-1">
            <label className="label py-0">
              <span className="label-text text-xs">Rango de edad</span>
              <span className="label-text-alt text-xs text-base-content/50">
                {filtroForm.edadMin === 0 && filtroForm.edadMax === EDAD_MAX_DEFAULT
                  ? "Cualquier edad"
                  : `${filtroForm.edadMin} – ${filtroForm.edadMax === EDAD_MAX_DEFAULT ? `${EDAD_MAX_DEFAULT}+` : filtroForm.edadMax} años`}
              </span>
            </label>
            <RangeSlider
              min={0} max={EDAD_MAX_DEFAULT} valueMin={filtroForm.edadMin} valueMax={filtroForm.edadMax} step={1}
              formatValue={(v: number) => v === EDAD_MAX_DEFAULT ? `${v}+` : `${v}`}
              onChange={(minV: number, maxV: number) => setFiltroForm((f) => ({ ...f, edadMin: minV, edadMax: maxV }))}
            />
          </div>

          {/* Distancia */}
          <div className="form-control gap-1">
            <label className="label py-0">
              <span className="label-text text-xs">Distancia máxima</span>
              <span className="label-text-alt text-xs font-medium text-primary">
                {filtroForm.distanciaKm >= DISTANCIA_MAX_DEFAULT ? "Sin límite" : `${filtroForm.distanciaKm} km`}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-base-content/40">1</span>
              <input type="range" min={1} max={DISTANCIA_MAX_DEFAULT} step={1}
                value={filtroForm.distanciaKm}
                onChange={(e) => setFiltroForm((f) => ({ ...f, distanciaKm: Number(e.target.value) }))}
                className="range range-xs range-accent flex-1" />
              <span className="text-xs text-base-content/40">100km</span>
            </div>
            {filtroForm.distanciaKm < DISTANCIA_MAX_DEFAULT && (
              <p className="text-xs text-base-content/40">Basado en el CP de tu perfil</p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="checkbox checkbox-sm checkbox-primary"
                checked={filtroForm.esterilizado}
                onChange={(e) => setFiltroForm((f) => ({ ...f, esterilizado: e.target.checked }))} />
              <span className="text-sm">Solo esterilizados</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="checkbox checkbox-sm checkbox-primary"
                checked={filtroForm.sinPadecimientos}
                onChange={(e) => setFiltroForm((f) => ({ ...f, sinPadecimientos: e.target.checked }))} />
              <span className="text-sm">Sin padecimientos</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="checkbox checkbox-sm checkbox-success"
                checked={filtroForm.soloVacunados}
                onChange={(e) => setFiltroForm((f) => ({ ...f, soloVacunados: e.target.checked }))} />
              <span className="text-sm">Con al menos una vacuna</span>
            </label>
          </div>

          {/* Vacuna específica */}
          <div className="form-control">
            <label className="label py-0"><span className="label-text text-xs">Vacuna específica</span></label>
            <input type="text" placeholder="Ej: Rabia, Moquillo..."
              className="input input-bordered input-sm"
              value={filtroForm.vacuna}
              onChange={(e) => setFiltroForm((f) => ({ ...f, vacuna: e.target.value }))} />
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button onClick={aplicarFiltros} className="btn btn-primary btn-sm flex-1">
              Aplicar filtros
            </button>
            {hayFiltrosActivos && (
              <button onClick={limpiarFiltros} className="btn btn-ghost btn-sm gap-1">
                <X size={14} /> Limpiar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
