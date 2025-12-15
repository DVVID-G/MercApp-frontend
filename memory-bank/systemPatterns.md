# System Patterns

Architecture
- UI layer: `src/components/` (feature components) and `src/components/ui/` (primitives)
- Services: `src/services/` contains API wrappers (`api.ts`) and domain services (`auth.service.ts`, `purchases.service.ts`).
- State: `src/context/AuthContext.tsx` centralizes authentication and token handling.

Key patterns
- Axios instance (`api`) with `setAuthToken` to set `Authorization` header.
- AuthContext installs an axios response interceptor to attempt token refresh on 401 responses.
- Services throw errors with structured response (status/message) to allow UI to show messages.

Conventions
- Keep network logic in `src/services/*`.
- UI components are presentational; place side effects in services or context.
- Use TypeScript types for service responses.

Files of interest
- `src/services/api.ts` — axios setup and `setAuthToken`
- `src/services/auth.service.ts` — login/refresh/logout/signup
- `src/context/AuthContext.tsx` — provider, login/signup/logout, token persistence
- `src/components/Register.tsx` and `src/components/Login.tsx` — UI forms wired to `AuthContext`