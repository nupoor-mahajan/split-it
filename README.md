# 💸 SplitIt | High-Efficiency Expense Splitter

**Live Link:** [split-it-sigma.vercel.app](https://split-it-sigma.vercel.app/)

SplitIt is a premium, no-login bill-splitting application designed for speed and fairness. Built with a **Mobile-First** philosophy, it handles everything from simple dinner splits to complex itemized receipts with transaction minimization logic.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## 🚀 Features

* **Instant Entry:** No login, no onboarding. Start splitting in seconds.
* **Smart Settlement:** Uses a transaction minimization algorithm to reduce the number of payments (e.g., A pays C instead of A paying B then B paying C).
* **Itemized (Unequal) Split:** Toggle "Itemize Bill" to assign specific consumed amounts to each member with a real-time "Unassigned" balance tracker.
* **Live Cloud Sync:** Generate a unique link to share your trip via WhatsApp. Friends can view the live summary on their own devices.
* **Save as Image:** Export a beautiful high-contrast PNG of the "Who Owes Whom" summary.
* **Premium UI:** Squircle-based design with Glassmorphism effects, Dark/Light mode, and Indian Rupee (₹) support.

---

## 🛠️ Tech Stack

* **Frontend:** React + TypeScript + Vite
* **Styling:** Tailwind CSS v4 (PostCSS configuration)
* **State Management:** Zustand (with Persistence middleware)
* **Backend-as-a-Service:** Supabase (Postgres + Row Level Security)
* **Utilities:** `lucide-react` for iconography, `html-to-image` for exports.

---

## 📂 Project Structure

```plaintext
src/
├── components/     # Reusable UI components (Buttons, Modals, GlassCard)
├── hooks/          # Custom React hooks for logic reuse
├── store/          # Zustand store for global state management
├── utils/          # Settlement algorithm & image export logic
├── lib/            # Supabase client configuration
└── types/          # TypeScript interfaces and types
```

## 📦 Installation & Setup

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/nupoor-mahajan/split-it.git](https://github.com/nupoor-mahajan/split-it.git)
   cd split-it
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Variables**
   Create a .env file in the root and add your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. **Run Dev Server:**
   ```bash
   npm run dev
   ```
---
## 🔄 User Flow
1. **Add Members:** Enter the names of everyone involved in the trip/dinner.
2. **Log Expenses:** Enter the names of everyone involved in the trip/dinner. 
3. **Review Summary:** View the "Who Owes Whom" section to see the optimized debt list.
4. **Sync & Share:** Click "Sync" to get a shareable URL or "Export" to save the summary as an image.

---

## 🗺️ Roadmap
* [ ] OCR Integration: Scan receipts to auto-fill itemized lists.
* [ ] Multi-Currency Support: Instant conversion for international trips.
* [ ] History: Local storage history for recently viewed splits.
* [ ] PDF Export: For professional expense reporting.

##
Developed by Nupoor Mahajan
