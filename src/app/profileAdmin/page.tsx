"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import AppLayout from "@/components/layout/AppLayout";
import { Sidebar } from "../admin/components/Sidebar";
import MainContent from "@/components/layout/MainContent";

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
      <Sidebar />
      <MainContent>
        <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-3">
          Meu Perfil
        </h1>
        <p className="text-base text-indigo-300/70 mb-6">
          Atualize suas informações pessoais
        </p>

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
