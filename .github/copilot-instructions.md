# Copilot instructions — MercApp (Frontend)

Purpose: give AI coding agents the minimal, concrete knowledge to be productive in this repo.

Quick facts
- Tech: React + Vite + TypeScript + Tailwind (mobile-first). Files use `.tsx` for components.
- UI: UI components live under `src/components/` and low-level primitives under `src/components/ui/`.
- Services: network code lives in `src/services/` (see `api.ts`, `auth.service.ts`, `purchases.service.ts`).
- Context: global state (auth) lives in `src/context/AuthContext.tsx`.
- Navigation: the app currently uses internal state navigation in `src/App.tsx` (not `react-router`), so changing navigation must preserve the existing UI/UX unless asked.

What to change and why
- Preserve visual/UI code. Avoid changing Tailwind classes or structure in `src/components/*` unless the user explicitly asks to update UI/UX.
- Put API integration code in `src/services/*`. Example: `src/services/api.ts` creates an `axios` instance and exposes `setAuthToken(token)`.
- Auth flow: backend returns `accessToken` and `refreshToken` (see `READMEBACK.MD`). Frontend stores them under `localStorage` key `mercapp_auth` (configurable with `VITE_AUTH_STORAGE_KEY`). Use `AuthContext` to centralize login/logout/refresh and to add an axios interceptor for 401→refresh.

Key files to inspect before editing
- `src/App.tsx` — top-level UI and current screen/state-based navigation.
- `src/components/Login.tsx` — login UI wired to `AuthContext.login()`; avoid adding direct `useNavigate` unless you add a router wrapper.
- `src/context/AuthContext.tsx` — handles token persistence, `api` interceptor for refresh, and `user` population via `/auth/me`.
- `src/services/api.ts` — axios wrapper; set `baseURL` from `import.meta.env.VITE_API_BASE_URL`.
- `vite.config.ts` — dev server settings (port/HMR). The project sets a dev port here (changed from 3000 to avoid backend conflict).
- `.env.example` — contains `VITE_API_BASE_URL` and `VITE_AUTH_STORAGE_KEY` defaults.

Important patterns and conventions
- Mobile-first: components are sized for a mobile viewport (`max-w-[390px]` in `App.tsx`). Keep responsive and touch-friendly behaviour.
- Tailwind utility classes are used widely — prefer adding new utilities over inline CSS files.
- Directory responsibilities:
  - `src/components/`: feature components (Login, Register, Dashboard, etc.)
  - `src/components/ui/`: design system primitives (buttons, inputs, dialogs)
  - `src/services/`: HTTP clients and domain services (auth, purchases)
  - `src/context/`: React Context providers (AuthContext)

Network & backend expectations
- Base URL is read from `VITE_API_BASE_URL` (default `http://localhost:3000`). Keep this env var for local testing.
- Auth endpoints expected (from backend README):
  - POST `/auth/login` → { accessToken, refreshToken }
  - POST `/auth/refresh` → { accessToken, refreshToken? }
  - POST `/auth/logout` → expects `{ refreshToken }`
  - GET `/auth/me` → current user (optional but used by `AuthContext`)
- Protected endpoints require header `Authorization: Bearer <accessToken>` — use `setAuthToken` on the axios instance.

Developer workflows & commands
- Start dev server (Vite):
  - `npm install` (once)
  - `npm run dev` (Vite will pick a free port if configured port is used)
- Build: `npm run build`
- No frontend tests are present by default. If adding tests follow the repo's TypeScript + Vite conventions (use Vitest if requested).

Agent behaviour rules (must-follow)
- Do not alter component markup or Tailwind classes that affect visual layout unless task explicitly requests UI/UX changes.
- When adding network calls, put them in `src/services/*` and update `AuthContext` only for auth/token flows.
- Preserve current navigation behaviour. If migrating to `react-router`, first ask the user. Migration requires:
  1. Wrapping root with `<BrowserRouter>` in `src/main.tsx`.
  2. Converting `src/App.tsx` to use `<Routes>` and updating components to use `useNavigate`/`Link`.
- Add environment variables to `.env.example` and reference them via `import.meta.env.VITE_...`.

Notes & examples
- Example: set header after login
  - `setAuthToken(accessToken)` — implemented in `src/services/api.ts` to set `api.defaults.headers.common.Authorization`.
- Example: service call
  - `src/services/purchases.service.ts` exports `createPurchase(payload)` which POSTs to `/purchases` using the `api` instance.

Best practices (project-specific)
- Single Responsibility: each file should have one clear responsibility. Keep UI-only components in `src/components/` and business/network logic in `src/services/`.
- Types & Generics: prefer typed interfaces and generics for reusable utilities and services. Example: `api.get<T>(url): Promise<T>` pattern — annotate service responses with domain types (e.g., `Purchase`, `User`).
- Document public functions and components: add a short JSDoc above exported functions/components explaining purpose, inputs, and outputs. Example:
  ```ts
  /**
   * Create a purchase for the current user.
   * @param payload PurchaseCreatePayload
   * @returns Created Purchase
   */
  export async function createPurchase(payload: PurchaseCreatePayload): Promise<Purchase> { ... }
  ```
- Small functions & pure helpers: keep utilities small and pure. Put shared helpers in `src/components/ui/utils.ts` or `src/services/utils.ts` depending on domain.
- Error handling: services should throw structured errors (with `status` and `message`) so UI can display localized messages. Do not swallow errors silently.
- Naming: prefer explicit names (e.g., `createPurchase`, `getPurchases`, `loginRequest`) rather than generic verbs.
- Tests: when adding tests, mock `src/services/api.ts` rather than concrete axios so tests stay fast and deterministic.
- Security note: this frontend currently stores `accessToken`/`refreshToken` in `localStorage` (key `mercapp_auth`). For production consider using httpOnly cookies — coordinate with backend team before changing.

Code style & documentation
- Keep functions small (<= 40 lines) and document exported APIs with JSDoc. Use TypeScript types for component props and service payloads (avoid `any` where possible).
- When creating new components follow existing patterns: functional components with typed props, Tailwind classes for styling, `Input` and `Button` primitives from `src/components/ui/` where possible.
- Use generics for service response typing, e.g. `async function fetchApi<T>(url: string): Promise<T> { const res = await api.get<T>(url); return res.data; }`.

If anything is unclear
- Ask the user whether the change is allowed to touch UI markup or only wiring/services.
- If adding routes or changing token storage policy (localStorage → cookies) request backend changes or explicit approval.

End of file

Please review and tell me what to clarify or expand.