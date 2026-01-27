const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Ler .env.local manualmente
const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length > 0) {
    let value = rest.join("=").trim();
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const projectId = env.FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
// Convert literal \n to actual newlines
let privateKey = env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

console.log("Project ID:", projectId);
console.log("Client Email:", clientEmail);
console.log("Private Key exists:", !!privateKey);
console.log("Private Key length:", privateKey?.length);
console.log("First 100 chars:", privateKey?.substring(0, 100));

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
const base64url = (str) => {
  if (typeof str === "string") {
    str = Buffer.from(str);
  }
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));
const message = `${encodedHeader}.${encodedPayload}`;

console.log("\n=== JWT Parts ===");
console.log("Header:", header);
console.log("Payload:", payload);
console.log("Message (before signature):", message.substring(0, 50) + "...");

// Assinar com a chave privada
const signer = crypto.createSign("RSA-SHA256");
signer.update(message);
const signature = signer.sign(privateKey);
const encodedSignature = base64url(signature);

const jwt = `${message}.${encodedSignature}`;

console.log("\n=== Generated JWT ===");
console.log(jwt);

// Decodificar para validação
const decoded = jwt.split(".").map((part, i) => {
  try {
    const decoded = Buffer.from(part, "base64").toString("utf8");
    try {
      return JSON.parse(decoded);
    } catch {
      return decoded;
    }
  } catch {
    return part;
  }
});

console.log("\n=== Decoded JWT ===");
console.log("Header:", decoded[0]);
console.log("Payload:", decoded[1]);
console.log("Signature (base64):", decoded[2]?.substring(0, 50) + "...");

// Testar o OAuth
console.log("\n=== Testing OAuth Exchange ===");
fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  }).toString(),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("OAuth Response:", JSON.stringify(data, null, 2));
    if (data.access_token) {
      console.log("\n✅ SUCCESS! Token obtained:", data.access_token.substring(0, 30) + "...");
    } else {
      console.log("\n❌ FAILED! No access_token in response");
    }
  })
  .catch((err) => console.error("❌ Error:", err.message));
