# PMAY-G & Gram Panchayat Demo Inspection Photos

This folder contains authentic, high-resolution rural construction and civic infrastructure photographs curated specifically for testing and demonstrating the **PMAY-G Field Verification & BDO Governance Software**.

---

## 📁 Directory Structure & Stage Mappings

| Folder | Stage / Category | Recommended File | What the AI Vision Engine Detects |
|---|---|---|---|
| `1_Foundation_Stage/` | **Foundation** | `01_Trench_Excavation_and_Footing.jpg`<br>`02_Reinforced_Ground_Footing.jpg` | Soil excavation, footing depth, rebar layout, trenches |
| `2_Plinth_Stage/` | **Plinth** | `01_Plinth_Level_Retaining_Masonry.jpg`<br>`02_DPC_Plinth_Beam_Concrete.jpg` | DPC concrete beam, ground retaining masonry, sub-grade fill |
| `3_Lintel_Stage/` | **Lintel** | `01_Rural_Brick_Walls_Up_To_Lintel.jpg`<br>`02_Superstructure_Brick_Masonry.jpg` | Terracotta brickwork up to 7ft, door/window RCC lintel bands |
| `4_Completion_Stage/` | **Completion** | `01_Completed_PMAY_Pucca_House.jpg`<br>`02_Finished_Rural_Home_Plastered.jpg` | Cured RCC roof slab, plastered/painted walls, doors, windows |
| `5_Civic_Panchayat_Works/` | **Panchayat Works** | `02_Rural_Connectivity_Road.jpg`<br>`04_Community_Water_Facility.jpg` | CC paver roads, piped drinking water towers & solar pump setups |

---

## 🚀 How to Upload & Test in the Software

### Method 1: Using "Select Photo From Gallery" (Manual File Dialog)
1. Open the app (`npm run dev` or run `launchapp.command`).
2. Log in as an Inspector (`FO-8821` / `1234`).
3. Click on any beneficiary card (e.g. `Birsa Soren` - Foundation, or `Sunita Devi` - Plinth).
4. Click **"Verify Stage"** to open the Geotag Camera.
5. In the camera viewfinder modal:
   - Click **"Select Photo From Gallery"** (or the upload icon).
   - In your computer's file browser, navigate to:
     `Desktop -> techtrix -> Demo_Pictures`
   - Pick the corresponding photo (e.g. `1_Foundation_Stage/01_Trench_Excavation_and_Footing.jpg`).
6. The software instantly:
   - Optimizes and compresses the photo.
   - Burns a live cryptographic ECDSA watermark (latitude, longitude, 3D altitude, ULPIN, timestamp, officer ID).
   - Runs the **Edge AI Stage Classifier** to detect construction features.
7. Click **"Confirm & Use Geotag"** -> Submit the inspection!

---

### Method 2: Instant 1-Click Stage Simulation
1. In the Camera Modal, click **"Auto-Capture Realistic Stage Photo"**.
2. The application automatically loads the corresponding authentic photograph, processes it through the pipeline, and generates the cryptographic geotag preview instantly.

---

### 🧪 Test Scenarios for Demonstrations & Viva

#### Scenario A: Perfect Stage Verification (Pass)
- Target: Beneficiary at **Foundation** stage.
- Action: Upload `1_Foundation_Stage/01_Trench_Excavation_and_Footing.jpg`.
- Result: AI classifies stage as **Foundation (96% Confidence)**, green badge confirms alignment with target milestone.

#### Scenario B: Fraud / Stage Discrepancy Detection (Flagged!)
- Target: Beneficiary claiming **Lintel** or **Completion** stage.
- Action: Upload `1_Foundation_Stage/01_Trench_Excavation_and_Footing.jpg`.
- Result: **Amber Discrepancy Warning**:
  > *"Visual features suggest Foundation / Excavation, but target claimed stage is Lintel / Completion. BDO review required."*
- When submitted, the BDO Dashboard alerts the Block Development Officer with the discrepancy flag before any DBT installment can be released!

---

## 📷 Source Attributions
All demo photographs are sourced from public domain and Creative Commons licensed documentation of rural housing and civic works (Wikimedia Commons / Government of India open data initiatives).
