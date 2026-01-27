import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Plus, List, Check } from "lucide-react";

interface Props {
  open?: number;
  inProgress?: number;
  done?: number;
}

function Value({ value }: { value?: number }) {
  if (value === undefined) {
    return <span className="text-indigo-300 text-3xl font-bold">—</span>;
  }

  return <span className="text-3xl font-bold text-white">{value}</span>;
}

export function DashboardCards({ open, inProgress, done }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ABERTOS */}
      <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 p-6 shadow-lg hover:shadow-xl transition min-h-[160px]">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-indigo-300/70 font-semibold">
              Chamados Abertos
            </p>
            <div className="mt-4">
              <Value value={open} />
            </div>
            <p className="text-sm text-indigo-300/60 mt-2">
              Aguardando atendimento
            </p>
          </div>
          <div className="flex-none bg-rose-900/30 p-3 rounded-lg">
            <Plus className="w-6 h-6 text-rose-300" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <TrendingUp className="w-4 h-4 text-rose-300" />
          <span className="text-rose-300 font-medium">+12% vs semana</span>
        </div>
      </div>

      {/* EM ATENDIMENTO */}
      <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 p-6 shadow-lg hover:shadow-xl transition min-h-[160px]">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-indigo-300/70 font-semibold">
              Em Atendimento
            </p>
            <div className="mt-4">
              <Value value={inProgress} />
            </div>
            <p className="text-sm text-indigo-300/60 mt-2">
              Sendo processados agora
            </p>
          </div>
          <div className="flex-none bg-amber-900/30 p-3 rounded-lg">
            <List className="w-6 h-6 text-amber-300" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <TrendingDown className="w-4 h-4 text-amber-300" />
          <span className="text-amber-300 font-medium">-5% vs semana</span>
        </div>
      </div>

      {/* FINALIZADOS */}
      <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 p-6 shadow-lg hover:shadow-xl transition min-h-[160px]">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-indigo-300/70 font-semibold">
              Finalizados
            </p>
            <div className="mt-4">
              <Value value={done} />
            </div>
            <p className="text-sm text-indigo-300/60 mt-2">
              Tarefas concluídas
            </p>
          </div>
          <div className="flex-none bg-emerald-900/30 p-3 rounded-lg">
            <Check className="w-6 h-6 text-emerald-300" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <TrendingUp className="w-4 h-4 text-emerald-300" />
          <span className="text-emerald-300 font-medium">+18% vs semana</span>
        </div>
      </div>
    </div>
  );
}
