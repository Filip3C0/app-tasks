"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import AppLayout from "@/components/layout/AppLayout";
import { Sidebar } from "../components/Sidebar";
import MainContent from "@/components/layout/MainContent";
import { Menu, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";

export default function PerfilPage() {
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    async function loadUser() {
      const user = auth?.currentUser;
      if (!user || !db) return;

      setEmail(user.email || "");

      const ref = doc(db as any, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setPhotoURL(data.photoURL || "");
      }
    }

    loadUser();
  }, []);

  async function handleSave() {
    const user = auth?.currentUser;
    if (!user || !db) return;

    try {
      setLoading(true);

      await updateDoc(doc(db as any, "users", user.uid), {
        name,
        photoURL,
      });

      toast({ title: "Perfil atualizado com sucesso!", variant: "success" });
    } catch (error) {
      toast({ title: "Erro ao salvar perfil", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <Sidebar open={menuOpen} onOpenChange={setMenuOpen} />
      <MainContent>
        <div className="flex items-center gap-3 mb-3">
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
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Meu Perfil
            </h1>
            <p className="text-base text-indigo-300/70">
              Atualize suas informações pessoais
            </p>
          </div>
        </div>

        <Card className="max-w-lg rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-indigo-400">
              Informações pessoais
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={photoURL} />
                <AvatarFallback>
                  {name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Input
                placeholder="URL da foto"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50"
              />
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label className="text-indigo-300">Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-indigo-300">Email</Label>
              <Input
                value={email}
                disabled
                className="bg-slate-700/30 border-indigo-500/20 text-indigo-300"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-linear-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-500 hover:to-indigo-600 transition shadow-lg"
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </CardContent>
        </Card>
      </MainContent>
    </AppLayout>
  );
}
