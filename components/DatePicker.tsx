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
        onClick={() => setOpen((o) => !o)}
        className={`input input-bordered w-full text-left ${!display ? "text-base-content/40" : ""} ${error ? "input-error" : ""}`}
      >
        {display || "Seleccióna una fecha"}
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1">
          <calendar-date
            ref={calendarRef}
            class="cally bg-base-100 text-base-content border border-base-300 rounded-box shadow-lg"
            value={value || undefined}
            max={maxAttr}
          >
            <svg slot="previous" aria-label="Previous" className="fill-current size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <svg slot="next" aria-label="Next" className="fill-current size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
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
