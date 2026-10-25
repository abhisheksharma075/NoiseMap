# NoiseMap AI Copilot — Agent 37 Deployment & Operations Guide

## 1. Overview & Architecture

NoiseMap AI Copilot (Stage 2) is designed to run in an isolated, persistent cloud container on **Agent 37** (`agent37.com`) or any OCI-compliant container runtime.

### Preferred Topology
```
[NoiseMap Web / PWA Client] (Vercel or Static CDN)
       │
       │ HTTPS /api/chat
       ▼
[Agent 37 Cloud Sandbox / Custom Container]
       ├── server/server.js (Node.js runtime on port 3001)
       ├── server/noiseMapTools.js (Read-only environmental tool dispatcher)
       └── server/aiService.js (Gemini function-calling engine)
              │
              ▼
       [Google Gemini 2.5 Flash API]
```

Alternatively, the container can serve both the compiled Vite frontend (`/app/dist`) and the API from a single unified container instance.

---

## 2. Resource Sizing & Cost Control (Free-Credit Budget)

To maximize available credits and guarantee **zero unexpected financial commitments**:

1. **Instance Tier:** Select the smallest supported compute profile:
   - **vCPU:** `0.5 vCPU`
   - **Memory:** `512 MB RAM`
   - **Disk:** `5 GB SSD` (ephemeral/standard)
2. **Auto-Sleep / Scale-to-Zero:** Enable automatic standby when idle for $\ge 15$ minutes.
3. **Model Billing Separation:** Keep Gemini API usage on your existing Google AI Studio key (`GEMINI_API_KEY`). Agent 37 credits are consumed solely for compute runtime.
4. **No Paid Add-ons:** Do not attach external paid databases, persistent GPU allocations, or custom domain routing tiers.

---

## 3. Deployment Steps via Agent 37 Dashboard / CLI

### Step 1: Prepare the Image / Git Repository
Link your GitHub repository (`abhisheksharma075/NoiseMap`) to Agent 37 or push the container image:
```bash
docker build -t noisemap-ai-copilot:stage2 .
```

### Step 2: Configure Environment Variables
In the Agent 37 workload configuration settings, configure:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production optimizations |
| `PORT` | `3001` (or platform default) | Container listening port |
| `GEMINI_API_KEY` | `your_actual_key` | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Gemini model identifier (Interactions API) |
| `ALLOWED_ORIGIN` | `https://noisemap.vercel.app` | CORS restriction to your frontend domain |

### Step 3: Configure Healthcheck & Networking
- **Exposed Port:** `3001`
- **Healthcheck Path:** `GET /api/health`
- **Healthcheck Interval:** 30 seconds

### Step 4: Connect the Frontend
In your frontend hosting provider (e.g. Vercel) or client `.env`:
```env
VITE_API_URL=https://<your-agent37-subdomain>.agent37.app
```
When `VITE_API_URL` is set, `AiCopilotService` automatically routes chat queries to your Agent 37 container.

---

## 4. Verification & Testing

### Health Check:
```bash
curl -i https://<your-agent37-subdomain>.agent37.app/api/health
```
Expected output:
```json
{
  "status": "healthy",
  "service": "NoiseMap AI Copilot Backend (Stage 2)",
  "version": "1.2.0",
  "environment": "production",
  "model": "gemini-3.8-flash",
  "hasApiKey": true
}
```

### Tool-Calling Query:
```bash
curl -X POST https://<your-agent37-subdomain>.agent37.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the latest noise readings?"}'
```

---

## 5. Teardown & Stopping Workloads

To avoid exhausting credits when testing is complete:
1. Open the Agent 37 Console: `https://agent37.com/dashboard`.
2. Locate the `noisemap-ai-copilot` container.
3. Click **Stop** or **Pause Workload**.
4. To permanently delete the workload: Select **Settings** $\to$ **Delete Instance**.
