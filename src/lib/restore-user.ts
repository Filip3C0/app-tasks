import { adminDb } from "./firebase-admin";

/**
 * Script para restaurar dados do usuário que foi parcialmente deletado
 * Restaura os campos perdidos
 */
export async function restoreUserData() {
  try {
    const userId = "2g9AXDHOsdh6jbNsFgVAgatuIcc2";

    // Dados que devem ser restaurados
    const restoredData = {
      email: "teste1@gmail.com",
      name: "Filipe Teste",
      photoURL: "",
      role: "field",
      firstLogin: false,
      createdAt: new Date("2026-01-27T09:50:16"),
      // Mantém os novos dados
      buildingId: "administrativo",
      updatedAt: new Date(),
    };

    console.log("[RESTORE] Restaurando dados do usuário:", userId);

    // Usar set com merge para restaurar sem perder novos dados
    await adminDb.collection("users").doc(userId).set(restoredData, {
      merge: true,
    });

    console.log("[RESTORE] ✓ Usuário restaurado com sucesso");
  } catch (error) {
    console.error("[RESTORE] Erro:", error);
    throw error;
  }
}

// Executar se este arquivo for executado diretamente
if (require.main === module) {
  restoreUserData()
    .then(() => {
      console.log("[RESTORE] Pronto!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[RESTORE] Falha:", error);
      process.exit(1);
    });
}
