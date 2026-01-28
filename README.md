# Field Services — Chamados TI

Um painel administrativo para gerenciamento de chamados e usuários. Projeto baseado em Next.js (App Router), Tailwind CSS e integrações com Firebase (Auth / Firestore).

**Este README é um guia rápido para rodar o projeto localmente e entender os pontos mais importantes.**

---

## Pré-requisitos

- Node.js >= 18
- npm, yarn ou pnpm (uso de `npm` nos exemplos)
- Conta e credenciais do Firebase (se quiser testar integrações Auth/Firestore)

---

## Instalação & execução (desenvolvimento)

1. Instale dependências:

```powershell
npm install
```

2. Crie um arquivo de ambiente local (ex.: `.env.local`) e configure as variáveis necessárias (ver seção abaixo).

3. Inicie o servidor de desenvolvimento:

```powershell
npm run dev
```

Abra http://localhost:3000 no navegador.

---

## Variáveis de ambiente (exemplo)

Crie `.env.local` na raiz com as variáveis que seu projeto usa. Exemplo genérico (não comite este arquivo):

```env
# Next.js
NEXT_PUBLIC_APP_NAME="Field Services"

# Firebase (exemplos - ajuste conforme seu setup)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
```

Observação: não inclua credenciais reais no repositório. Use `.gitignore` (já incluído) para proteger arquivos sensíveis.

---

## Principais scripts

- `npm run dev` — roda o app em modo desenvolvimento
- `npm run build` — cria a build para produção
- `npm start` — inicia a build em produção (após `npm run build`)

---

## Fluxo de administração de usuários (resumo)

- O painel tem ações de administrador (mudar prédio, reset de senha, deletar usuário).
- Fluxo de reset de senha (admin): o servidor gera uma senha temporária e cria um token de uso-único. O admin recupera a senha uma vez e entrega ao usuário.
- Nota: em desenvolvimento a senha temporária pode estar configurada como `123456` se você tiver solicitado isso — troque para algo mais seguro em produção.

---

## Segurança e boas práticas

- Nunca commit secrets (.env, service account keys, certificados).
- Use o `.gitignore` já incluído para proteger arquivos sensíveis.
- Para produção, gere senhas temporárias fortes e force alteração no primeiro login.

---

## Contribuindo

- Abra uma issue antes de grandes mudanças.
- Faça fork / branch e envie PR com descrição clara das mudanças.

---

## Remover segredos do histórico

Se você cometeu acidentalmente um segredo no Git, remova-o do índice e considere usar `git filter-repo` ou BFG para limpar o histórico.

---

Se quiser, eu posso adicionar uma seção de Deploy (Vercel / Firebase Hosting) ou um guia de configuração do Firebase passo a passo.

---

## Deploy no Vercel

Para fazer o deploy no Vercel é necessário definir as credenciais do Firebase Admin como variáveis de ambiente no projeto (Project Settings → Environment Variables). Quando o deploy roda no Vercel não deve haver arquivo `serviceAccountKey.json` no repositório — o projeto usa variáveis `FIREBASE_*` em produção.

Variáveis requeridas:

- `FIREBASE_PROJECT_ID` = seu `project_id` do Firebase (ex.: `tasks-field-services`)
- `FIREBASE_CLIENT_EMAIL` = `client_email` do service account (ex.: `firebase-adminsdk-xxxx@tasks-field-services.iam.gserviceaccount.com`)
- `FIREBASE_PRIVATE_KEY` = a `private_key` inteira do service account, com quebras de linha substituídas por `\\n` (ex.: `-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n`)

Dicas:

- Defina as variáveis para os ambientes `Preview` e `Production` no painel do Vercel.
- No `FIREBASE_PRIVATE_KEY` copie a chave completa e substitua quebras de linha por `\\n` (alguns CLIs/portais pedem isso). O código do projeto faz o `replace('\\n', '\n')` automaticamente.
- Se preferir manter um arquivo local para desenvolvimento, crie um `.env.local` com:

```env
FIREBASE_PROJECT_ID=tasks-field-services
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@tasks-field-services.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n"
```

- Em desenvolvimento o projeto inclui um helper que cria `serviceAccountKey.json` a partir das variáveis `FIREBASE_*` (veja `src/lib/create-service-account.ts`). Em produção no Vercel recomendamos usar somente variáveis de ambiente.

Se quiser, eu posso também abrir um Pull Request desta branch para `main` (ou outra branch) após o push.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
