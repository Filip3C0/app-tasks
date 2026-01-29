import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const registerFcmToken = onCall(async ({ auth, data }) => {
  if (!auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado");
  }

  const token = (data?.token as string | undefined)?.trim();
  const platform = (data?.platform as string | undefined)?.trim() ?? "web";

  if (!token) {
    throw new HttpsError("invalid-argument", "Token FCM é obrigatório");
  }

  const userSnap = await admin.firestore().doc(`users/${auth.uid}`).get();
  if (!userSnap.exists) {
    throw new HttpsError("failed-precondition", "Usuário não encontrado");
  }

  const role = userSnap.data()?.role;
  const buildingId = userSnap.data()?.buildingId ?? null;

  if (role !== "field") {
    throw new HttpsError(
      "permission-denied",
      "Apenas técnicos podem registrar push",
    );
  }

  const ref = admin.firestore().collection("fcmTokens").doc(token);
  await ref.set(
    {
      token,
      userId: auth.uid,
      platform,
      buildingId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { success: true };
});
