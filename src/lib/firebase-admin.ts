import "./create-service-account";
import "./init-firebase";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Desabilitar verificação SSL para desenvolvimento (Firestore connection issues)
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

if (!admin.apps.length) {
  console.log("[Firebase-Admin] Inicializando Firebase Admin SDK");
  console.log("[Firebase-Admin] NODE_ENV:", process.env.NODE_ENV);
  console.log("[Firebase-Admin] Project ID:", process.env.FIREBASE_PROJECT_ID);

  try {
    // Prefer environment variables in production (Vercel) to avoid
    // relying on an on-disk `serviceAccountKey.json` file that may be
    // absent or sanitized in the deployment environment.
    const projectIdEnv = process.env.FIREBASE_PROJECT_ID;
    const clientEmailEnv = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY || "";

    const keyPath = path.join(process.cwd(), "serviceAccountKey.json");

    const useEnv = !!(projectIdEnv && clientEmailEnv && privateKeyEnv);

    if (useEnv) {
      console.log(
        "[Firebase-Admin] Inicializando a partir de variáveis de ambiente",
      );

      if (privateKeyEnv.includes("\\n")) {
        privateKeyEnv = privateKeyEnv.replace(/\\n/g, "\n");
      }

      const serviceAccount: any = {
        project_id: projectIdEnv,
        projectId: projectIdEnv,
        client_email: clientEmailEnv,
        clientEmail: clientEmailEnv,
        private_key: privateKeyEnv,
        privateKey: privateKeyEnv,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${projectIdEnv}.firebaseio.com`,
      });
    } else if (fs.existsSync(keyPath)) {
      console.log("[Firebase-Admin] Usando serviceAccountKey.json");
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

      if (!serviceAccount || typeof serviceAccount.project_id !== "string") {
        const msg = "serviceAccountKey.json is missing 'project_id' (string)";
        console.error("[Firebase-Admin] " + msg);
        throw new Error(msg);
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      });
    } else {
      const missing: string[] = [];
      if (!projectIdEnv) missing.push("FIREBASE_PROJECT_ID");
      if (!clientEmailEnv) missing.push("FIREBASE_CLIENT_EMAIL");
      if (!privateKeyEnv) missing.push("FIREBASE_PRIVATE_KEY");

      const msg = `Missing Firebase credentials and no serviceAccountKey.json found. Set env vars or add serviceAccountKey.json. Missing: ${missing.join(", ")}`;
      console.error("[Firebase-Admin] " + msg);
      throw new Error(msg);
    }

    console.log(
      "[Firebase-Admin] ✓ Firebase Admin SDK inicializado com sucesso",
    );
  } catch (error) {
    console.error(
      "[Firebase-Admin] ❌ Erro ao inicializar Firebase Admin SDK:",
      error,
    );
    throw error;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
