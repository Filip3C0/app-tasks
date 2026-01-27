"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onActionSuccess?: () => void;
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  userId,
  userName,
  onActionSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir usuário");
      }

      onOpenChange(false);
      if (onActionSuccess) {
        onActionSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-indigo-500/30 bg-slate-900/80 backdrop-blur-sm p-6 shadow-2xl">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-rose-300">
              Excluir usuário
            </DialogTitle>
            <DialogDescription className="text-sm text-indigo-300/70">
              Tem certeza que deseja excluir{" "}
              <strong className="text-white">{userName}</strong>? Essa ação não
              poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-indigo-300/70">
            O usuário <strong className="text-white">{userName}</strong> será
            permanentemente removido do sistema.
          </p>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <DialogFooter>
            <Button
              onClick={handleCancel}
              disabled={loading}
              className="bg-slate-800 text-indigo-100 border-slate-700 hover:bg-slate-800/90"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {loading ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
