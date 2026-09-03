# Custom Employee Portal

Web-based employee portal with authentication and Role-Based Access Control (RBAC), integrating Zoho One APIs so employees can access only the Zoho apps permitted by their role — without ever entering individual Zoho credentials.

## Role → App mapping
| Role | Zoho App |
|---|---|
| HR | Zoho People |
| Sales | Zoho CRM |
| Support | Zoho Desk |
| Finance | Zoho Books |
| Admin | All apps + user/role management |

## Prerequisites
- Node.js 18+
- PostgreSQL running locally (or update `backend/src/config/db.js` for MySQL/MongoDB)
- A Zoho One free trial account

## 1. Zoho API setup
1. Sign up at https://www.zoho.com/one/ (free trial).
2. Go to https://api-console.zoho.com → **Add Client** → Server-based Application.
3. Note the `Client ID` and `Client Secret`.
4. Generate an authorization code via the self-client / server-based flow with the scopes you need (CRM, Books, Desk, People), then exchange it for a **refresh token**:
   ```
   POST https://accounts.zoho.com/oauth/v2/token
     ?grant_type=authorization_code
     &client_id=YOUR_CLIENT_ID
     &client_secret=YOUR_CLIENT_SECRET
     &redirect_uri=YOUR_REDIRECT_URI
     &code=THE_CODE_YOU_RECEIVED
   ```
5. Copy the `refresh_token` from the response into `backend/.env`.

## 2. Backend setup
```bash
cd backend
cp .env.example .env
# edit .env with your DB creds + Zoho credentials
npm install
npm run seed    # creates roles, permissions, and an Admin user (admin@company.com / Admin@123)
npm run dev     # starts on http://localhost:5000
```

## 3. Frontend setup
```bash
cd frontend
npm install
npm run dev     # starts on http://localhost:5173, proxies /api to :5000
```

## 4. Try it out
1. Open http://localhost:5173 → redirected to `/login`.
2. Log in as `admin@company.com` / `Admin@123`.
3. Go to **Admin Panel** → create an HR/Sales/Support/Finance user.
4. Log out, log in as that user → dashboard shows only their permitted Zoho app.
5. Confirm calling `/api/zoho/zoho_books/...` as a non-Finance user returns `403`.

## Project structure
```
custom-employee-portal/
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── controllers/  # route handlers
│   │   ├── middlewares/  # JWT verification + RBAC
│   │   ├── models/       # Sequelize models & associations
│   │   ├── routes/       # Express routers
│   │   └── services/     # Zoho OAuth + proxy + audit logging
│   ├── seed.js           # seeds roles/permissions/admin user
│   ├── .env.example
│   └── server.js
└── frontend/
    └── src/
        ├── components/   # ProtectedRoute
        ├── pages/        # Login, Dashboard, AdminPanel
        └── utils/        # auth + api helpers
```

## Notes
- Passwords are hashed with bcrypt; JWTs are signed with `JWT_SECRET` and expire per `JWT_EXPIRES_IN`.
- The Zoho access token is fetched once and cached in memory until near expiry — the backend never asks employees for Zoho credentials.
- Every proxied Zoho call and every admin action writes to `AuditLogs`, visible in the Admin Panel.
- This uses a single-role-per-user model for simplicity; the schema (`UserRole` join table) supports multi-role if you want to extend it.
