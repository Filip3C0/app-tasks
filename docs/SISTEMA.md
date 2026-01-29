# Documentação Completa — Field Services (Chamados TI)

## 1. Visão geral
O sistema **Field Services — Chamados TI** é uma aplicação web para registrar, acompanhar e atender chamados de TI em prédios/locais. Ele possui três perfis principais:

- **Admin**: visão geral, filtros, relatórios e gestão de usuários.
- **Service Desk**: abertura de chamados.
- **Field**: atendimento de chamados do próprio prédio.

A plataforma é construída com **Next.js (App Router)** no frontend e **Firebase** para autenticação, banco de dados (Firestore), notificações push (FCM) e funções (Cloud Functions).

---

## 2. Arquitetura técnica

### 2.1 Frontend (Next.js)
- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS + componentes customizados com Radix UI
- **Páginas**: localizadas em `src/app/**`
- **Lógica de autenticação**: `src/components/auth-guard.tsx`
- **Layout global**: `src/app/layout.tsx`

### 2.2 Backend / Infra (Firebase)
- **Auth**: Firebase Authentication
- **Banco de dados**: Firestore
- **Funções**: Firebase Cloud Functions (v2)
- **Notificações push**: Firebase Cloud Messaging (FCM)

### 2.3 Integrações principais
- **FCM** para notificações push quando um chamado é criado.
- **Cloud Functions** para criação de usuário e registro de tokens.
- **Firestore** para persistência de usuários, chamados, prédios e tokens FCM.

---

## 3. Estrutura de pastas (alto nível)

```
/app-tasks
  /src
    /app              # Rotas e páginas
    /components       # Componentes comuns e UI
    /lib              # Firebase, FCM, helpers
  /functions          # Cloud Functions (Firebase)
  /public             # Service worker e assets
  /docs               # Documentação
```

---

## 4. Rotas do sistema (frontend)

### Públicas
- `/` — Página inicial (link para login)
- `/login` — Autenticação de usuários
- `/loading` — Pós-login (redireciona por perfil)
- `/change-password` — Forçar troca de senha (primeiro login)

### Admin
- `/admin` — Dashboard (KPIs, filtros e relatório)
- `/admin/users` — Gestão de usuários (listar, filtrar, ações)
- `/admin/users/create` — Criar novos usuários
- `/admin/profileAdmin` — Perfil do administrador

### Service Desk
- `/service` — Abrir chamados
- `/service/profile` — Perfil do usuário service

### Field
- `/field` — Lista de chamados do prédio, assumir/finalizar
- `/profile` — Perfil do usuário field

---

## 5. Autenticação e fluxo de acesso

### 5.1 Login
- Login via Firebase Auth (email/senha).
- Após login: rota `/loading` verifica o perfil e redireciona.

### 5.2 Perfis e permissões
- **admin** → Acesso ao dashboard, usuários, relatórios.
- **service** → Acesso à abertura de chamados.
- **field** → Acesso à lista de chamados do prédio.

### 5.3 Primeiro login
- Usuários novos têm `firstLogin=true` no Firestore.
- Ao entrar, são redirecionados para `/change-password`.
- Após troca de senha: `firstLogin=false` e sessão encerrada.

---

## 6. Firestore: modelo de dados

### 6.1 Coleção `users`
Documento identificado pelo `uid` do Firebase Auth.

Campos (principais):
- `name`: string
- `email`: string
- `role`: `admin | service | field`
- `buildingId`: string | null
- `firstLogin`: boolean
- `photoURL`: string (opcional)
- `createdAt`: timestamp
- `updatedAt`: timestamp (opcional)
- `lastPasswordReset`: timestamp (opcional)
- `tempPasswordSetAt`: string ISO (opcional)
- `tempPasswordExpiresAt`: string ISO (opcional)

### 6.2 Coleção `buildings`
Documento de prédio com pelo menos:
- `name`: string

### 6.3 Coleção `tickets`
Documento de chamado.

Campos (principais):
- `code`: string
- `requester`: string
- `sector`: string
- `room`: string
- `description`: string
- `buildingId`: string
- `status`: `aberto | em_atendimento | finalizado`
- `assignedTo`: `{ uid: string, name: string } | null`
- `createdAt`: timestamp
- `startedAt`: timestamp (quando assumido)
- `solvedAt`: timestamp (quando finalizado)

### 6.4 Coleção `fcmTokens`
Documento com ID igual ao token do FCM.

Campos:
- `token`: string
- `userId`: string
- `platform`: string (ex.: `web`)
- `buildingId`: string | null
- `updatedAt`: timestamp

