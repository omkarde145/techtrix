# GraminVikas 360 Mobile 📱🇮🇳
### Cross-Platform Mobile Application for iOS (iPhone) & Android Phones

[![Platforms](https://img.shields.io/badge/Platforms-iOS%20%7C%20Android-blue.svg)](https://reactnative.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61dafb.svg?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2051-black.svg?logo=expo)](https://expo.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](../LICENSE)

GraminVikas 360 Mobile is the official cross-platform mobile application engineered for the **Ministry of Rural Development (MoRD)** to enable offline-first geotagged inspections, public citizen milestone tracking, and BDO Maker-Checker approvals on any modern iOS or Android device.

---

## ⚡ 1-Click Quick Launch (Simulator Preview)

You can immediately test and interact with the mobile app directly on your computer inside a realistic iPhone / Android frame:

* **On macOS**: Double-click **`Launch-Mobile.command`**
* **On Windows**: Double-click **`Launch-Mobile.bat`**
* **Manual Terminal**:
  ```bash
  npm run preview
  # or: node serve-preview.js
  ```
The simulator will automatically open at `http://localhost:8080`.

---

## 🍏 How to Run on Apple iPhone & iPad (iOS)

### Option A: Instant Live Testing with Expo Go (No Mac/Xcode needed)
1. Install **Expo Go** for free from the [Apple App Store](https://apps.apple.com/app/expo-go/id982107779).
2. Connect your iPhone and computer to the **same Wi-Fi network**.
3. In your terminal, run:
   ```bash
   npx expo start
   ```
4. Open the **Camera app** on your iPhone and point it at the QR code displayed in the terminal.
5. Tap the notification banner to open **GraminVikas 360** directly on your iPhone!

### Option B: Native iOS Xcode Build
1. Make sure CocoaPods is installed: `pod install` inside the `ios/` folder.
2. Open `ios/GraminVikas360.xcworkspace` in **Apple Xcode**.
3. Select your connected iPhone or an iOS Simulator and press **⌘R (Run)**.

---

## 🤖 How to Run on Android Phones

### Option A: Instant Live Testing with Expo Go
1. Install **Expo Go** for free from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. Connect your Android phone and computer to the **same Wi-Fi network**.
3. In your terminal, run:
   ```bash
   npx expo start
   ```
4. Open the **Expo Go** app on your Android phone and tap **"Scan QR code"**.
5. Scan the terminal QR code to run the native application.

### Option B: Build a Standalone Android APK File
To generate an installable `.apk` file that can be distributed directly to field inspectors:
```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Build standalone APK
eas build -p android --profile preview
```

### Option C: Native Android Studio Build
1. Open the `android/` directory in **Android Studio**.
2. Let Gradle sync project dependencies.
3. Select your connected Android phone (via USB debugging) and press **Shift+F10 (Run)**.

---

## 🌟 Mobile Features & Security Specs

| Feature | Mobile Implementation |
| :--- | :--- |
| **GPS Geotagging** | High-accuracy spatial coordinates, MSL altitude, and CEP-50 accuracy radius. |
| **Tamper-Proof Watermark** | ECDSA cryptographic signature burned into inspection metadata with satellite clock drift check. |
| **3D Optical Liveness** | Gyroscope tilt analysis (defeats 2D smartphone screen replay attacks). |
| **Edge AI Stage Classifier** | On-device visual pattern detection with sequential milestone enforcement. |
| **Offline-First Resilience** | Local storage queue via AsyncStorage / IndexedDB; auto-syncs when 4G/Wi-Fi connects. |
| **Citizen Public Portal** | Real-time milestone tracker by Beneficiary ID with DBT installment credit status. |
| **BDO Officer Clearance** | NIC Digital Signature Certificate (DSC) hardware PIN authorization (`PIN: 2024`). |
| **Bhashini Voice Assistant** | Multi-lingual audio prompts in Hindi and English for rural field inspectors. |

---

## 📂 Project Architecture

```text
mobile/
├── App.tsx                     # Main mobile navigator & role router
├── app.json                    # Expo iOS & Android permissions manifest
├── package.json                # React Native & Expo dependencies
├── Launch-Mobile.command       # 1-Click macOS runner
├── Launch-Mobile.bat           # 1-Click Windows runner
├── serve-preview.js            # Node HTTP preview server
├── preview/
│   └── index.html              # Interactive iPhone & Android simulator
├── android/
│   └── app/src/main/
│       └── AndroidManifest.xml # Native Android camera & GPS permissions
├── ios/
│   ├── Podfile                 # Native CocoaPods config
│   └── GraminVikas360/
│       └── Info.plist          # Native iOS privacy strings
└── src/
    ├── types/                  # TypeScript data interfaces
    ├── data/                   # PMAY-G beneficiary dataset
    ├── context/                # AuthContext (Role/DSC) & SyncContext (Offline queue)
    ├── services/               # GPS, Storage, AI Vision, & API clients
    ├── components/             # Header, StageBadge, WatermarkCard
    └── screens/
        ├── FieldInspectionScreen.tsx
        ├── CitizenTrackerScreen.tsx
        ├── AdminApprovalScreen.tsx
        └── OfflineQueueScreen.tsx
```
