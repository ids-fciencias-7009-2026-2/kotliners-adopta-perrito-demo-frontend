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

function formatDisplay(val: string): string {
  if (!val) return "";
  const [y, m, d] = val.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function DatePicker({ value, onChange, label, error, required = false, max }: DatePickerProps) {
  const calendarRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState(() => formatDisplay(value));

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
  }, [open]);

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

  const maxAttr = max || new Date().toISOString().split("T")[0];

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
        {display || "Seleccióna una fecha"}
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1">
          <calendar-date
            ref={calendarRef}
            class="cally bg-base-100 text-base-content border border-base-300 rounded-box shadow-lg p-4"
            value={value || undefined}
            max={maxAttr}
          >
            <button type="button" slot="previous" aria-label="Mes anterior" className="btn btn-xs btn-circle border-none bg-base-200 hover:bg-base-300 mx-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button type="button" slot="next" aria-label="Mes siguiente" className="btn btn-xs btn-circle border-none bg-base-200 hover:bg-base-300 mx-1">
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
