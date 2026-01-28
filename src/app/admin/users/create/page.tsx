"use client";

import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Role = "admin" | "service" | "field";

type Building = {
  id: string;
  name: string;
};

export default function CreateUserPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [buildingId, setBuildingId] = useState("");

  const [buildings, setBuildings] = useState<Building[]>([]);

  /* pega os prédios do firestore  */
  useEffect(() => {
    async function loadBuildings() {
      if (!db) return;

      const snap = await getDocs(collection(db as any, "buildings"));

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      console.log(data);
      setBuildings(data);
      setLoadingBuildings(false);
    }

    loadBuildings();
  }, []);

  async function handleCreateUser() {
    if (!name || !email || !role) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        variant: "warning",
      });
      return;
    }

    if (role === "field" && !buildingId) {
      toast({ title: "Selecione o prédio do técnico", variant: "warning" });
      return;
    }

    try {
      setLoading(true);

      if (!functions) throw new Error("Firebase functions not initialized");

      const createUser = httpsCallable(functions as any, "createUser");

      await createUser({
        name,
        email,
        role,
        buildingId: role === "field" ? buildingId : null,
      });
      console.log(createUser);
      toast({ title: "Usuário criado com sucesso!", variant: "success" });
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      toast({
        title: err?.message || "Erro ao criar usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-indigo-900 to-slate-900 px-4">
      <Card className="w-full max-w-md rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="relative w-full px-4 py-6">
            <div className="absolute left-4 top-4">
              <Button
                onClick={() => router.back()}
                size="sm"
                className="bg-slate-800 text-indigo-200 font-medium px-3 py-2 rounded-full shadow-sm hover:bg-slate-700 border border-transparent flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-200" />
                <span className="text-sm">Voltar</span>
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center pt-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-center leading-tight">
                <span className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Criar usuário
                </span>
              </h1>
              <p className="text-sm text-indigo-300/60 mt-1 text-center max-w-[44ch] mx-auto">
                Preencha os dados para criar um novo usuário
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pt-2 px-6 pb-6">
          {/* NOME */}
          <div className="space-y-1">
            <Label className="text-indigo-300">Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50"
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
            <Label className="text-indigo-300">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50"
            />
          </div>

          {/* PERFIL */}
          <div className="space-y-1">
            <Label className="text-indigo-300">Perfil</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-full bg-slate-700/50 border-indigo-500/30 text-white">
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="service">Service Desk</SelectItem>
                <SelectItem value="field">Field Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PRÉDIO — SOMENTE FIELD */}
          {role === "field" && (
            <div className="space-y-1">
              <Label className="text-indigo-300">Prédio</Label>

              {loadingBuildings ? (
                <p className="text-sm text-indigo-300/60">
                  Carregando prédios...
                </p>
              ) : (
                <Select value={buildingId} onValueChange={setBuildingId}>
                  <SelectTrigger className="w-full bg-slate-700/50 border-indigo-500/30 text-white">
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
          )}

          {/* INFO */}
          <p className="text-xs text-indigo-300/60">
            A senha inicial será definida automaticamente.
            <br />O usuário será obrigado a trocar no primeiro login.
          </p>

          <Button
            onClick={handleCreateUser}
            disabled={loading}
            className="w-full px-6 py-2 rounded-lg bg-linear-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-500 hover:to-indigo-600 transition shadow-lg"
          >
            {loading ? "Criando..." : "Criar usuário"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
