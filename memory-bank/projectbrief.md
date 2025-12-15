# Project Brief — MercApp (Frontend)

Purpose
- Provide a mobile-first React + Vite + TypeScript frontend for MercApp, a personal purchase tracking app.

Scope
- Implement authentication (signup, login, refresh, logout), user profile, purchases list/create/detail, barcode scanning, and basic UI flow for shopping management.

Goals
- Connect reliably to backend API (JWT auth), preserve existing UI/UX, and make the app easy to run locally for development.

Acceptance Criteria
- App runs locally via `npm run dev` and connects to backend configured via `VITE_API_BASE_URL`.
- Authentication flows (signup/login/refresh/logout) work end-to-end with token persistence.
- Purchases can be created and listed using authenticated endpoints.

Stakeholders
- Product owner: DVVID-G
- Developers: repository maintainers
- Backend team: whoever owns the API described in `READMEBACK.MD`

Notes
- Keep UI markup and Tailwind classes unchanged unless UX improvements are explicitly requested.