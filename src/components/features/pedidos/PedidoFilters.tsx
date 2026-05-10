"use client";

import type { PedidoEstado } from "@/types/ui.types";

export type FiltroEstado = "todos" | PedidoEstado;

interface PedidoFiltersProps {
  filtroActivo: FiltroEstado;
  onChange: (filtro: FiltroEstado) => void;
  conteos: Record<FiltroEstado, number>;
}

const TABS: { key: FiltroEstado; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "abierto", label: "Abiertos" },
  { key: "en_camino", label: "En camino" },
  { key: "listo", label: "Listos" },
  { key: "entregado", label: "Entregados" },
  { key: "cancelado", label: "Cancelados" },
];

export function PedidoFilters({ filtroActivo, onChange, conteos }: PedidoFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map(({ key, label }) => {
        const isActive = filtroActivo === key;
        const count = conteos[key] ?? 0;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="px-3 py-1.5 rounded-lg backdrop-blur-md text-sm font-medium transition-all duration-200"
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(to right, rgba(139,92,246,0.20), rgba(59,130,246,0.10))",
                    border: "1px solid rgba(139,92,246,0.40)",
                    boxShadow: "0 0 20px rgba(139,92,246,0.25)",
                    color: "#FFFFFF",
                  }
                : {
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.70)",
                  }
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.10)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.70)";
              }
            }}
          >
            {label}
            <span
              className="ml-1.5 text-xs"
              style={{ color: isActive ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.40)" }}
            >
              · {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
