"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
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
  onActionSuccess?: () => void;
}

export function ChangeBuildingModal({
  open,
  onOpenChange,
  userId,
  onActionSuccess,
}: Props) {
  const [building, setBuilding] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSave = async () => {
    if (!building) {
      setError("Selecione um prédio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Enviando requisição para atualizar buildingId...");

      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-building",
          userId,
          buildingId: building,
        }),
      });

      console.log("Status da resposta:", response.status);

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = {};
      }

      console.log("Resposta recebida:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `Erro HTTP ${response.status}`);
      }

      console.log("Sucesso! Fechando modal");
      setBuilding("");
      onOpenChange(false);

      if (onActionSuccess) {
        onActionSuccess();
      }
    } catch (err) {
      console.error("Erro na requisição:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setBuilding("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-indigo-500/30 bg-slate-900/80 backdrop-blur-sm p-6 shadow-2xl">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Alterar prédio
            </DialogTitle>
            <DialogDescription className="text-sm text-indigo-300/70">
              Selecione o novo prédio do usuário
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Select value={building} onValueChange={(v) => setBuilding(v)}>
              <SelectTrigger className="w-full bg-slate-700/50 border-indigo-500/30 text-white">
                <SelectValue placeholder="Selecionar prédio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrativo">Administrativo</SelectItem>
                <SelectItem value="civel">Cível</SelectItem>
                <SelectItem value="criminal">Criminal</SelectItem>
                <SelectItem value="latife">Latife</SelectItem>
                <SelectItem value="palacio-justica">
                  Palácio da Justiça
                </SelectItem>
              </SelectContent>
            </Select>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="bg-slate-800 text-indigo-100 border-slate-700 hover:bg-slate-800/90"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
