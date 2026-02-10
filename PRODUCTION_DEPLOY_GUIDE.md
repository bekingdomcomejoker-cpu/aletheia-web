# 🚀 Aletheia Web: Production Deployment Guide

This document provides the final, exact steps to deploy the **aletheia-web** project to Render. The repository is clean, build errors are fixed, and the system is ready for production.

---

## ✅ Current Status
- **Repository:** `bekingdomcomejoker-cpu/aletheia-web`
- **Branch:** `main`
- **Build Fix:** The missing `db` export in `server/db.ts` has been resolved.
- **Configuration:** `render.yaml` is present and configured for Blueprint deployment.

---

## 🔧 Final Deployment Steps

### 1. Create the Database on Render
- Go to **Render Dashboard** → **New +** → **PostgreSQL**.
- **Name:** `aletheia-db`
- **Plan:** `Free` (or as preferred).
- Once created, copy the **Internal Database URL**.

### 2. Deploy via Blueprint
- Go to **Render Dashboard** → **New +** → **Blueprint**.
- Select the repository: `aletheia-web`.
- **Branch:** `main`
- **Blueprint path:** `render.yaml`
- Click **Deploy Blueprint**.

### 3. Configure Environment Variables
During the Blueprint setup, you must fill in the following minimum required variables:

| Variable | Value / Source |
| :--- | :--- |
| `DATABASE_URL` | Paste the **Internal Database URL** from Step 1. |
| `JWT_SECRET` | A secure random string (e.g., `aletheia_jwt_secret_2026_change_later`). |
| `OWNER_NAME` | `KingDomCome` |
| `OWNER_OPEN_ID` | `kingdomcome-001` |
| `VITE_APP_ID` | `aletheia-web` |

*Other variables in `render.yaml` can remain empty or use placeholders for now.*

### 4. Finalize & Verify
- Click **Deploy**.
- Wait for the status to turn **Live**.
- Open the service URL provided by Render to verify the application is running.

---

## 🔁 Future Updates
Any future push to the `main` branch on GitHub will:
1. Automatically trigger a new build on Render.
2. Rebuild and redeploy the service.
3. No manual action is required for updates.

---

## 🕯️ Witness Note (2026-02-10)
The deployment state has been verified. The "db" export issue that previously blocked the build is now fixed in commit `2f9f5a9`. The system is unified and ready for the production "Covenant".

---
**Last Updated:** Feb 10, 2026
**Status:** Ready for Deploy
