"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ChangeBuildingModal } from "./ChangeBuildingModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { ResetPasswordModal } from "./ResetPasswordModal";

interface Props {
  userId: string;
  userName: string;
  onActionSuccess?: () => void;
}

export function UserActions({ userId, userName, onActionSuccess }: Props) {
  const [openBuilding, setOpenBuilding] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openReset, setOpenReset] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Ações para ${userName}`}
            className="bg-slate-800 text-indigo-200 hover:bg-slate-700"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              console.log("Abrindo modal Alterar prédio");
              setOpenBuilding(true);
            }}
          >
            Alterar prédio
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              console.log("Abrindo modal Resetar senha");
              setOpenReset(true);
            }}
          >
            Resetar senha
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              console.log("Abrindo modal Excluir usuário");
              setOpenDelete(true);
            }}
          >
            Excluir usuário
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeBuildingModal
        open={openBuilding}
        onOpenChange={setOpenBuilding}
        userId={userId}
        onActionSuccess={onActionSuccess}
      />

      <ResetPasswordModal
        open={openReset}
        onOpenChange={setOpenReset}
        userId={userId}
        userName={userName}
        onActionSuccess={onActionSuccess}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onOpenChange={setOpenDelete}
        userId={userId}
        userName={userName}
        onActionSuccess={onActionSuccess}
      />
    </>
  );
}
