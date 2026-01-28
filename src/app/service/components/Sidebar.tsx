"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Home, ClipboardList, User, LogOut } from "lucide-react";

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    if (!auth) {
      router.push("/login");
      return;
    }

    await signOut(auth);
    router.push("/login");
  }

  return (
    <aside className="w-64 bg-linear-to-b from-slate-900 to-slate-950 border-r border-indigo-500/30 p-6 flex flex-col justify-between sticky top-0 h-screen">
      {/* Topo */}
      <div>
        <h2 className="text-xl font-bold mb-8 bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Chamados TI
        </h2>

        <nav className="space-y-2">
          <Link
            href="/service"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-indigo-300/70 hover:text-indigo-300 hover:bg-indigo-600/20 transition border border-transparent hover:border-indigo-500/30"
          >
            <Home size={18} />
            Home
          </Link>

          <Link
            href="/service/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-indigo-300/70 hover:text-indigo-300 hover:bg-indigo-600/20 transition border border-transparent hover:border-indigo-500/30"
          >
            <User size={18} />
            Perfil
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <Button
        className="flex items-center gap-2 justify-start w-full bg-linear-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 transition shadow-lg"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        Sair
      </Button>
    </aside>
  );
}
