"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { ClipboardList, User, LogOut, Menu, X } from "lucide-react";

type SidebarProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function Sidebar({ open, onOpenChange }: SidebarProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof open === "boolean" && !!onOpenChange;
  const menuOpen = isControlled ? (open as boolean) : internalOpen;

  const setMenuOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  async function handleLogout() {
    if (!auth) {
      router.push("/login");
      return;
    }

    await signOut(auth);
    router.push("/login");
  }

  return (
    <>
      {!isControlled && (
        <button
          className="lg:hidden fixed top-5 left-4 sm:left-10 z-50 rounded-lg bg-slate-900/90 border border-indigo-500/40 px-3 py-2 text-indigo-100 shadow-md backdrop-blur"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      )}

      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky inset-y-0 left-0 z-50 lg:z-auto w-72 lg:w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-indigo-500/30 p-4 lg:p-6 flex flex-col justify-between h-screen lg:min-h-screen lg:top-0 transition-transform duration-200 lg:transform-none ${menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Topo */}
        <div className="overflow-y-auto">
          <h2 className="text-xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Chamados TI
          </h2>

          <nav className="space-y-2">
            <Link
              href="/field"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-indigo-300/80 hover:text-indigo-200 hover:bg-indigo-600/20 transition border border-transparent hover:border-indigo-500/40"
              onClick={() => setMenuOpen(false)}
            >
              <ClipboardList size={18} />
              Chamados
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-indigo-300/80 hover:text-indigo-200 hover:bg-indigo-600/20 transition border border-transparent hover:border-indigo-500/40"
              onClick={() => setMenuOpen(false)}
            >
              <User size={18} />
              Perfil
            </Link>
          </nav>
        </div>

        {/* Logout */}
        <Button
          className="mt-8 flex items-center gap-2 justify-start w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 transition shadow-lg"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Sair
        </Button>
      </aside>
    </>
  );
}
