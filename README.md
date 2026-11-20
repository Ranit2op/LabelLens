# 🔍 LabelLens — 100% Offline On-Device Food & Cosmetic Safety Scanner

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20APK-brightgreen.svg?style=for-the-badge&logo=android)](https://github.com/saharanit196/LabelLens/releases)
[![Architecture](https://img.shields.io/badge/Architecture-Zero--Backend%20%7C%20100%25%20Offline-blue.svg?style=for-the-badge)](https://github.com/saharanit196/LabelLens)
[![Framework](https://img.shields.io/badge/React%20Native-Expo%20SDK%2057-black.svg?style=for-the-badge&logo=react)](https://expo.dev)
[![License](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](LICENSE)

> **LabelLens** is a modern, privacy-first mobile application that transforms your smartphone camera into an intelligent, real-time food and cosmetic ingredient safety guardian. It runs **100% on-device with zero backend dependencies, zero telemetry, and zero subscription costs.**

---

## ⚡ Why Out-of-the-Box & Impactful?

In modern supermarkets and grocery stores, packaged goods are filled with controversial chemical food additives (E-Numbers / INS codes) and disguised sugars masquerading behind 35+ deceptive scientific aliases. Furthermore, individuals suffering from **Celiac Disease (Gluten)**, **Diabetes**, **Lactose Intolerance**, or **Peanut Allergies** face life-threatening consequences from microscopic ingredient print.

**LabelLens solves this in real time directly from your device:**
* 📷 **Real-Time OCR & Camera Scanner:** Point camera at any food wrapper, soda can, or shampoo bottle.
* 🧠 **Offline Knowledge Base:** Instant matching across 150+ E-numbers, 35+ disguised sugars, and top 9 common allergens.
* 🛡️ **Personalized Health Profiles:** Custom toggles for **Diabetic**, **Celiac/Gluten-Free**, **Vegan**, **Nut Allergy**, and **Child-Safe Clean Eating**.
* 📊 **Transparent 0–100 Health Score:** Mathematical rating breakdown with clear penalization rules (no black-box mystery).
* 🔒 **100% Privacy & Zero Server Cost:** All string tokenization, NLP regex parsing, and scoring take place locally. Works seamlessly in remote supermarkets with zero internet or mobile data!

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
* **Packaging:** Native Android APK standalone compilation via EAS Build

---

## 🚀 How to Run & Build APK

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/saharanit196/LabelLens.git
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
To build an installable `.apk` file for your phone or CV showcase:
```bash
npx eas build -p android --profile preview
```

---

## 👨‍💻 Author

**Ranit Saha**
* Email: [saharanit196@gmail.com](mailto:saharanit196@gmail.com)
* GitHub: [@saharanit196](https://github.com/saharanit196)

---

## 📄 License
This project is licensed under the MIT License.
