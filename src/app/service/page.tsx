"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuthGuard } from "@/components/auth-guard";

import AppLayout from "@/components/layout/AppLayout";
import Sidebar from "./components/Sidebar";
import MainContent from "@/components/layout/MainContent";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Building = {
  id: string;
  name: string;
};

export default function ServicePage() {
  const [code, setCode] = useState("");
  const [requester, setRequester] = useState("");
  const [sector, setSector] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  const [buildingId, setBuildingId] = useState("");

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD BUILDINGS ================= */

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
    }

    loadBuildings();
  }, []);

  /* ================= CREATE TICKET ================= */

  async function handleCreateTicket() {
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
      setLoading(true);

      await addDoc(collection(db as any, "tickets"), {
        code,
        requester,
        sector,
        room,
        description,
        buildingId,
        status: "aberto",
        assignedTo: null,
        createdAt: Timestamp.now(),
        solvedAt: null,
      });

      toast({ title: "Chamado criado com sucesso", variant: "success" });

      setCode("");
      setRequester("");
      setSector("");
      setRoom("");
      setDescription("");
      setBuildingId("");
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao criar chamado", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <AuthGuard allowedRoles={["service"]}>
      <AppLayout>
        <Sidebar />

        <MainContent>
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Abrir Chamado
              </h1>
              <p className="text-base text-indigo-300/70 mt-2">
                Registre um novo chamado no sistema
              </p>
            </div>

            <Card className="border-indigo-500/30 bg-slate-800/50 shadow-lg">
              <CardContent className="p-8 space-y-6">
                <div>
                  <Label className="text-indigo-300 font-semibold">
                    Código
                  </Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="RF-12345"
                    className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50 mt-2"
                  />
                </div>

                <div>
                  <Label className="text-indigo-300 font-semibold">
                    Solicitante
                  </Label>
                  <Input
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                    placeholder="Nome do solicitante"
                    className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50 mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-indigo-300 font-semibold">
                      Setor
                    </Label>
                    <Input
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      placeholder="Ex: Financeiro, TI"
                      className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50 mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-indigo-300 font-semibold">
                      Sala
                    </Label>
                    <Input
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="Ex: Sala 203"
                      className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50 mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-indigo-300 font-semibold">
                    Descrição
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o problema"
                    className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50 mt-2 min-h-32"
                  />
                </div>

                <div>
                  <Label className="text-indigo-300 font-semibold">
                    Prédio
                  </Label>
                  <Select value={buildingId} onValueChange={setBuildingId}>
                    <SelectTrigger className="bg-slate-700/50 border-indigo-500/30 text-white mt-2">
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
                </div>

                <Button
                  onClick={handleCreateTicket}
                  disabled={loading}
                  className="w-full bg-linear-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 transition shadow-lg font-medium py-2 h-auto"
                >
                  {loading ? "Criando chamado..." : "Criar Chamado"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </MainContent>
      </AppLayout>
    </AuthGuard>
  );
}
