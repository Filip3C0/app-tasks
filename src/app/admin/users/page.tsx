"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Sidebar } from "../components/Sidebar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RoleBadge } from "../components/RoleBadge";
import { Users, Search } from "lucide-react";
import { UserActions } from "../components/UserActions";

/* ================= TYPES ================= */

type UserRole = "admin" | "service" | "field";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  buildingId?: string;
};

/* ================= PAGE ================= */

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"todos" | UserRole>("todos");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  /* ================= LOAD ================= */

  async function loadUsers() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<User, "id">),
      }));

      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================= FILTERS ================= */

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (
        search &&
        !`${user.name} ${user.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }

      if (roleFilter !== "todos" && user.role !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [users, search, roleFilter]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-900 via-indigo-900 to-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        {/* HEADER SECTION */}
        <div className="border-b border-indigo-500/30 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="px-10 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Gerenciar Usuários
                </h1>
                <p className="text-base text-indigo-300/70 mt-2">
                  Gerencie os usuários do sistema e suas permissões
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => router.push("/admin/users/create")}
                  className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white text-base font-medium shadow-lg hover:from-indigo-500 hover:to-indigo-600"
                >
                  + Novo Usuário
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-auto">
          <div className="p-10 space-y-8">
            {/* FILTERS SECTION */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition">
                <label className="block text-sm font-semibold text-indigo-300 mb-3">
                  Buscar Usuário
                </label>
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-700/50 border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400/50"
                />
              </div>

              <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition">
                <label className="block text-sm font-semibold text-indigo-300 mb-3">
                  Filtrar por Cargo
                </label>
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value as any);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full bg-slate-700/50 border-indigo-500/30 text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="field">Field</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition flex items-end">
                <Button className="w-full bg-linear-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-500 hover:to-indigo-600 transition text-base shadow-lg">
                  Limpar Filtros
                </Button>
              </div>
            </section>

            {/* USERS LIST */}
            <section className="rounded-2xl border border-indigo-500/30 bg-slate-800/50 backdrop-blur-sm p-8 shadow-lg hover:shadow-xl hover:border-indigo-400/50 transition">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-indigo-300">
                  Lista de Usuários
                </h2>
                <p className="text-sm text-indigo-300/60 mt-1">
                  Total:{" "}
                  <span className="font-semibold">{filteredUsers.length}</span>{" "}
                  usuários
                </p>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Users className="w-12 h-12 mb-3 opacity-20 mx-auto" />
                      <p className="text-indigo-300/60">
                        Carregando usuários...
                      </p>
                    </div>
                  </div>
                ) : paginatedUsers.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Search className="w-12 h-12 mb-3 opacity-20 mx-auto" />
                      <p className="text-indigo-300/60">
                        Nenhum usuário encontrado
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-indigo-500/30">
                        <tr>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-indigo-300">
                            Nome
                          </th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-indigo-300">
                            Email
                          </th>
                          <th className="text-left py-4 px-4 text-sm font-semibold text-indigo-300">
                            Cargo
                          </th>
                          <th className="text-right py-4 px-4 text-sm font-semibold text-indigo-300">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-indigo-500/20 hover:bg-indigo-600/10 transition"
                          >
                            <td className="py-4 px-4">
                              <p className="font-medium text-white">
                                {user.name}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-indigo-300/70">
                                {user.email}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <RoleBadge role={user.role} />
                            </td>
                            <td className="py-4 px-4 text-right">
                              <UserActions
                                userId={user.id}
                                userName={user.name}
                                onActionSuccess={loadUsers}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-indigo-300/70">
                  Mostrando{" "}
                  <span className="font-semibold">
                    {(page - 1) * PAGE_SIZE + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-semibold">
                    {Math.min(page * PAGE_SIZE, filteredUsers.length)}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold">{filteredUsers.length}</span>{" "}
                  usuários
                </p>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="border-indigo-500/30 text-indigo-900 hover:bg-indigo-300 hover:border-indigo-400/50"
                  >
                    ← Anterior
                  </Button>

                  <span className="text-sm text-indigo-300 font-medium">
                    Página {page} de {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-indigo-500/30 text-indigo-900 hover:bg-indigo-300 hover:border-indigo-400/50"
                  >
                    Próxima →
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
