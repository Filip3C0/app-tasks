// ⚠️ DEVE SER IMPORTADO ANTES DE QUALQUER OUTRO CÓDIGO
// Desabilita verificação SSL para desenvolvimento
if (process.env.NODE_ENV === "development") {
  console.log("[Init] Desabilitando verificação SSL para desenvolvimento");
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Aguarda um tick para garantir que o processo foi configurado
export const initializeSSLBypass = async () => {
  return Promise.resolve();
};
