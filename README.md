# ADAPT-X — Intersection Management System

> **Adaptive Detection & Automated Processing of Traffic Violations at Intersections**  
> An AI-powered traffic telemetry, signal monitoring, and violation adjudication console prototype.

---

## 🚦 Features & Status

| Module | Route | Status | Description |
| :--- | :--- | :---: | :--- |
| **Operator Auth** | `/login` | ✅ Complete | Split-screen hero with intersecting roads, OTP recovery & password reset |
| **Dashboard** | `/dashboard` | ✅ Complete | Operator KPIs, system health, traffic volume chart & monitored intersections |
| **Traffic Lights** | `/traffic-lights` | ✅ Complete | 6 live intersections (Normal / Congested / Alert), live signal cycle & 2D map telemetry |
| **Violations** | `/violations` | ✅ Complete | Unverified events queue, plate OCR check, LTO owner verification & notice submission |
| **Violators** | `/violators` | ✅ Complete | Offender KPI metrics, registered offender roster, driver profile & citation history |
| **Reports** | `/reports` | ✅ Complete | Report builder (PDF/CSV), 7-day period stats, weekly bar chart & download archive |
| **Settings** | `/settings` | ✅ Complete | Security, account, notification, assignment, privacy & appearance controls |

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Routing**: React Router v7

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build production bundle
npm run build
```

## Demo Data

The app is presentation-ready with local sample records in `src/data/demoData.js`. Dashboard totals, intersections, violation events, violators, notifications, and report charts are mock data; no API or database is required. Demo actions update the client UI, while theme and density preferences persist in local storage. Authentication is only a demo gate and is not production security.

Demo sign-in: email `operator@gmail.com`, password `AdaptDemo2026!`. Password recovery uses that email and code `246810`. Settings > Data & Privacy can export local demo state or reset it to the original sample records.

## Deploy to Vercel

Import the repository into Vercel and select the folder containing `package.json` as the project root. Use the Vite preset, `npm run build` as the build command, and `dist` as the output directory. The included `vercel.json` rewrites client-side routes to the app entry point so direct links such as `/reports` work after deployment.

---

## 📁 Project Structure

```text
Adapt-x/
├── public/               # Static assets & telemetry imagery
├── src/
│   ├── components/       # Layouts & reusable UI modules (DashboardLayout)
│   ├── pages/            # View pages (Login, Dashboard, TrafficLights, Violations, etc.)
│   ├── App.jsx           # Global route configuration & authentication state
│   ├── main.jsx          # React DOM entry point
│   └── index.css         # Design system tokens & global styling
├── package.json
└── vite.config.js
```
