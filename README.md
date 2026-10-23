# GraminVikas 360 v2.0 🇮🇳
### Next-Generation PMAY-G Rural Housing & Gram Panchayat Infrastructure Governance Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-emerald)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

GraminVikas 360 v2.0 is an enterprise-grade, offline-first GovTech platform engineered for the **Ministry of Rural Development (MoRD)** to eliminate ghost beneficiaries, enforce sequential milestone verification, prevent Direct Benefit Transfer (DBT) leakage, and bring real-time civic transparency to Gram Panchayat public works.

---

## 🌟 Key Features & Architecture

### 1. 📱 Offline-First Field Inspector PWA (`/field`)
- **IndexedDB Multi-Tier Storage**: Full inspection functionality with zero cellular connectivity. Automatically queues and synchronizes inspection payloads when network reconnects.
- **Tamper-Proof Geotag Camera**:
  - Live GPS spatial filtering (CEP-50 & HDOP stabilization)
  - 3D altitude capture (MSL elevation)
  - Monotonic satellite clock drift validation (prevents device time manipulation)
  - Optical liveness detection with 3D device tilt analysis (defeats 2D screen replays)
  - ECDSA cryptographic watermark permanently burned into every photo
- **Photo Upload Choice**: Clean option screen allowing inspectors to upload from device files / `Demo_Pictures`, open the live viewfinder, or snap with native camera without forced hardware capture.
- **Edge AI Vision Stage Classifier**: On-device pixel analysis (detecting soil excavation, brick masonry, concrete tie-beams, and finished plaster) with automatic stage mismatch warning flags.

### 2. 🏛️ BDO & Admin Governance Dashboard (`/admin`)
- **Digital Signature Certificate (DSC) Token Authentication**: Complies with MoRD / NIC security standards for financial approval officers.
- **3-Tier Maker-Checker Approval Workflow**: Junior Engineer (JE) technical clearance, Field Inspector geotag audit, and BDO final sign-off.
- **Bi-Temporal Stage Comparison**: Side-by-side photographic milestone diffing with spatial alignment to prevent stage jumping.
- **Automated PFMS XML Direct Benefit Transfer**: Automatic generation of compliant PFMS FTO (Fund Transfer Order) batch files upon stage approval.
- **Deduplication Engine**: SECC-2011 & NFSA ration card deduplication and exclusion checking.

### 3. 👥 Citizen Public Transparency Portal (`/citizen`)
- **Open Public Dashboard**: Zero-login, read-only tracking designed for rural citizens and social audit committees.
- **PMAY-G Sanction Tracking**: Enter PMAY ID or mobile number to track construction milestones, geo-tagged photos, and DBT installment disbursement status.
- **Gram Panchayat Works Showcase**: Public display of XV Finance Commission & MGNREGS infrastructure projects (roads, drinking water schemes, community halls).
- **Direct Grievance Redressal**: Citizens can submit field discrepancy complaints directly to the district administration.

### 4. 🛰️ ISRO Bhuvan Macro-Verification & Monsoon Risk Engine
- Macro-level satellite building footprint cross-checking.
- Seasonal monsoon risk analysis with predictive timeline alerts for foundation and roof slab casting.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- Modern web browser (Chrome, Safari, Edge, or Firefox)

---

### Option A: 1-Click Launch on macOS (Recommended)
Simply double-click the **`Launch.command`** file in this folder:
```bash
./Launch.command
```
`Launch.command` automatically:
1. Validates your environment and installs dependencies if needed.
2. Builds the backend microservice.
3. Auto-detects your local Wi-Fi IP address for mobile testing.
4. Starts both backend (port 5001) and frontend (port 3000).
5. Opens your default web browser directly to `http://localhost:3000`.

---

### Option B: Manual Terminal Execution
```bash
# 1. Install all dependencies (handled via npm workspaces)
npm install

# 2. Build backend server
npm run build:backend

# 3. Start development servers
npm run dev
```

- **Frontend Application**: `http://localhost:3000`
- **Backend Microservice**: `http://localhost:5001`

---

## 📱 How to Run on a Mobile Device

1. Connect your mobile phone and computer to the **same Wi-Fi network**.
2. Note your computer's local IP address (printed automatically in `Launch.command`, or run `ipconfig getifaddr en0`).
3. Open the browser on your mobile phone and navigate to:
   ```text
   http://<YOUR-COMPUTER-IP>:3000
   ```
4. For the full mobile field verification experience, open:
   ```text
   http://<YOUR-COMPUTER-IP>:3000/field
   ```

---

