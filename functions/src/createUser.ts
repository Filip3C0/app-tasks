import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

const DEFAULT_PASSWORD = "123456";

export const createUser = onCall(async ({ auth, data }) => {
   if (!auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado");
  }


  const requesterSnap = await admin
    .firestore()
    .doc(`users/${auth.uid}`)
    .get();

  if (!requesterSnap.exists || requesterSnap.data()?.role !== "admin") {
    throw new HttpsError(
      "permission-denied",
      "Apenas administradores podem criar usuários"
    );
  }


  const { name, email, role, buildingId } = data;

  if (!name || !email || !role) {
    throw new HttpsError(
      "invalid-argument",
      "Nome, email e perfil são obrigatórios"
    );
  }

  if (!["admin", "service", "field"].includes(role)) {
    throw new HttpsError("invalid-argument", "Perfil inválido");
  }

  
  let resolvedBuildingId: string | null = null;

  if (role === "field") {
    if (!buildingId) {
      throw new HttpsError(
        "invalid-argument",
        "Técnico deve ter um prédio definido"
      );
    }

    const buildingSnap = await admin
      .firestore()
      .doc(`buildings/${buildingId}`)
      .get();

    if (!buildingSnap.exists) {
      throw new HttpsError(
        "invalid-argument",
        "Prédio informado não existe"
      );
    }

    resolvedBuildingId = buildingId;
  }

 
  let userRecord;

  try {
    userRecord = await admin.auth().createUser({
      email,
      password: DEFAULT_PASSWORD,
      displayName: name,
    });
  } catch (err: any) {
    if (err.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "Email já cadastrado");
    }

    throw new HttpsError("internal", "Erro ao criar usuário");
  }


  await admin.firestore().doc(`users/${userRecord.uid}`).set({
    name,
    email,
    role,
    buildingId: resolvedBuildingId, 
    firstLogin: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    uid: userRecord.uid,
    defaultPassword: DEFAULT_PASSWORD,
  };
});
