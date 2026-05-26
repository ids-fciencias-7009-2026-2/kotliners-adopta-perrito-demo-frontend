"use client";

interface RangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  formatValue?: (v: number) => string;
  onChange: (min: number, max: number) => void;
}

/**
 * Slider de rango doble — dos pulgares sobre el mismo track.
 * Implementado con dos input[type=range] superpuestos.
 */
export default function RangeSlider({
  min, max, valueMin, valueMax, step = 1,
  formatValue = (v: number) => String(v),
  onChange,
}: RangeSliderProps) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1">
      {/* Valores actuales */}
      <div className="flex justify-between text-xs text-primary font-medium">
        <span>{formatValue(valueMin)}</span>
        <span>{formatValue(valueMax)}</span>
      </div>

      {/* Track + dos thumbs */}
      <div className="relative h-5 flex items-center">
        {/* Track fondo */}
        <div className="absolute w-full h-1 rounded-full bg-base-300" />
        {/* Track activo */}
        <div
          className="absolute h-1 rounded-full bg-primary"
          style={{ left: `${pct(valueMin)}%`, width: `${pct(valueMax) - pct(valueMin)}%` }}
        />
        {/* Pulgar izquierdo (min) */}
        <input
          type="range" min={min} max={max} step={step} value={valueMin}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), valueMax - step);
            onChange(v, valueMax);
          }}
          className="absolute w-full appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-base-100
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-base-100
            [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: valueMin > max - step ? 5 : 3 }}
        />
        {/* Pulgar derecho (max) */}
        <input
          type="range" min={min} max={max} step={step} value={valueMax}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), valueMin + step);
            onChange(valueMin, v);
          }}
          className="absolute w-full appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-base-100
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-secondary
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-base-100
            [&::-moz-range-thumb]:cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Etiquetas extremos */}
      <div className="flex justify-between text-xs text-base-content/40">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
