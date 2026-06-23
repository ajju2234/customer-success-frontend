# Customer Success Platform — Frontend

Next.js (App Router) frontend for the AI-powered Customer Success platform: auth, customer &
interaction management, AI insight views, and a metrics dashboard with charts.

> This is the **frontend** repository. The API lives in **`customer-success-backend`**, which also
> hosts the `docker-compose.yml` for running the full stack.

---

## 🚀 Live Demo

**App:** https://customerorbit.vercel.app — every demo account's password is **`Test@1234`**.

| Role | Email |
|------|-------|
| Admin (full access + user management) | `sarah.chen@csp.com` |
| Manager (org-wide, no user mgmt) | `michael.rodriguez@csp.com` |
| CSM (own customers only) | `emily.watson@csp.com` |

Log in as each to see role-based access differ (the **Users** link is admin-only; a CSM sees only their own data). Full credentials + RBAC matrix are in the **backend repo's README**.

---

## 🧱 Stack

Next.js 14 (App Router) · TypeScript · Redux Toolkit · Axios · React Hook Form + Zod ·
Recharts · Tailwind CSS.

## ✨ What's here

- **Auth flow** — login / register / **forgot & reset password**, JWT access token in memory +
  httpOnly refresh cookie, Axios interceptor that auto-refreshes on 401; protected routes guarded
  client-side (the access token is rehydrated from the refresh cookie on load).
- **Customers** — list (search, status filter, pagination), create/edit (Zod-validated), detail, delete.
- **Interactions** — list with filters, create (notes → AI insight), detail with an AI insight panel
  (summary, sentiment, action items, risks) + regenerate + fallback state.
- **Dashboard** — KPI cards + charts (status bar, sentiment pie, interactions line) + recent activity.
- **State** — Redux Toolkit slices (`auth`, `customers`, `interactions`, `dashboard`) with `createAsyncThunk`.

---

## 🚀 Run

### Full stack (recommended)
Use Docker Compose from the **backend** repo — it builds this frontend from a sibling folder. See
the backend README for the clone layout and `docker compose up`.

### Frontend only (against a running API)

```bash
pnpm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local   # point at your API
pnpm dev      # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:8000` if unset.

---

## 📁 Structure

```
src/
├── app/
│   ├── (auth)/        # login, register, forgot-password, reset-password
│   └── (app)/         # dashboard, customers (+ [id]), interactions (+ [id]), profile
├── store/             # Redux Toolkit store + slices (auth, customers, interactions, dashboard)
├── lib/               # axios (interceptors + refresh), api, types, zod validation
└── components/        # forms, modals, insight panel, theme toggle, ui primitives
```

## 📝 Notes

Access token is kept in memory (not localStorage) for XSS safety and re-obtained on load via the
refresh cookie. Validation mirrors the backend (Zod ↔ Pydantic). Light/dark theme toggle (top-right).
Built with `output: "standalone"` for a small Docker image.
