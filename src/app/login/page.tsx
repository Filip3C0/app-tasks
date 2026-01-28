"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin() {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/loading");
    } catch (error) {
      toast({ title: "Email ou senha inválidos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center bg-linear-to-br from-slate-900 via-indigo-900 to-slate-900 min-h-screen p-4">
      <Card className="w-full max-w-md shadow-2xl border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center border-b border-indigo-500/30">
          <CardTitle className="text-2xl font-bold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Bem-vindo de volta
          </CardTitle>
          <p className="text-sm text-indigo-300/70">
            Acesse o sistema de chamados
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-indigo-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-indigo-300">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50"
              />
            </div>
          </div>

          <Button
            className="w-full bg-linear-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-500 hover:to-indigo-600 transition shadow-lg"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <p className="text-center text-xs text-indigo-300/60">
            Sistema interno • Acesso restrito
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
