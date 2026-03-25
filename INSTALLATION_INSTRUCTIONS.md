# Installation Instructions - OAuth & Stripe

This document contains instructions for installing dependencies and setting up OAuth and Stripe.

## 1. Install Dependencies

### Backend (OAuth + Stripe)
```bash
cd apps/api
npm install googleapis stripe
npm install --save-dev @types/stripe
```

### Frontend (OAuth + Stripe)
```bash
cd apps/web
npm install @react-oauth/google react-apple-signin-auth
npm install @stripe/react-stripe-js @stripe/stripe-js
```

---

## 2. Setup Google OAuth

### Step 1: Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Create new project: **"TIER Golf Production"**
3. Enable **Google+ API**
4. Go to **APIs & Services → Credentials**
5. Create **OAuth 2.0 Client ID**:
   - Type: **Web application**
   - Name: "TIER Golf Web App"
   - Authorized JavaScript origins:
     ```
     http://localhost:3001
     http://localhost:3000
     https://tier-golf.no
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/v1/auth/google/callback
     https://api.tier-golf.no/api/v1/auth/google/callback
     ```
6. Copy **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

**Backend** (`apps/api/.env`):
```bash
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
```

**Frontend** (`apps/web/.env`):
```bash
REACT_APP_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_ENABLE_OAUTH=true
```

---

## 3. Setup Apple Sign-In

### Step 1: Apple Developer Account
- **Requirement**: Apple Developer Program ($99/year)
- Go to https://developer.apple.com/account

### Step 2: Create App ID
1. **Certificates, IDs & Profiles → Identifiers**
2. Click **+** → **App IDs** → App
3. Description: **TIER Golf**
4. Bundle ID: `com.tiergolf.app`
5. Enable **"Sign In with Apple"**

### Step 3: Create Service ID
1. **Identifiers → +** → **Services IDs**
2. Identifier: `com.tiergolf.service`
3. Enable **"Sign In with Apple"** → **Configure**:
   - Domains: `localhost`, `tier-golf.no`
   - Return URLs:
     ```
     http://localhost:3000/api/v1/auth/apple/callback
     https://api.tier-golf.no/api/v1/auth/apple/callback
     ```

### Step 4: Create Private Key
1. **Keys → +** → Enable "Sign In with Apple"
2. **Download the .p8 file** (only available once!)
3. Note the **Key ID** and **Team ID**
4. Save the file:
   ```bash
   mkdir -p apps/api/config
   mv ~/Downloads/AuthKey_KEY123ABC.p8 apps/api/config/apple-key.p8
   ```

### Step 5: Update Environment Variables

**Backend** (`apps/api/.env`):
```bash
APPLE_CLIENT_ID=com.tiergolf.service
APPLE_TEAM_ID=ABC123XYZ
APPLE_KEY_ID=KEY123ABC
APPLE_PRIVATE_KEY_PATH=./config/apple-key.p8
APPLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/apple/callback
```

**Frontend** (`apps/web/.env`):
```bash
REACT_APP_APPLE_CLIENT_ID=com.tiergolf.service
```

---

## 4. Setup Stripe

### Step 1: Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Register business: **TIER Golf AS**
3. Enable **Test Mode** first

### Step 2: Get API Keys
1. Go to **Developers → API keys**
2. Copy:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Step 3: Enable Payment Methods
1. Go to **Settings → Payment methods**
2. Enable:
   - ✅ **Card** (Visa, Mastercard, Amex)
   - ✅ **Apple Pay**
   - ✅ **Google Pay**

### Step 4: Update Environment Variables

**Backend** (`apps/api/.env`):
```bash
STRIPE_SECRET_KEY=sk_test_abc123...
STRIPE_PUBLISHABLE_KEY=pk_test_abc123...
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

**Frontend** (`apps/web/.env`):
```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_abc123...
REACT_APP_ENABLE_STRIPE=true
```

---

## 5. Test Setup

### Test OAuth
```bash
# Start backend
cd apps/api
npm run dev

# Start frontend (new terminal)
cd apps/web
npm start

# Navigate to http://localhost:3001/login
# Click "Continue with Google" or "Continue with Apple"
```

### Test Stripe
```bash
# Backend
cd apps/api
npm run dev

# Frontend
cd apps/web
npm start

# Navigate to http://localhost:3001/pricing (when created)
# Use Stripe test card: 4242 4242 4242 4242
```

---

## Next Steps

1. ✅ Install dependencies (see section 1)
2. ✅ Setup OAuth credentials (see section 2 & 3)
3. ✅ Setup Stripe account (see section 4)
4. 🔨 Test OAuth flow
5. 🔨 Test Stripe checkout

---

## Troubleshooting

### OAuth not visible on login page
- Check that `REACT_APP_GOOGLE_CLIENT_ID` or `REACT_APP_APPLE_CLIENT_ID` is set
- OAuthButtons hide automatically if no client IDs are configured

### Stripe checkout fails
- Use test card: `4242 4242 4242 4242`
- Check that `STRIPE_SECRET_KEY` starts with `sk_test_`

### Apple Sign-In not working locally
- Apple Sign-In requires HTTPS in production
- For local testing: Use ngrok or similar

---

**Created:** 2026-01-07
**Status:** Ready for installation
