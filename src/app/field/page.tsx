"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { AuthGuard } from "@/components/auth-guard";

import AppLayout from "@/components/layout/AppLayout";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/layout/MainContent";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { registerFieldPushToken } from "@/lib/fcm";

type TicketStatus = "aberto" | "em_atendimento" | "finalizado";

type Ticket = {
  id: string;
  code: string;
  requester: string;
  sector: string;
  room: string;
  description: string;
  status: TicketStatus;
  assignedTo?: {
    uid: string;
    name: string;
  } | null;
};

export default function FieldPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [loadingTicketId, setLoadingTicketId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tokenRegistered, setTokenRegistered] = useState(false);

  const currentUser = auth?.currentUser;

  /* ================= LOAD USER BUILDING ================= */

  useEffect(() => {
    async function loadUserBuilding() {
      if (!currentUser || !db) return;

      const snap = await getDoc(doc(db as any, "users", currentUser.uid));

      setBuildingId(snap.data()?.buildingId ?? null);
    }

    loadUserBuilding();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (tokenRegistered) return;

    registerFieldPushToken(currentUser.uid)
      .then((token) => {
        if (token) setTokenRegistered(true);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[fcm] falha ao registrar token", err);
      });
  }, [currentUser, tokenRegistered]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= REALTIME TICKETS ================= */

  useEffect(() => {
    if (!buildingId) return;

    if (!db) return;

    const q = query(
      collection(db as any, "tickets"),
      where("buildingId", "==", buildingId),
    );

    const unsub = onSnapshot(q, (snap) => {
      setTickets(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Ticket, "id">),
        })),
      );
    });

    return () => unsub();
  }, [buildingId]);

  /* ================= ACTIONS ================= */

  async function assumeTicket(ticket: Ticket) {
    if (!currentUser) return;
    if (ticket.status !== "aberto") return;

    try {
      setLoadingTicketId(ticket.id);

      await updateDoc(doc(db as any, "tickets", ticket.id), {
        status: "em_atendimento",
        assignedTo: {
          uid: currentUser.uid,
          name: currentUser.displayName ?? "Técnico",
        },
        startedAt: Timestamp.now(),
      });
    } finally {
      setLoadingTicketId(null);
    }
  }

  async function finishTicket(ticket: Ticket) {
    if (
      !currentUser ||
      ticket.status !== "em_atendimento" ||
      ticket.assignedTo?.uid !== currentUser.uid
    ) {
      return;
    }

    try {
      setLoadingTicketId(ticket.id);

      await updateDoc(doc(db as any, "tickets", ticket.id), {
        status: "finalizado",
        solvedAt: Timestamp.now(),
      });
    } finally {
      setLoadingTicketId(null);
    }
  }

  /* ================= UI ================= */

  function renderStatusBadge(status: TicketStatus) {
    if (status === "aberto")
      return <Badge className="bg-red-600/80 text-white">Aberto</Badge>;
    if (status === "em_atendimento")
      return (
        <Badge className="bg-amber-600/80 text-white">Em atendimento</Badge>
      );
    return <Badge className="bg-green-600/80 text-white">Finalizado</Badge>;
  }

  return (
    <AuthGuard allowedRoles={["field"]}>
      <AppLayout>
        <Sidebar open={menuOpen} onOpenChange={setMenuOpen} />

        <MainContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/90 border border-indigo-500/40 text-indigo-100 shadow-md backdrop-blur"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                >
                  {menuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Chamados do meu prédio
                </h1>
              </div>
              <p className="text-base text-indigo-300/70 mt-2">
                Acompanhe e atenda os chamados disponíveis
              </p>
            </div>

            {tickets.length === 0 && (
              <div className="flex items-center justify-center py-12 rounded-2xl border border-indigo-500/30 bg-slate-800/50">
                <p className="text-indigo-300/60">Nenhum chamado disponível</p>
              </div>
            )}

            <div className="grid gap-6">
              {tickets.map((t) => {
                const isMine = t.assignedTo?.uid === currentUser?.uid;
                const isLoading = loadingTicketId === t.id;

                return (
                  <Card
                    key={t.id}
                    className="border-indigo-500/30 bg-slate-800/50 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <p className="font-semibold text-lg text-white">
                            Chamado: {t.code}
                          </p>
                          <p className="text-sm text-indigo-300/70">
                            Solicitante: {t.requester}
                          </p>
                          <p className="text-sm text-indigo-300/70">
                            Descrição: {t.description}
                          </p>
                          <p className="text-sm text-indigo-300/60">
                            Setor/Sala: {t.sector} • {t.room}
                          </p>
                        </div>

                        {renderStatusBadge(t.status)}
                      </div>

                      {t.assignedTo && (
                        <p className="text-xs text-indigo-300/60 border-t border-indigo-500/20 pt-3">
                          Técnico responsável:{" "}
                          <span className="font-medium text-indigo-300">
                            {t.assignedTo.name}
                          </span>
                        </p>
                      )}

                      {/* ACTIONS */}
                      <div className="flex gap-3 pt-2">
                        {t.status === "aberto" && (
                          <Button
                            onClick={() => assumeTicket(t)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 transition"
                          >
                            {isLoading ? "Assumindo..." : "Assumir chamado"}
                          </Button>
                        )}

                        {t.status === "em_atendimento" && isMine && (
                          <Button
                            onClick={() => finishTicket(t)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600 transition"
                          >
                            {isLoading ? "Finalizando..." : "Finalizar"}
                          </Button>
                        )}

                        {t.status === "em_atendimento" && !isMine && (
                          <p className="text-xs text-indigo-300/60 pt-2">
                            Em atendimento por outro técnico
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </MainContent>
      </AppLayout>
    </AuthGuard>
  );
}
