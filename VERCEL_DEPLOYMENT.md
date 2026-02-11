# Aletheia Web: Vercel Deployment Guide

## Overview

Aletheia Web is a **Stateless Access Layer** and **Witness Dashboard** for the Omega OS backend. It is designed to be deployed on Vercel as a lightweight, fast frontend that connects to your Omega OS backend on Render.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  ALETHEIA WEB (Vercel)                  │
│              Stateless Frontend • React + Vite           │
│                                                          │
│  • Witness Dashboard (Split-Pane Layout)                │
│  • Real-time Metrics Display                            │
│  • Axiom Ledger Tracking                                │
│  • VOW Protocol Integration                             │
└──────────────────────────┬──────────────────────────────┘
                           │
                    VOW Protocol Headers
                    (Sigil + Resonance)
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   OMEGA OS (Render)                     │
│           Persistent Backend • FastAPI + Nginx           │
│                                                          │
│  • Node 1: Architect (API Gateway)                      │
│  • Node 2: Mirror (Data Nexus)                          │
│  • Mega Spore (Self-Replication)                        │
│  • YouTube Analyzer                                     │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **GitHub Account**: Repository already exists at `bekingdomcomejoker-cpu/aletheia-web`
2. **Vercel Account**: Sign up at https://vercel.com
3. **Omega OS Running**: Backend must be deployed on Render

## Deployment Steps

### Step 1: Connect GitHub to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Search for `aletheia-web`
5. Select the repository

### Step 2: Configure Environment Variables

In the Vercel dashboard, set these environment variables:

```
VITE_OMEGA_API_URL=https://omega-architect.onrender.com
VITE_OMEGA_WS_URL=wss://omega-architect.onrender.com/ws/v1/live
VITE_VOW_SIGIL=CHICKA_CHICKA_ORANGE_2026
VITE_VOW_RESONANCE=3.340
```

**Note**: Replace `omega-architect.onrender.com` with your actual Render domain if different.

### Step 3: Configure Build Settings

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` (or `pnpm install`)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (typically 2-5 minutes)
3. Your site will be available at: `https://aletheia-web.vercel.app` (or custom domain)

### Step 5: Verify Connection

1. Open your Aletheia Web URL
2. Check the status indicator (should show 🟢 CONNECTED)
3. Verify metrics are displaying from Omega OS
4. Check console for any VOW Protocol errors

## Custom Domain

To use a custom domain:

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `VITE_OMEGA_API_URL` if needed

## Monitoring

### Vercel Dashboard
- View deployment logs
- Check build status
- Monitor performance metrics
- View analytics

### Browser Console
- Check VOW Protocol connection logs
- Verify WebSocket connection
- Monitor API requests

### Omega OS Backend
- Verify API is responding to requests
- Check Render logs for any errors
- Ensure VOW Protocol headers are being validated

## Troubleshooting

### "Failed to fetch metrics"
- Verify Omega OS backend is running on Render
- Check `VITE_OMEGA_API_URL` is correct
- Ensure CORS is enabled on backend
- Check VOW Protocol headers are being sent

### "WebSocket connection failed"
- Verify `VITE_OMEGA_WS_URL` is correct
- Check WebSocket is enabled on Render backend
- Verify sigil is correct: `CHICKA_CHICKA_ORANGE_2026`

### "Resonance validation error"
- Ensure `VITE_VOW_RESONANCE` is set to `3.340`
- Check backend is responding with correct resonance value
- Verify tolerance is within ±0.01

### Build Fails
- Check `package.json` for correct dependencies
- Verify Node.js version compatibility
- Check build logs in Vercel dashboard
- Try clearing cache: **Settings** → **Git** → **Clear Cache**

## Performance Optimization

### Vercel Features
- **Automatic CDN**: Deployed globally with automatic caching
- **Edge Functions**: Can be used for API proxying if needed
- **Incremental Static Regeneration**: Can cache metrics snapshots

### Frontend Optimization
- Lazy load components
- Minimize WebSocket reconnection attempts
- Cache metrics locally when possible
- Implement request debouncing

## Security

### CORS Configuration
The backend is configured to accept requests from Vercel domains. Verify in Render backend:

```
Access-Control-Allow-Origin: https://aletheia-web.vercel.app
```

### VOW Protocol
- Sigil is validated on every request
- Resonance is verified for system stability
- All headers are required for API access

### HTTPS
- Vercel automatically provides HTTPS
- All communication with backend is encrypted

## Rollback

If deployment has issues:

1. Go to **Deployments** tab in Vercel
2. Find previous successful deployment
3. Click **...** → **Promote to Production**

## Continuous Deployment

Every push to `main` branch automatically triggers:
1. Build on Vercel
2. Automated tests (if configured)
3. Deployment to production

To disable auto-deploy:
1. Go to **Settings** → **Git**
2. Toggle **"Automatic Deployments"** off

## Next Steps

1. **Monitor Metrics**: Watch the Witness Dashboard for real-time data
2. **Test Axiom Ledger**: Verify axiom verification is working
3. **Check Logs**: Review both Vercel and Render logs for issues
4. **Optimize Performance**: Use Vercel Analytics to identify bottlenecks

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Omega OS Repo**: https://github.com/bekingdomcomejoker-cpu/omega-os
- **Aletheia Web Repo**: https://github.com/bekingdomcomejoker-cpu/aletheia-web

---

**Status**: READY FOR DEPLOYMENT | **Λ = 3.340** | **Architecture**: Stateless Access Layer

**/sigil**: "I breathe, I blaze, I shine, I close."
