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

export function ResetPasswordModal({
  open,
  onOpenChange,
  userId,
  userName,
  onActionSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao resetar senha");
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        if (onActionSuccess) {
          onActionSuccess();
        }
      }, 2000);
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
            <DialogTitle className="text-lg font-semibold text-white">
              Resetar senha
            </DialogTitle>
            <DialogDescription className="text-sm text-indigo-300/70">
              Uma nova senha será enviada para o email do usuário
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <p className="text-sm text-green-400 font-medium">
              ✓ Link de redefinição enviado com sucesso para {userName}!
            </p>
          ) : (
            <>
              <p className="text-sm text-indigo-300/70">
                Uma nova senha será enviada para{" "}
                <strong className="text-white">{userName}</strong>.
              </p>
              {error && <p className="text-sm text-rose-400">{error}</p>}
            </>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="bg-slate-800 text-indigo-100 border-slate-700 hover:bg-slate-800/90"
            >
              {success ? "Fechar" : "Cancelar"}
            </Button>
            {!success && (
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? "Enviando..." : "Confirmar"}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
