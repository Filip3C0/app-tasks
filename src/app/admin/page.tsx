"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuthGuard } from "@/components/auth-guard";

import { Sidebar } from "./components/Sidebar";
import { DashboardCards } from "./components/DashboarCards";
import { BuildingFilter } from "./components/BuildingFilter";
import { TechnicianFilter } from "./components/TechnicianFilter";
import { TicketsByBuildingChart } from "./components/TicketsByBuildingChart";
import { ReportModal } from "./components/ReportModal";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, RefreshCw, BarChart } from "lucide-react";

/* ================= TYPES ================= */

type TicketStatus = "aberto" | "em_atendimento" | "finalizado";

type Ticket = {
  id: string;
  code: string;
  buildingId: string;
  status: TicketStatus;
  assignedTo?: {
    uid: string;
    name: string;
  } | null;
};

type Building = {
  id: string;
  name: string;
};

/* ================= PAGE ================= */

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState("todos");
  const [technician, setTechnician] = useState("todos");
  const [reportModalOpen, setReportModalOpen] = useState(false);

  /* ================= REALTIME TICKETS ================= */

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tickets"), (snap) => {
      setTickets(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Ticket, "id">),
        })),
      );
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* ================= REALTIME BUILDINGS ================= */

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "buildings"), (snap) => {
      setBuildings(
        snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
        })),
      );
    });

    return () => unsub();
  }, []);

  /* ================= FILTERED DATA ================= */

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (building !== "todos" && t.buildingId !== building) return false;

      if (technician !== "todos" && t.assignedTo?.uid !== technician)
        return false;

      return true;
    });
  }, [tickets, building, technician]);

  /* ================= KPIs ================= */

  const open = filteredTickets.filter((t) => t.status === "aberto").length;

  const inProgress = filteredTickets.filter(
    (t) => t.status === "em_atendimento",
  ).length;

  const done = filteredTickets.filter((t) => t.status === "finalizado").length;

  const hasData = open + inProgress + done > 0;

  /* ================= UI ================= */

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <Sidebar />

        <ReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          tickets={tickets}
          buildings={buildings}
        />

        <main className="flex-1 flex flex-col">
          {/* HEADER SECTION */}
          <div className="border-b border-indigo-500/30 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
            <div className="px-10 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-base text-indigo-300/70 mt-2">
                    Visão geral dos chamados por status, prédio e técnico
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT - SCROLLABLE */}
          <div className="flex-1 overflow-auto">
            <div className="p-10 space-y-10">
              {/* KPI CARDS */}
              <section>
                <DashboardCards
                  open={loading ? undefined : open}
                  inProgress={loading ? undefined : inProgress}
                  done={loading ? undefined : done}
                />
              </section>

              {/* FILTERS & CHARTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 auto-rows-max">
                {/* LEFT COLUMN - FILTERS */}
                <div className="lg:col-span-1 space-y-8">
                  {/* BUILDING FILTER */}
                  <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition min-h-[160px]">
                    <div className="space-y-6">
                      <div>
                        <h2 className="font-semibold text-indigo-300 text-lg">
                          Filtrar por Prédio
                        </h2>
                        <p className="text-sm text-indigo-300/60 mt-2">
                          Selecione um prédio
                        </p>
                      </div>

                      <BuildingFilter
                        value={building}
                        onChange={setBuilding}
                        buildings={buildings}
                      />
                    </div>
                  </div>

                  {/* TECHNICIAN FILTER */}
                  <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition min-h-40">
                    <div className="space-y-6">
                      <div>
                        <h2 className="font-semibold text-indigo-300 text-lg">
                          Filtrar por Técnico
                        </h2>
                        <p className="text-sm text-indigo-300/60 mt-2">
                          Selecione um técnico
                        </p>
                      </div>

                      <TechnicianFilter
                        value={technician}
                        onChange={setTechnician}
                        tickets={tickets}
                      />
                    </div>
                  </div>

                  {/* ACTIONS CARD */}
                  <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition min-h-[160px]">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-indigo-300 text-lg">
                        Ações Rápidas
                      </h3>

                      <Button
                        onClick={() => setReportModalOpen(true)}
                        className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-500 hover:to-indigo-600 transition text-base shadow-lg"
                      >
                        Gerar Relatório
                      </Button>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - CHART & STATS */}
                <div className="lg:col-span-3 space-y-8">
                  {/* CHART */}
                  <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition min-h-[300px]">
                    <div className="space-y-8">
                      <div>
                        <h2 className="font-semibold text-indigo-300 text-xl">
                          Chamados por Prédio
                        </h2>
                        <p className="text-base text-indigo-300/60 mt-2">
                          Distribuição de chamados nos últimos 30 dias
                        </p>
                      </div>

                      {!hasData ? (
                        <div className="flex items-center justify-center py-24">
                          <div className="text-center">
                            <div className="mb-6 opacity-20">
                              <BarChart className="w-20 h-20 mx-auto" />
                            </div>
                            <p className="text-base text-indigo-300/60">
                              Sem dados para exibir
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-96">
                          <TicketsByBuildingChart tickets={filteredTickets} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STATS ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition min-h-[160px]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-wide text-indigo-300/60 font-semibold">
                            Taxa de Conclusão
                          </p>
                          <p className="text-4xl font-bold text-green-400 mt-4">
                            {hasData
                              ? Math.round(
                                  (done / (open + inProgress + done)) * 100,
                                )
                              : 0}
                            %
                          </p>
                        </div>
                        <div className="opacity-30">
                          <Check className="w-12 h-12 text-green-400" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition min-h-[160px]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-wide text-indigo-300/60 font-semibold">
                            Total em Aberto
                          </p>
                          <p className="text-4xl font-bold text-red-400 mt-4">
                            {loading ? "—" : open}
                          </p>
                        </div>
                        <div className="opacity-30">
                          <Clock className="w-12 h-12 text-red-400" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition min-h-[160px]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-wide text-indigo-300/60 font-semibold">
                            Em Atendimento
                          </p>
                          <p className="text-4xl font-bold text-amber-400 mt-4">
                            {loading ? "—" : inProgress}
                          </p>
                        </div>
                        <div className="opacity-30">
                          <RefreshCw className="w-12 h-12 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
