'use client';

import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  fixedWidth?: boolean;
}

// se le da unos pocos pixeles más para que no se ensanche a la hora de seleccionar
// el label más largo
const FIXED_WIDTH_BUFFER_PX = 12;

export default function Select({
  value,
  onChange,
  options,
  className = '',
  fixedWidth = false,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const longestOption = fixedWidth
    ? options.reduce(
        (max, opt) => (opt.label.length > max.label.length ? opt : max),
        options[0],
      )
    : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buttonBase = `flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-brand-500 focus:border-transparent ${className}`;

  return (
    <div ref={ref} className={fixedWidth ? 'relative inline-grid' : 'relative'}>
      {/* fijar la anchura al label más largo */}
      {fixedWidth && longestOption && (
        <div
          aria-hidden="true"
          className={`invisible pointer-events-none col-start-1 row-start-1 flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium ${className}`}
          style={{ paddingRight: `${FIXED_WIDTH_BUFFER_PX}px` }}
        >
          <span className="whitespace-nowrap">{longestOption.label}</span>
          <span className="w-3.5 shrink-0" />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={
          fixedWidth
            ? `col-start-1 row-start-1 w-full ${buttonBase}`
            : buttonBase
        }
      >
        <span className="whitespace-nowrap">{selected?.label ?? ''}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 top-full mt-1 min-w-full bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden py-1">
          {options.map((opt) => (
            <li
              key={opt.value}
              onMouseDown={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer select-none transition-colors ${
                opt.value === value
                  ? 'bg-brand-100 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
