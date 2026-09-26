# Backend API

Express API service for the Vite frontend.

## Run locally

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

The API listens on `http://localhost:3000` by default. `GET /api/health` returns `{ "status": "ok" }`.

Set `PORT` to change the listening port and `FRONTEND_ORIGIN` to change the allowed browser origin.