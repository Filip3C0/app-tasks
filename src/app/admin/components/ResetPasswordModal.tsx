"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
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
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    setTempPassword(null);
    setExpiresAt(null);

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-temp-password", userId }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Erro ao definir senha temporária");
      }

      // fetch the one-time password using the token
      const r = await fetch(`/api/users/temp-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token }),
      });

      const d = await r.json();

      if (!d?.success) {
        throw new Error(d?.error || "Erro ao recuperar senha temporária");
      }

      setTempPassword(d.tempPassword);
      setExpiresAt(d.expiresAt || null);
      setSuccess(true);
      if (onActionSuccess) onActionSuccess();
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
            tempPassword ? (
              <div className="space-y-2">
                <p className="text-sm text-green-400 font-medium">
                  ✓ Senha temporária definida com sucesso para {userName}!
                </p>
                <div className="bg-slate-800/70 border border-slate-700 rounded-md p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-100 font-mono break-all">
                      {tempPassword}
                    </p>
                    {expiresAt && (
                      <p className="text-xs text-indigo-300/70 mt-1">
                        Expira em: {new Date(expiresAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (tempPassword)
                        navigator.clipboard.writeText(tempPassword);
                      setTempPassword(null);
                    }}
                    className="ml-4 p-2 rounded-md bg-slate-700 hover:bg-slate-700/90"
                    aria-label="Copiar senha temporária"
                  >
                    <Copy className="w-4 h-4 text-indigo-200" />
                  </button>
                </div>
                <p className="text-xs text-indigo-300/60">
                  Informe a senha temporária ao usuário por um canal seguro. O
                  usuário será obrigado a alterar a senha no primeiro login.
                </p>
              </div>
            ) : (
              <p className="text-sm text-green-400 font-medium">
                ✓ Senha temporária definida com sucesso!
              </p>
            )
          ) : (
            <>
              <p className="text-sm text-indigo-300/70">
                Uma nova senha temporária será definida e o usuário deverá
                alterá-la no próximo login.
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
