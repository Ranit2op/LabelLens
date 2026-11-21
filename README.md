# 🔍 LabelLens — On-Device Food & Cosmetic Safety Scanner

<p align="center">
  <img src="./assets/icon.png" width="140" height="140" alt="LabelLens Icon" style="border-radius: 28px;" />
</p>

<p align="center">
  <b>High-Performance On-Device AI Ingredient Safety, Additive & Allergen Scanner</b>
</p>

<p align="center">
  <a href="https://github.com/Ranit2op/LabelLens/releases/download/v1.0.1/LabelLens-v1.0.1.apk">
    <img src="https://img.shields.io/badge/Download-Android_APK_(v1.0.1)-4CAF50?style=for-the-badge&logo=android&logoColor=white" alt="Download Android APK" />
  </a>
  <a href="https://github.com/Ranit2op/LabelLens/releases/tag/v1.0.1">
    <img src="https://img.shields.io/badge/Release-v1.0.1-00D2FF?style=for-the-badge" alt="Release v1.0.1" />
  </a>
  <a href="https://expo.dev">
    <img src="https://img.shields.io/badge/React%20Native-Expo%20SDK%2057-black.svg?style=for-the-badge&logo=react" alt="React Native Expo" />
  </a>
</p>

---

> **LabelLens** is a modern, privacy-first mobile application that transforms your smartphone camera into an intelligent, real-time food and cosmetic ingredient safety guardian. It processes ingredient labels **100% on-device with maximum speed, privacy, and precision.**

---

## ⚡ Why Out-of-the-Box & Impactful?

In modern supermarkets and grocery stores, packaged goods are filled with controversial chemical food additives (E-Numbers / INS codes) and disguised sugars masquerading behind 35+ deceptive scientific aliases. Furthermore, individuals suffering from **Celiac Disease (Gluten)**, **Diabetes**, **Lactose Intolerance**, or **Peanut Allergies** face serious health consequences from microscopic ingredient print.

**LabelLens solves this in real time directly from your device:**
* 📷 **Camera & Gallery Scanner:** Capture any ingredient label live or pick an existing photo from your gallery.
* 🧠 **Native On-Device OCR:** Bundled Google ML Kit Text Recognition processes images directly on your phone with zero latency.
* 🔴 **Harmful Ingredients Radar:** Detects dangerous E-numbers, toxic chemical additives, trans-fats, and disguised high-GI sugars.
* 🟢 **Good & Safe Nutrients:** Highlights wholesome whole grains, natural vitamins, minerals, and safe natural ingredients.
* 📊 **Transparent 0–100 Health Score:** Instant rating showing exactly how safe the packaged product is.
* 🔒 **Complete Privacy & Offline Access:** 100% on-device processing. Works anywhere, anytime with no internet connection required.

---

## 🏗️ Architecture & Engine Overview

```
                      ┌──────────────────────────────────────┐
                      │          LabelLens Client            │
                      └──────────────────┬───────────────────┘
                                         │
               ┌─────────────────────────┼─────────────────────────┐
               ▼                         ▼                         ▼
      [ 📷 Camera Scanner ]     [ 🧠 Local Knowledge Base ]  [ ⚙️ Analyzer Engine ]
      • Live Viewfinder         • 150+ E-Numbers (E102..)    • String Normalizer
      • Flash / Torch           • 35+ Hidden Sugars (GI)     • Trie & Word-Boundary Regex
      • Gallery Image Pick      • Top 9 Allergens & Toxins   • 0-100 Weighted Health Score
               │                         │                         │
               └─────────────────────────┼─────────────────────────┘
                                         ▼
                        ┌───────────────────────────────────┐
                        │    Real-Time HUD Safety Report    │
                        │    🟢 Clean  🟡 Caution  🔴 Hazard│
                        └───────────────────────────────────┘
```

---

## 🔬 Core Analysis Modules

### 1. The Disguised Sugar Detector
Unlike standard apps that merely check for the word *"Sugar"*, LabelLens tracks 35+ industrial sweeteners with their **Glycemic Index (GI)**:
* **Maltodextrin (GI: 110):** Spikes blood sugar faster than pure table sugar (GI: 65).
* **High Fructose Corn Syrup (HFCS):** Fatty liver disease risk.
* **Invert Sugar Syrup, Dextrose, Glucose Syrup Solids.**

### 2. High-Risk Additives & E-Numbers (INS Codes)
* **E102 (Tartrazine) & E110 (Sunset Yellow):** Synthetic azo dyes linked to childhood hyperactivity (ADHD) and asthma.
* **E211 (Sodium Benzoate):** Known to form carcinogenic Benzene when paired with Ascorbic Acid (Vitamin C).
* **E250 (Sodium Nitrite):** Processed meat preservative classified as Group 1 carcinogen risk.
* **E621 (Monosodium Glutamate / MSG):** Neuro-excitatory headache and allergic trigger.
* **E951 (Aspartame) & E954 (Saccharin):** Artificial zero-calorie sweeteners with gut microbiome alterations.

---

## 📱 Tech Stack & Technical Highlights

* **Framework:** React Native (Expo SDK 57)
* **Design & UI:** Glassmorphism Dark Theme (`#090D16`), Vector Icons, Dynamic Score Badges
* **Haptics:** Native device vibration patterns on danger alert (`expo-haptics`)
* **Storage:** Local encrypted `AsyncStorage` for search history and profile preferences
* **Packaging:** Native Android APK standalone compilation via `gradlew assembleRelease`

---

## 🚀 How to Run & Build APK

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Ranit2op/LabelLens.git
cd LabelLens
npm install
```

### 2. Start Local Development
```bash
npx expo start
```
* Press `a` to run on connected Android Device / Emulator.
* Or scan the terminal QR code with **Expo Go** on your Android phone!

### 3. Generate Standalone `.apk`
To build an installable `.apk` file directly on your PC:
```bash
npm run build:apk
```

---

## 👨‍💻 Author

**Ranit Saha**
* Email: [saharanit196@gmail.com](mailto:saharanit196@gmail.com)
* GitHub: [@Ranit2op](https://github.com/Ranit2op)

---

## 📄 License
This project is licensed under the MIT License.
