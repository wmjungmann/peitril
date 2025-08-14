# Peitril

*A crowd-sourced fuel-price tracker that helps drivers find the cheapest petrol/diesel nearby.*

**Elevator pitch:** Peitril lets motorists snap a photo of a station’s price board, automatically extracts the prices using OCR, and shares them with everyone. The result is a live, community-powered map of fuel prices so you can pick the best stop before you drive.

---

## 📌 Highlights

- 📷 **Photo-based Price Capture** – Users upload images of fuel price boards.
- 🔍 **OCR with Tesseract** – Automatically extracts price data from the image.
- 🗺 **Map Integration** – Displays nearby stations and their current prices.
- 🚗 **Location Awareness** – Uses your GPS to find stations close to you.
- 👥 **Crowd-sourced Data** – Every user’s contribution helps keep prices up to date.

---


## 💡 Motivation

Fuel prices in Ireland change often and can be hard to track. Peitril uses crowdsourcing and automatic text extraction from price-board images to keep data fresh without manual entry.

---

## ⚙️ How it works

**Discover** — View nearby stations sorted by price or distance.

**Contribute** — Snap a photo of a price board and upload it.

**Extract** — Backend processes the image with Tesseract OCR to read prices.

**Display** — Updated prices appear instantly for all users.

---

## 🛠 Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Flask (Python)
- **OCR:** Tesseract
- **Database:** PostgreSQL
- **APIs:** Google Maps API

---

## 🏗 Architecture

```text
📱 Mobile App (React Native / Expo)
   ├─ 🗺 Map UI + Geolocation
   ├─ 📷 Camera/Media capture
   └─ 📋 Price list & station details

🖥 Backend API (Flask)
   ├─ 🔌 Endpoints for stations & prices
   ├─ 🔍 OCR with Tesseract
   └─ 💾 Database storage (stations, prices, images)
```

---

## 📸 Screenshots

| Home Screen                          | Map View                         | Price Upload                            |
| ------------------------------------ | -------------------------------- | --------------------------------------- |
| ![Home Screen](https://github.com/user-attachments/assets/83ed7cbf-ad64-4388-9d5f-e6c4465985ca) | ![Map View](https://github.com/user-attachments/assets/f83a25c8-9d91-4f05-babd-2fd4061b62c8) | ![Price Upload](https://github.com/user-attachments/assets/e3378d64-f244-4d32-bf4b-fba5527995b0) |

---

## 🛤 Roadmap

- **Price alerts for favourite stations**

- **iOS build & testing**

- **Route planning for cheapest fuel stops**

- **Offline cache for last-known prices**





