import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  updateFirestoreREST,
  deleteFirestoreDocREST,
} from "@/lib/firestore-rest";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, building } = body;

    if (!action || !userId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // ==========================
    // 🔥 EXCLUIR USUÁRIO
    // ==========================
    if (action === "delete") {
      console.log("[POST /api/users] Iniciando exclusão em background...");

      // Iniciar exclusão em background (sem await)
      (async () => {
        try {
          console.log("[POST /api/users] [BG] Deletando do Auth...");
          await adminAuth.deleteUser(userId);

          console.log(
            "[POST /api/users] [BG] Deletando do Firestore via REST...",
          );
          await deleteFirestoreDocREST("users", userId);

          console.log("[POST /api/users] [BG] ✓ Usuário deletado com sucesso");
        } catch (bgError) {
          console.error(
            "[POST /api/users] [BG] Erro durante exclusão:",
            bgError,
          );
        }
      })();

      // Retornar sucesso imediatamente
      console.log(
        "[POST /api/users] ✓ Requisição aceita (exclusão em background)",
      );
      return NextResponse.json({ success: true });
    }

    // ==========================
    // 🔁 RESETAR SENHA
    // ==========================
    if (action === "reset-password") {
      const user = await adminAuth.getUser(userId);

      const resetLink = await adminAuth.generatePasswordResetLink(user.email!);

      // aqui você pode:
      // - enviar email
      // - logar
      // - integrar com EmailJS / Resend

      return NextResponse.json({
        success: true,
        resetLink,
      });
    }

    // ==========================
    // 🏢 ALTERAR PRÉDIO
    // ==========================
    if (action === "change-building") {
      if (!building) {
        return NextResponse.json(
          { error: "Prédio não informado" },
          { status: 400 },
        );
      }

      await adminDb.collection("users").doc(userId).update({
        buildingId: building,
        updatedAt: new Date(),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  console.log("[PUT /api/users] Requisição recebida");

  try {
    console.log("[PUT /api/users] Lendo body...");
    const body = await req.json();
    const { action, userId, buildingId } = body;

    console.log("[PUT /api/users] Body recebido:", {
      action,
      userId,
      buildingId,
    });

    if (!action || !userId) {
      console.log("[PUT /api/users] Dados inválidos");
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // ==========================
    // 🔁 RESETAR SENHA
    // ==========================
    if (action === "reset-password") {
      console.log("[PUT /api/users] Ação: reset-password");

      try {
        const user = await adminAuth.getUser(userId);

        const resetLink = await adminAuth.generatePasswordResetLink(
          user.email!,
        );

        console.log("[PUT /api/users] Reset link gerado");

        // Atualizar o Firestore para registrar que uma senha foi resetada
        console.log(
          "[PUT /api/users] Iniciando atualização de lastPasswordReset em background...",
        );
        (async () => {
          try {
            await updateFirestoreREST("users", userId, {
              lastPasswordReset: new Date(),
            });
            console.log("[PUT /api/users] [BG] ✓ lastPasswordReset atualizado");
          } catch (err) {
            console.error(
              "[PUT /api/users] [BG] Erro ao atualizar lastPasswordReset:",
              err,
            );
          }
        })();

        return NextResponse.json({
          success: true,
          resetLink,
        });
      } catch (resetError) {
        console.error("[PUT /api/users] Erro ao gerar reset link:", resetError);
        throw resetError;
      }
    }

    // ==========================
    // 🏢 ALTERAR PRÉDIO
    // ==========================
    if (action === "change-building") {
      console.log("[PUT /api/users] Ação: change-building");

      if (!buildingId) {
        console.log("[PUT /api/users] buildingId não informado");
        return NextResponse.json(
          { error: "Prédio não informado" },
          { status: 400 },
        );
      }

      console.log(
        "[PUT /api/users] Iniciando atualização do usuário:",
        userId,
        "com buildingId:",
        buildingId,
      );

      // NÃO AGUARDAR - Iniciar em background e retornar imediatamente
      console.log("[PUT /api/users] Iniciando atualização em background...");

      // Iniciar a atualização em background com API REST
      (async () => {
        try {
          console.log("[PUT /api/users] [BG] Iniciando update via REST...");

          await updateFirestoreREST("users", userId, {
            buildingId,
            updatedAt: new Date(),
          });

          console.log("[PUT /api/users] [BG] ✓ Update completado com sucesso");
        } catch (bgError) {
          console.error("[PUT /api/users] [BG] Erro durante update:", bgError);
        }
      })();

      // Retornar sucesso imediatamente sem aguardar a atualização
      console.log(
        "[PUT /api/users] ✓ Requisição aceita (atualização em background)",
      );
      return NextResponse.json({ success: true });
    }

    console.log("[PUT /api/users] Ação inválida:", action);
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("[PUT /api/users] ❌ Erro:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  console.log("[DELETE /api/users] Requisição recebida");

  try {
    const body = await req.json();
    const { userId } = body;

    console.log("[DELETE /api/users] Deletando usuário:", userId);

    if (!userId) {
      return NextResponse.json({ error: "UserId inválido" }, { status: 400 });
    }

    // ==========================
    // 🔥 EXCLUIR USUÁRIO
    // ==========================
    console.log("[DELETE /api/users] Iniciando exclusão em background...");

    // Iniciar exclusão em background (sem await)
    (async () => {
      try {
        console.log("[DELETE /api/users] [BG] Deletando do Auth...");
        await adminAuth.deleteUser(userId);

        console.log(
          "[DELETE /api/users] [BG] Deletando do Firestore via REST...",
        );
        await deleteFirestoreDocREST("users", userId);

        console.log("[DELETE /api/users] [BG] ✓ Usuário deletado com sucesso");
      } catch (bgError) {
        console.error(
          "[DELETE /api/users] [BG] Erro durante exclusão:",
          bgError,
        );
      }
    })();

    // Retornar sucesso imediatamente
    console.log(
      "[DELETE /api/users] ✓ Requisição aceita (exclusão em background)",
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/users] ❌ Erro:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 },
    );
  }
}
