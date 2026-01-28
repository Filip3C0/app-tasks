"use client";

import { useState } from "react";
import { updatePassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function TrocarSenhaPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleChangePassword() {
    if (password.length < 6) {
      toast({
        title: "A senha deve ter pelo menos 6 caracteres",
        variant: "warning",
      });
      return;
    }

    if (password !== confirm) {
      toast({ title: "As senhas não conferem", variant: "warning" });
      return;
    }

    const user = auth?.currentUser;
    if (!user || !auth) {
      toast({
        title: "Sessão inválida. Faça login novamente.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      setLoading(true);

      // 🔑 Atualiza senha
      await updatePassword(user, password);

      // 🧾 Atualiza Firestore
      await updateDoc(doc(db, "users", user.uid), {
        firstLogin: false,
      });

      // 🚪 Encerra sessão
      if (auth) await auth.signOut();

      toast({
        title: "Senha alterada com sucesso! Faça login novamente.",
        variant: "success",
      });

      router.push("/login");
    } catch (error: any) {
      console.error("🔥 ERRO FIREBASE:", error);
      toast({
        title: "Erro ao alterar senha",
        description: `${error?.code ?? "sem code"} - ${error?.message ?? "sem message"}`,
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
          <CardTitle className="text-2xl font-semibold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Trocar senha
          </CardTitle>
          <CardDescription className="text-indigo-300/70">
            Defina uma nova senha para continuar usando o sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-indigo-300">
              Nova senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite a nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-indigo-300">
              Confirmar senha
            </Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Confirme a nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50"
            />
          </div>

          <Button
            className="w-full px-6 py-2 rounded-lg bg-linear-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-500 hover:to-indigo-600 transition shadow-lg"
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
