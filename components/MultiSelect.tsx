"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface MultiSelectProps {
  /** Opciones del catalogo disponibles */
  opciones: string[];
  /** Valores seleccionados actualmente */
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  placeholder?: string;
}

/**
 * Input de seleccion multiple con:
 * - Tags con boton × para quitar
 * - Dropdown con opciones filtradas del catalogo
 * - Opcion de agregar uno nuevo si no existe en el catalogo
 */
export default function MultiSelect({ opciones, values, onChange, label, placeholder = "Buscar o agregar..." }: MultiSelectProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtradas = opciones.filter(
    (o) => o.toLowerCase().includes(input.toLowerCase()) && !values.includes(o)
  );

  const puedeAgregar = input.trim() && !opciones.includes(input.trim()) && !values.includes(input.trim());

  function add(val: string) {
    const v = val.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
    setOpen(false);
  }

  function remove(val: string) {
    onChange(values.filter((v) => v !== val));
  }

  return (
    <div className="form-control" ref={containerRef}>
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}

      {/* Input con tags */}
      <div
        className="input input-bordered min-h-10 h-auto flex flex-wrap gap-1 items-center cursor-text py-1.5 px-2"
        onClick={() => { setOpen(true); containerRef.current?.querySelector("input")?.focus(); }}
      >
        {values.map((v) => (
          <span key={v} className="badge badge-primary gap-1 shrink-0">
            {v}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(v); }}
              className="hover:text-primary-content/70"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          className="outline-none bg-transparent flex-1 min-w-24 text-sm"
          value={input}
          placeholder={values.length === 0 ? placeholder : ""}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); if (filtradas[0]) add(filtradas[0]); else if (puedeAgregar) add(input); }
            if (e.key === "Backspace" && !input && values.length > 0) remove(values[values.length - 1]);
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (filtradas.length > 0 || puedeAgregar) && (
        <div className="absolute z-50 mt-1 bg-base-100 border border-base-300 rounded-box shadow-lg max-h-48 overflow-y-auto w-full">
          {filtradas.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => add(o)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 transition"
            >
              {o}
            </button>
          ))}
          {puedeAgregar && (
            <button
              type="button"
              onClick={() => add(input)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 transition text-primary font-medium border-t border-base-200"
            >
              + Agregar &ldquo;{input.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