## 🔑 Default Demonstration Credentials

| Role | Login Portal | Identifier / Username | Password / PIN | Description |
|---|---|---|---|---|
| **Field Inspector** | `/login/inspector` | `FO-8821` | `1234` | Full offline inspection & geotag capture permissions |
| **BDO Admin** | `/login/admin` | N/A (DSC Token) | `2024` | Maker-checker approval, PFMS DBT release & fraud control |
| **Citizen User** | `/citizen` | Direct Access | No login needed | Read-only public transparency & scheme tracking |

---

## 📷 Demo Pictures for Inspection Testing

High-resolution, authentic rural construction photographs are included in the **`Demo_Pictures/`** directory:

| Folder | Milestone Stage | Recommended Test File |
|---|---|---|
| `1_Foundation_Stage/` | **Foundation** | `01_Trench_Excavation_and_Footing.jpg` |
| `2_Plinth_Stage/` | **Plinth** | `01_Plinth_Level_Retaining_Masonry.jpg` |
| `3_Lintel_Stage/` | **Lintel** | `01_Rural_Brick_Walls_Up_To_Lintel.jpg` |
| `4_Completion_Stage/` | **Completion** | `01_Completed_PMAY_Pucca_House.jpg` |
| `5_Civic_Panchayat_Works/` | **Panchayat Works** | `02_Rural_Connectivity_Road.jpg`<br>`04_Community_Water_Facility.jpg` |

### How to Test AI Stage Mismatch:
1. Open an inspection for a **Lintel** or **Completion** beneficiary.
2. Select `1_Foundation_Stage/01_Trench_Excavation_and_Footing.jpg`.
3. The on-device AI will flag an **Amber Discrepancy Warning**:
   > *"Visual features strongly match FOUNDATION stage, but this claim is for LINTEL stage. Manual review required."*
4. Submitting this flags the record in the BDO Admin Dashboard before any funds can be released.

---

## 📁 Repository Directory Structure

```text
2.0/
├── frontend/                     # Next.js 14 Progressive Web Application
│   ├── public/                   # Static assets, PWA icons, demo images
│   │   ├── demo-pictures/        # Served web copies of demo photos
│   │   ├── manifest.json         # PWA Web App Manifest
│   │   └── logos/                # Official MoRD / PMAY-G branding
│   └── src/
│       ├── app/                  # Next.js App Router pages
│       │   ├── admin/            # BDO approvals, fraud control, bi-temporal diff
│       │   ├── citizen/          # Public transparency portal
│       │   ├── field/            # Field inspector tasks & inspection workflow
│       │   └── login/            # Dedicated inspector & admin login portals
│       ├── components/           # Reusable UI components & modals
│       ├── lib/
│       │   ├── context/          # AppContext global state & offline persistence
│       │   ├── db/               # Dexie.js IndexedDB schema & seed data
│       │   └── engines/          # Watermark, compression, crypto, AI vision engines
│       └── types/                # TypeScript interface definitions
├── backend/                      # Node.js TypeScript Microservice
│   ├── src/
│   │   ├── server.ts             # REST API server (PFMS, Deduplication, Verification)
│   │   ├── db/                   # Backend seed records
│   │   └── engines/              # Verification & financial engines
│   └── tsconfig.json
├── Demo_Pictures/                # High-resolution real-world test photographs
│   ├── 1_Foundation_Stage/
│   ├── 2_Plinth_Stage/
│   ├── 3_Lintel_Stage/
│   ├── 4_Completion_Stage/
│   ├── 5_Civic_Panchayat_Works/
│   └── README.md
├── Launch.command                # 1-click macOS launcher script
├── package.json                  # Root npm workspaces configuration
├── package-lock.json             # Locked dependency tree
├── .gitignore                    # Git exclusion rules (node_modules, .next, dist)
├── .gitattributes                # Line ending normalization & binary rules
└── README.md                     # Repository documentation
```

---

## 📜 Compliance & Security Standards
- **Data Protection**: Aligns with the **Digital Personal Data Protection Act (DPDPA) 2023** with explicit consent token logging.
- **Financial Architecture**: Compatible with **Public Financial Management System (PFMS)** XML schemas.
- **Land Records**: Integrates Unique Land Parcel Identification Number (**ULPIN** / Bhu-Aadhaar) tracking.
- **IS:456**: Adheres to Indian Standard structural code for rural concrete construction.

---

## 👥 Authors & Acknowledgments
Developed for the **TechTrix National GovTech Hackathon** • Ministry of Rural Development Challenge.
Licensed under the [MIT License](LICENSE).
