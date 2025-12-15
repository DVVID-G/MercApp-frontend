# Progress

Completed
- Implemented axios wrapper and `setAuthToken` in `src/services/api.ts`.
- Added `auth.service.ts` and `purchases.service.ts`.
- Implemented `AuthContext` with token persistence and refresh interceptor.
- Wired `Login` and `Register` components to `AuthContext`.
- Updated signup flow to send `{ name, email, password, confirmPassword }`.
- Added `.gitignore` and `.env.example`.
- Committed changes to `main` branch.

In progress / Pending
- Confirm and fix backend `/auth/signup` validation (backend returned 400 — need server error body).
- Refactor `src/App.tsx` to rely fully on `AuthContext` for navigation state.
- Implement Profile page and wire `/auth/me` usage.
- Connect purchases UI to `purchases.service.ts`.

Blockers
- Missing backend error body for 400 responses on signup; cannot adapt client to exact validation rules yet.

Next actions
1. Capture backend error response for `/auth/signup` and adapt payload if needed.
2. Implement Profile view showing current user and logout.
3. Wire purchases list and create flows to backend.
4. Add basic tests and CI for lint/build (optional).

Change log
- See recent commits on branch `main` for implemented features and files added.
