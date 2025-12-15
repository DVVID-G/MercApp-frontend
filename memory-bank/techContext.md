# Tech Context

Stack
- React + Vite + TypeScript
- Tailwind CSS for styling (mobile-first)
- Axios for HTTP client

Dev tools & scripts
- `npm install` — install deps
- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle

Environment variables
- `VITE_API_BASE_URL` — API base URL (e.g. `http://localhost:3000`)
- `VITE_AUTH_STORAGE_KEY` — localStorage key for auth tokens

Project conventions
- Keep UI markup and Tailwind classes unchanged unless UX changes requested.
- Put network logic in `src/services/` and business logic in `src/context/`.

Notes on running locally (Windows PowerShell)
```powershell
npm install; npm run dev
```
If port 3000 is used by the backend, Vite will choose another free port unless configured in `vite.config.ts`.