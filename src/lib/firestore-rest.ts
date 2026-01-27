/**
 * Atualiza um documento no Firestore usando a API REST
 * Útil quando o SDK fica travado por problemas de conexão
 */
export async function updateFirestoreREST(
  collectionName: string,
  documentId: string,
  data: Record<string, any>,
  accessToken?: string,
): Promise<void> {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const databaseId = "(default)";

    // Construir a URL REST com updateMask para fazer merge
    const fieldPaths = Object.keys(data)
      .map((f) => `updateMask.fieldPaths=${f}`)
      .join("&");
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${documentId}?${fieldPaths}`;

    // Se não tiver token, precisamos gerar um
    let token = accessToken;
    if (!token) {
      // Usar a variável de ambiente FIREBASE_ACCESS_TOKEN se disponível
      // Caso contrário, isso fará um erro - o token precisa ser gerado externamente
      if (process.env.FIREBASE_ACCESS_TOKEN) {
        token = process.env.FIREBASE_ACCESS_TOKEN;
      } else {
        // Fallback: gerar token usando a service account
        const generateToken = await generateAccessToken();
        token = generateToken;
      }
    }

    console.log("[REST] Fazendo PATCH para:", url.substring(0, 100) + "...");

    // Fazer update via REST com updateMask
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fields: Object.keys(data).reduce((acc, key) => {
          const value = data[key];
          acc[key] = convertToFirestoreValue(value);
          return acc;
        }, {} as any),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Firestore REST error: ${response.status} - ${error}`);
    }

    console.log("[REST] ✓ Documento atualizado com sucesso (merge)");
  } catch (error) {
    console.error("[REST] Erro:", error);
    throw error;
  }
}

/**
 * Deleta um documento no Firestore usando a API REST
 */
export async function deleteFirestoreDocREST(
  collectionName: string,
  documentId: string,
  accessToken?: string,
): Promise<void> {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const databaseId = "(default)";

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionName}/${documentId}`;

    // Se não tiver token, precisamos gerar um
    let token = accessToken;
    if (!token) {
      if (process.env.FIREBASE_ACCESS_TOKEN) {
        token = process.env.FIREBASE_ACCESS_TOKEN;
      } else {
        const generateToken = await generateAccessToken();
        token = generateToken;
      }
    }

    console.log("[REST] Deletando documento:", url.substring(0, 100) + "...");

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Firestore REST error: ${response.status} - ${error}`);
    }

    console.log("[REST] ✓ Documento deletado com sucesso");
  } catch (error) {
    console.error("[REST] Erro ao deletar:", error);
    throw error;
  }
}

/**
 * Gera um access token usando a service account
 * Sem usar firebase-admin para evitar problemas de conexão
 */
async function generateAccessToken(): Promise<string> {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Variáveis de ambiente Firebase não configuradas");
    }

    // Criar JWT manualmente
    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientEmail,
      sub: clientEmail,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/cloud-platform",
    };

    // Base64url encode
    const base64url = (str: string) => {
      return Buffer.from(str)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    };

    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(payload));
    const message = `${encodedHeader}.${encodedPayload}`;

    // Assinar com a chave privada
    const crypto = require("crypto");
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(message);
    const signature = signer.sign(privateKey);
    const encodedSignature = base64url(signature);

    const jwt = `${message}.${encodedSignature}`;

    // Trocar JWT por access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }).toString(),
    });

    const tokenData = (await tokenResponse.json()) as any;

    console.log("[TOKEN] Response status:", tokenResponse.status);
    console.log("[TOKEN] Response data:", tokenData);

    if (!tokenData.access_token) {
      throw new Error(
        `Falha ao obter access token: ${JSON.stringify(tokenData)}`,
      );
    }

    console.log("[TOKEN] ✓ Access token gerado com sucesso");
    return tokenData.access_token;
  } catch (error) {
    console.error("[TOKEN] Erro ao gerar token:", error);
    throw error;
  }
}

/**
 * Converter valor JavaScript para formato Firestore
 */
function convertToFirestoreValue(value: any): any {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (typeof value === "number") {
    return { integerValue: String(value) };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(convertToFirestoreValue),
      },
    };
  }

  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.keys(value).reduce((acc, key) => {
          acc[key] = convertToFirestoreValue(value[key]);
          return acc;
        }, {} as any),
      },
    };
  }

  return { stringValue: String(value) };
}
