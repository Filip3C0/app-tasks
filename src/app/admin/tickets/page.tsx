"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuthGuard } from "@/components/auth-guard";

import { Sidebar } from "../components/Sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search } from "lucide-react";

type TicketStatus = "aberto" | "em_atendimento" | "finalizado";

type Ticket = {
  id: string;
  code: string;
  requester: string;
  sector?: string;
  room?: string;
  description?: string;
  buildingId: string;
  status: TicketStatus;
  assignedTo?: {
    uid: string;
    name: string;
  } | null;
  createdAt?: { seconds: number; nanoseconds: number } | null;
  solvedAt?: { seconds: number; nanoseconds: number } | null;
};

type Building = {
  id: string;
  name: string;
};

const statusLabel: Record<TicketStatus, string> = {
  aberto: "Aberto",
  em_atendimento: "Em atendimento",
  finalizado: "Finalizado",
};

const statusTone: Record<TicketStatus, string> = {
  aberto: "bg-red-600/20 text-red-200 border border-red-500/40",
  em_atendimento: "bg-amber-500/20 text-amber-100 border border-amber-400/40",
  finalizado: "bg-green-600/20 text-green-200 border border-green-500/40",
};

function formatDate(ts?: { seconds: number; nanoseconds: number } | null) {
  if (!ts) return "—";
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "todos">("todos");
  const [building, setBuilding] = useState<string>("todos");
  const [loading, setLoading] = useState(true);

  /* ================= REALTIME COLLECTIONS ================= */

  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(collection(db as any, "tickets"), (snap) => {
      const data = snap.docs
        .map((d) => {
          const docData = d.data() as any;
          return {
            id: d.id,
            code: docData.code ?? d.id,
            requester: docData.requester?.name ?? docData.requester ?? "—",
            sector: docData.sector ?? "",
            room: docData.room ?? "",
            description: docData.description ?? "",
            buildingId: docData.buildingId ?? "",
            status: (docData.status as TicketStatus) ?? "aberto",
            assignedTo: docData.assignedTo ?? null,
            createdAt: docData.createdAt ?? null,
            solvedAt: docData.solvedAt ?? null,
          } satisfies Ticket;
        })
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds ?? 0;
          const bTime = b.createdAt?.seconds ?? 0;
          return bTime - aTime;
        });

      setTickets(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(collection(db as any, "buildings"), (snap) => {
      setBuildings(
        snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
        })),
      );
    });

    return () => unsub();
  }, []);

  const buildingNameMap = useMemo(() => {
    return buildings.reduce<Record<string, string>>((acc, b) => {
      acc[b.id] = b.name;
      return acc;
    }, {});
  }, [buildings]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tickets.filter((t) => {
      const matchStatus = status === "todos" || t.status === status;
      const matchBuilding = building === "todos" || t.buildingId === building;
      const matchSearch =
        term.length === 0 ||
        [t.code, t.requester, t.sector, t.room, t.description]
          .filter(Boolean)
          .some((field) => field?.toLowerCase().includes(term));

      return matchStatus && matchBuilding && matchSearch;
    });
  }, [tickets, status, building, search]);

  const emptyState = !loading && filtered.length === 0;

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-linear-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
        <Sidebar />

        <main className="flex-1 flex flex-col">
          {/* HEADER */}
          <div className="border-b border-indigo-500/30 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
            <div className="px-10 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Chamados
                  </h1>
                  <p className="text-base text-indigo-300/70 mt-2">
                    Lista em tempo real da coleção de tickets
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-auto">
            <div className="p-10 space-y-8">
              <section className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-2 bg-slate-900/60 border border-indigo-500/30 rounded-xl px-4 py-2 w-full lg:max-w-md">
                    <Search className="w-4 h-4 text-indigo-300" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por código, solicitante, setor ou sala"
                      className="bg-transparent border-none text-white placeholder:text-indigo-300/50 focus-visible:ring-0"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Select
                      value={status}
                      onValueChange={(v) =>
                        setStatus(v as TicketStatus | "todos")
                      }
                    >
                      <SelectTrigger className="bg-slate-900/60 border-indigo-500/30 text-white min-w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_atendimento">
                          Em atendimento
                        </SelectItem>
                        <SelectItem value="finalizado">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={building} onValueChange={setBuilding}>
                      <SelectTrigger className="bg-slate-900/60 border-indigo-500/30 text-white min-w-[200px]">
                        <SelectValue placeholder="Prédio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os prédios</SelectItem>
                        {buildings.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-indigo-500/20 bg-slate-900/50">
                  <div className="p-4">
                    <Table className="text-sm text-indigo-50">
                      <TableHeader>
                        <TableRow className="border-indigo-500/20">
                          <TableHead className="text-indigo-200">
                            Código
                          </TableHead>
                          <TableHead className="text-indigo-200">
                            Solicitante
                          </TableHead>
                          <TableHead className="text-indigo-200">
                            Prédio
                          </TableHead>
                          <TableHead className="text-indigo-200">
                            Status
                          </TableHead>
                          <TableHead className="text-indigo-200">
                            Setor/Sala
                          </TableHead>
                          <TableHead className="text-indigo-200">
                            Criado em
                          </TableHead>
                          <TableHead className="text-indigo-200">
                            Técnico
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading && (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="py-10 text-center text-indigo-200"
                            >
                              <div className="flex items-center justify-center gap-2 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Carregando chamados...
                              </div>
                            </TableCell>
                          </TableRow>
                        )}

                        {!loading &&
                          filtered.map((ticket) => (
                            <TableRow
                              key={ticket.id}
                              className="border-indigo-500/10 hover:bg-slate-800/70"
                            >
                              <TableCell className="font-mono text-xs text-indigo-100">
                                {ticket.code}
                              </TableCell>
                              <TableCell className="text-indigo-50">
                                {ticket.requester}
                              </TableCell>
                              <TableCell className="text-indigo-100">
                                {buildingNameMap[ticket.buildingId] ?? "—"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${statusTone[ticket.status]} uppercase text-[11px] font-semibold px-2.5 py-1`}
                                >
                                  {" "}
                                  {statusLabel[ticket.status]}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-indigo-100">
                                {ticket.sector || "—"}
                                {ticket.room ? ` • ${ticket.room}` : ""}
                              </TableCell>
                              <TableCell className="text-indigo-100">
                                {formatDate(ticket.createdAt)}
                              </TableCell>
                              <TableCell className="text-indigo-100">
                                {ticket.assignedTo?.name ?? "—"}
                              </TableCell>
                            </TableRow>
                          ))}

                        {emptyState && (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="py-12 text-center text-indigo-200/70"
                            >
                              Nenhum chamado encontrado para os filtros atuais.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
