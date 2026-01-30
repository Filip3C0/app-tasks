"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuthGuard } from "@/components/auth-guard";

import AppLayout from "@/components/layout/AppLayout";
import Sidebar from "../components/Sidebar";
import MainContent from "@/components/layout/MainContent";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Menu, X, Search } from "lucide-react";

type TicketStatus = "aberto" | "em_atendimento" | "finalizado";

type Building = {
  id: string;
  name: string;
};

type Ticket = {
  id: string;
  code?: string;
  requester?: string | { name?: string };
  sector?: string;
  room?: string;
  description?: string;
  buildingId?: string;
  status?: TicketStatus;
};

export default function EditTickets() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);

  const [code, setCode] = useState("");
  const [requester, setRequester] = useState("");
  const [sector, setSector] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [status, setStatus] = useState<TicketStatus>("aberto");

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

  useEffect(() => {
    async function loadBuildings() {
      if (!db) return;

      const snap = await getDocs(collection(db as any, "buildings"));
      setBuildings(
        snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
        })),
      );
      setLoadingBuildings(false);
    }

    loadBuildings();
  }, []);

  function hydrateForm(found: Ticket) {
    const requesterValue =
      typeof found.requester === "string"
        ? found.requester
        : (found.requester?.name ?? "");

    setCode(found.code ?? "");
    setRequester(requesterValue);
    setSector(found.sector ?? "");
    setRoom(found.room ?? "");
    setDescription(found.description ?? "");
    setBuildingId(found.buildingId ?? "");
    setStatus((found.status as TicketStatus) ?? "aberto");
  }

  async function handleSearch() {
    if (!searchTerm) {
      toast({ title: "Informe o código ou ID do chamado", variant: "warning" });
      return;
    }

    if (!db) return;

    setLoadingSearch(true);
    setTicket(null);

    try {
      const byId = await getDoc(doc(db as any, "tickets", searchTerm.trim()));
      if (byId.exists()) {
        const data = byId.data() as Omit<Ticket, "id">;
        const found = { id: byId.id, ...data };
        setTicket(found);
        hydrateForm(found);
        return;
      }

      const q = query(
        collection(db as any, "tickets"),
        where("code", "==", searchTerm.trim()),
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        toast({ title: "Chamado não encontrado", variant: "warning" });
        return;
      }

      const docSnap = snap.docs[0];
      const found = {
        id: docSnap.id,
        ...(docSnap.data() as Omit<Ticket, "id">),
      };
      setTicket(found);
      hydrateForm(found);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao buscar chamado", variant: "destructive" });
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleSave() {
    if (!ticket?.id) return;

    if (
      !code ||
      !requester ||
      !sector ||
      !room ||
      !description ||
      !buildingId
    ) {
      toast({ title: "Preencha todos os campos", variant: "warning" });
      return;
    }

    try {
      setLoadingSave(true);

      const response = await fetch("/api/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          code,
          requester,
          sector,
          room,
          description,
          buildingId,
          status,
        }),
      });

      const data = await response.json();
      if (!response.ok || data?.error) {
        throw new Error(data?.error || "Erro ao atualizar chamado");
      }

      toast({ title: "Chamado atualizado com sucesso", variant: "success" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao atualizar chamado", variant: "destructive" });
    } finally {
      setLoadingSave(false);
    }
  }

  return (
    <AuthGuard allowedRoles={["service"]}>
      <AppLayout>
        <Sidebar open={menuOpen} onOpenChange={setMenuOpen} />

        <MainContent>
          <div className="max-w-3xl space-y-6 px-1 sm:px-0">
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
                <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Editar Chamado
                </h1>
              </div>
              <p className="text-base text-indigo-300/70 mt-2">
                Pesquise pelo ID ou código do chamado
              </p>
            </div>

            <Card className="border-indigo-500/30 bg-slate-800/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-indigo-300">
                  Buscar chamado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 flex-col sm:flex-row">
                  <Input
                    placeholder="Digite o ID ou código do chamado"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={loadingSearch}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 sm:w-auto w-full"
                  >
                    <Search className="w-4 h-4" />
                    {loadingSearch ? "Buscando..." : "Buscar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {ticket && (
              <Card className="border-indigo-500/30 bg-slate-800/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-indigo-300">
                    Editar dados do chamado
                  </CardTitle>
                  <p className="text-xs text-indigo-300/60">ID: {ticket.id}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-indigo-300">Código</Label>
                      <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="bg-slate-700/50 border-indigo-500/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-indigo-300">Solicitante</Label>
                      <Input
                        value={requester}
                        onChange={(e) => setRequester(e.target.value)}
                        className="bg-slate-700/50 border-indigo-500/30 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-indigo-300">Setor</Label>
                      <Input
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="bg-slate-700/50 border-indigo-500/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-indigo-300">Sala</Label>
                      <Input
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="bg-slate-700/50 border-indigo-500/30 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-indigo-300">Descrição</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-slate-700/50 border-indigo-500/30 text-white min-h-28"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-indigo-300">Prédio</Label>
                      {loadingBuildings ? (
                        <p className="text-sm text-indigo-300/60">
                          Carregando...
                        </p>
                      ) : (
                        <Select
                          value={buildingId}
                          onValueChange={setBuildingId}
                        >
                          <SelectTrigger className="bg-slate-700/50 border-indigo-500/30 text-white">
                            <SelectValue placeholder="Selecione o prédio" />
                          </SelectTrigger>
                          <SelectContent>
                            {buildings.map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div>
                      <Label className="text-indigo-300">Status</Label>
                      <Select
                        value={status}
                        onValueChange={(v) => setStatus(v as TicketStatus)}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-indigo-500/30 text-white">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aberto">Aberto</SelectItem>
                          <SelectItem value="em_atendimento">
                            Em atendimento
                          </SelectItem>
                          <SelectItem value="finalizado">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={loadingSave}
                    className="w-full bg-linear-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 transition"
                  >
                    {loadingSave ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </MainContent>
      </AppLayout>
    </AuthGuard>
  );
}