### 6.5 Armazenamento temporário (senha)
- Implementado em memória em `src/lib/temp-store.ts`.
- Utilizado por `/api/users/temp-password`.
- **Observação**: por ser in-memory, não persiste entre instâncias serverless.

---

## 7. Fluxos principais

### 7.1 Criação de chamado (Service)
1. Usuário service acessa `/service`.
2. Preenche formulário e envia.
3. Documento é criado em `tickets` com `status=aberto`.
4. Cloud Function envia push para técnicos do prédio.

### 7.2 Atendimento de chamado (Field)
1. Usuário field acessa `/field`.
2. Carrega `buildingId` do usuário.
3. Exibe chamados do prédio.
4. Ao assumir: `status=em_atendimento`, `assignedTo`, `startedAt`.
5. Ao finalizar: `status=finalizado`, `solvedAt`.

### 7.3 Gestão de usuários (Admin)
- **Criar usuário**: via Cloud Function `createUser`.
- **Alterar prédio**: via `/api/users` (action: `change-building`).
- **Reset de senha**: `/api/users` (action: `set-temp-password`).
- **Excluir usuário**: `/api/users` (DELETE).

### 7.4 Relatórios (Admin)
- Modal `ReportModal` gera PDF com filtros por data, prédio ou técnico.
- Estatísticas: total, abertos, em atendimento, finalizados e taxa de conclusão.

---

## 8. API (Next.js)

### 8.1 `POST /api/create-user`
- Cria usuário no Auth + Firestore.
- Define senha temporária (ex.: `123456`).

### 8.2 `POST /api/users`
Ações:
- `delete` → remove usuário no Auth e Firestore.
- `reset-password` → gera link de reset.
- `change-building` → atualiza `buildingId`.

### 8.3 `PUT /api/users`
Ações:
- `reset-password` → gera link e atualiza `lastPasswordReset`.
- `set-temp-password` → define senha temporária e token de uso único.
- `change-building` → atualiza `buildingId`.

### 8.4 `DELETE /api/users`
- Remove usuário no Auth + Firestore.

### 8.5 `POST /api/users/temp-password`
- Troca um `token` de uso único por senha temporária.

---

## 9. Cloud Functions (Firebase)

### 9.1 `createUser`
- Valida se solicitante é admin.
- Cria usuário no Auth.
- Registra no Firestore em `users`.

### 9.2 `registerFcmToken`
- Somente `role=field`.
- Salva token no Firestore (`fcmTokens`).

### 9.3 `notifyFieldOnTicketCreatedV2`
- Trigger em `tickets/{ticketId}`.
- Obtém técnicos do mesmo prédio.
- Envia push via FCM (multicast).

---

## 10. Push Notifications (FCM)

### 10.1 Arquivos-chave
- Cliente: `src/lib/fcm.ts`
- Service Worker: `public/firebase-messaging-sw.js`

### 10.2 Fluxo
1. Field abre `/field` → chama `registerFieldPushToken`.
2. Token é registrado no Firestore via function `registerFcmToken`.
3. Ao criar ticket, function envia push para tokens.

### 10.3 Requisitos
- HTTPS obrigatório.
- VAPID key pública no env: `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.

---

## 11. Configurações de ambiente

### 11.1 Variáveis de ambiente (cliente)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_DATABASE_URL
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
```

### 11.2 Variáveis de ambiente (server/func)
```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

---

## 12. Deploy

### 12.1 Vercel (frontend)
1. Definir as env vars do cliente e server no painel.
2. Fazer deploy do projeto.
3. Garantir acesso a `/firebase-messaging-sw.js`.

### 12.2 Firebase Functions
```
npm --prefix functions run build
firebase deploy --only functions
```

---

## 13. Troubleshooting

### Push não registra token
- Verifique se `NEXT_PUBLIC_FIREBASE_VAPID_KEY` está configurada.
- Confirmar HTTPS.
- Testar em outro navegador para excluir bloqueios de rede.

### Usuário redireciona para login
- Verificar documento `users/{uid}` existe.
- Conferir `role` e `firstLogin`.

---

## 14. Melhorias futuras (sugestões)
- Persistir senha temporária em Firestore (evitar in-memory).
- Automatizar envio de email no reset de senha.
- Relatórios com filtros avançados e exportação CSV.
- Dashboards adicionais para performance por técnico.

---

## 15. Referências no código
- Auth Guard: `src/components/auth-guard.tsx`
- FCM: `src/lib/fcm.ts`
- SW: `public/firebase-messaging-sw.js`
- Functions: `functions/src/*`
- API: `src/app/api/*`
