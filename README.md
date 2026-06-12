# PropTrack — Property Management MVP

A focused property management tool built for Kenyan real estate agents.
Solves: tenant tracking, M-Pesa payment verification, automated SMS reminders, and vacant unit listings.

---

## Tech Stack
- **Frontend:** React 18 + Vite
- **Styling:** CSS Variables (no framework — full custom)
- **SMS:** Africa's Talking API (Kenya-native, ~Ksh 1/SMS)
- **Payments:** Safaricom Daraja API (M-Pesa verification)
- **Backend (build next):** Node.js + Express + PostgreSQL

---

## Quick Start

```bash
# 1. Open this folder in VS Code

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser at http://localhost:5173
```

---

## Project Structure

```
PropTrack/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Root component + routing
    ├── App.css               # Global design system (CSS variables)
    ├── components/
    │   ├── Sidebar.jsx       # Navigation sidebar
    │   └── Sidebar.css
    ├── data/
    │   └── mockData.js       # Mock data (replace with API calls)
    └── pages/
        ├── Dashboard.jsx     # Overview stats + alerts
        ├── Dashboard.css
        ├── Tenants.jsx       # Tenant management + search
        ├── Payments.jsx      # M-Pesa verification + payment history
        ├── Listings.jsx      # Vacant unit listings + share links
        └── Reminders.jsx     # Automated SMS reminders
```

---

## Features Built (MVP)

| Feature | Status | Notes |
|---|---|---|
| Tenant Dashboard | ✅ | Search by name, unit, phone |
| Add/View Tenants | ✅ | Full profile with payment status |
| Payment Recording | ✅ | Log M-Pesa payments |
| M-Pesa Verification | ✅ | Simulated — connect Daraja API |
| Fraud Detection | ✅ | Flags fake M-Pesa codes |
| Vacancy Listings | ✅ | Post units + shareable links |
| SMS Reminders | ✅ | Simulated — connect Africa's Talking |
| Bulk SMS | ✅ | Send to all arrears/pending tenants |
| Arrears Alerts | ✅ | Dashboard + reminders page |

---

## API Integrations (Next Steps)

### 1. M-Pesa Verification (Safaricom Daraja)
- Register at: https://developer.safaricom.co.ke
- Use the **C2B API** to validate transaction codes
- Replace `simulateMpesaVerification()` in `Payments.jsx` with your backend endpoint

### 2. SMS Reminders (Africa's Talking)
- Register at: https://africastalking.com
- Install SDK: `npm install africastalking`
- Replace `simulateSendSMS()` in `Reminders.jsx` with your backend `/api/send-sms` endpoint
- Cost: ~Ksh 1 per SMS in Kenya

### 3. Backend (Build After Validating Frontend)
```
Node.js + Express
PostgreSQL (tenants, units, payments, agents tables)
M-Pesa STK Push for subscription billing
Railway or Render for hosting (free tier available)
```

---

## Pricing Model
| Plan | Units | Price |
|---|---|---|
| Starter | Up to 10 units | Ksh 1,500/month |
| Growth | Up to 50 units | Ksh 3,500/month |
| Pro | Unlimited | Ksh 6,000/month |

---

## Roadmap
- [ ] Backend API (Node.js + PostgreSQL)
- [ ] Real Daraja API integration
- [ ] Real Africa's Talking SMS
- [ ] M-Pesa STK Push subscription billing
- [ ] Tenant-facing portal
- [ ] Lease agreement generation
- [ ] Maintenance request tracking
- [ ] Mobile-responsive improvements

---

Built for Kenyan property agents. 🇰🇪
