"use client";

import { useEffect, useRef, useState } from "react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  max?: string;
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function formatDisplay(val: string): string {
  if (!val) return "";
  const [y, m, d] = val.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

export default function DatePicker({ value, onChange, label, error, required = false, max }: DatePickerProps) {
  const calendarRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState(() => formatDisplay(value));

  const maxDate = max || new Date().toISOString().split("T")[0];
  const maxYear = parseInt(maxDate.split("-")[0]);
  const minYear = maxYear - 25;

  // Mes/año visible en el calendario
  const [viewYear, setViewYear] = useState(() => value ? parseInt(value.split("-")[0]) : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => value ? parseInt(value.split("-")[1]) - 1 : new Date().getMonth());

  // Generar el valor de "focusedDate" para posicionar el calendario
  const focusedDate = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-15`;

  useEffect(() => {
    if (!open) return;
    let cleanup: (() => void) | undefined;

    async function init() {
      await import("cally");
      await customElements.whenDefined("calendar-date");
      requestAnimationFrame(() => {
        const calendar = calendarRef.current;
        if (!calendar) return;
        const handleChange = () => {
          const val: string = calendar.value;
          if (!val) return;
          onChange(val);
          setDisplay(formatDisplay(val));
          setOpen(false);
        };
        calendar.addEventListener("change", handleChange);
        cleanup = () => calendar.removeEventListener("change", handleChange);
      });
    }

    init();
    return () => { cleanup?.(); };
  }, [open, viewYear, viewMonth]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleMonthChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setViewMonth(parseInt(e.target.value));
  }

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setViewYear(parseInt(e.target.value));
  }

  return (
    <div className="form-control relative" ref={containerRef}>
      {label && (
        <label className="label">
          <span className="label-text">
            {label}{required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setOpen((o) => !o); }}
        className={`input input-bordered w-full text-left ${!display ? "text-base-content/40" : ""} ${error ? "input-error" : ""}`}
      >
        {display || "Selecciona una fecha"}
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-box shadow-lg p-4">
          {/* Selectores de mes y año */}
          <div className="flex gap-2 mb-3">
            <select value={viewMonth} onChange={(e) => { setViewMonth(parseInt(e.target.value)); e.target.blur(); }} className="select select-bordered select-xs flex-1">
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={viewYear} onChange={(e) => { setViewYear(parseInt(e.target.value)); e.target.blur(); }} className="select select-bordered select-xs">
              {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <calendar-date
            ref={calendarRef}
            class="cally"
            value={value || undefined}
            focusedDate={focusedDate}
            max={maxDate}
            locale="es-MX"
          >
            <button type="button" slot="previous" aria-label="Mes anterior" className="btn btn-xs btn-circle border-none bg-base-200 hover:bg-base-300 mx-1"
              onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button type="button" slot="next" aria-label="Mes siguiente" className="btn btn-xs btn-circle border-none bg-base-200 hover:bg-base-300 mx-1"
              onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <calendar-month />
          </calendar-date>
        </div>
      )}

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
