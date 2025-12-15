# Active Context

Current focus
- Finish and stabilize authentication flows (signup/login/refresh/logout) and ensure the frontend sends the exact payload expected by the backend.

Recent changes
- Added `src/services/api.ts`, `src/services/auth.service.ts`, and `src/context/AuthContext.tsx`.
- Wired `Login` and `Register` components to `AuthContext` and implemented token persistence in `localStorage`.
- Updated signup flow to send `{ name, email, password, confirmPassword }`.
- Added `.gitignore` and project docs; committed changes to `main` branch.

Blockers
- Backend returns HTTP 400 on `/auth/signup` in prior tests — need the backend JSON error body to adapt payload field names or validation.

Next steps
1. Confirm backend signup contract (field names, required fields, expected response).
2. Implement Profile page to show `/auth/me` data and allow logout.
3. Wire purchases UI to `src/services/purchases.service.ts`.
4. Add CI checks and simple tests (optional next iteration).

Important environment variables
- `VITE_API_BASE_URL` — base URL for API (default in `.env.example`)
- `VITE_AUTH_STORAGE_KEY` — localStorage key for tokens (default `mercapp_auth`)