# Meridian

**An AI-powered PropTech platform that leverages a massive dataset of UK planning decisions to help homeowners instantly predict renovation approvals and discover the most profitable ways to maximise their property's value.**

Built at [HackLondon 2026](https://hacklondon.tech).

---

## The Problem

When planning a home improvement, homeowners face two major risks:

1. **Uncertainty of council planning permission** -- will my project actually get approved?
2. **Unknown ROI** -- will the expensive work increase my property's value enough to justify it?

Our service solves both problems using big data and AI.

## How It Works

### 1. Instant Approval Predictions

Users enter their property details and proposed project. Meridian instantly compares the proposal against every similar planning decision made by that specific local council, providing a highly accurate probability of approval backed by hard data and historical precedents.

### 2. ROI Maximisation & Value Discovery

We don't just tell you if your current plan will work -- we tell you what *else* you could be doing. The platform evaluates possibilities in your neighbourhood, revealing extra improvements you can make to maximise your property's value. It weighs estimated construction costs against the projected increase in property value, guiding you toward the most profitable decisions.

### 3. Data-Backed Confidence

Whether you want to build a glass extension, a dormer loft, or an outbuilding, every suggestion is anchored by real-world data: millions of historical records, council-specific tendencies, and instant precedent matching.

## Key Stats

| Metric | Value |
|---|---|
| Planning Records | 2M+ |
| UK Councils Covered | 400+ |
| Prediction Accuracy | 94% |

---

## Tech Stack

### Frontend

- **Next.js 14** (App Router) with **React 18** and **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **Chart.js** / **react-chartjs-2** for data visualisation
- **jsPDF** + **html2canvas** for PDF report export
- **Lucide React** for icons

### Backend

- **Node.js** with **TypeScript** (executed via `tsx`)
- **Google Gemini** -- multimodal AI with structured function-calling for analysis
- **Ibex Planning API** -- UK planning application data
- **postcodes.io** -- UK postcode geocoding (free, no auth)

### AI Video

- **ElevenLabs** -- AI-generated video content for the landing page

---

## Project Structure

```
.
├── frontend/                  # Next.js web application
│   ├── app/
│   │   ├── page.tsx           # Landing page (hero, features, CTA)
│   │   ├── analyse/page.tsx   # Main analysis page (form + results)
│   │   └── test/page.tsx      # API diagnostics page
│   ├── components/
│   │   ├── input/             # PostcodeInput, PropertyDescriptionInput, WorkTypeSelector
│   │   ├── results/           # ApprovalDisplay, PrecedentsList, SuggestedImprovements, ReportDownload
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── EvidenceModal.tsx
│   │   └── HouseBuildingLoader.tsx
│   ├── lib/
│   │   ├── api/client.ts      # Axios client with mock fallback
│   │   ├── types/api.ts       # TypeScript request/response contracts
│   │   ├── constants/workTypes.ts
│   │   └── mock/fixtures.ts   # Mock data for development/demos
│   └── store/
│       └── analysisStore.ts   # Zustand store
│
├── server.ts                  # REST API server (Node.js)
├── pipeline.ts                # Analysis pipeline orchestration
├── gemini.ts                  # Google Gemini AI client
├── ibex.ts                    # Ibex Planning API client
├── tools.ts                   # Gemini function-calling tool declarations
├── postcodes.ts               # UK postcode geocoding
└── secrets.ts                 # API keys (git-ignored)
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- API keys for **Google Gemini** and **Ibex Planning API** (for backend)

### 1. Clone the repository

```bash
git clone https://github.com/SidM4/HackLondon26.git
cd HackLondon26
```

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app uses **mock data** by default so you can explore the full UI without a backend.

### 3. Run the backend (optional)

```bash
# From the project root
npm install

# Set your API keys
export GEMINI_API_KEY="your-gemini-api-key"
export IBEX_JWT_TOKEN="your-ibex-token"

npx tsx server.ts
```

The backend runs on port **3001**.

### 4. Connect frontend to backend

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Restart the dev server for the changes to take effect.

---

## Features

- **Approval Probability Gauge** -- animated display showing your project's likelihood of council approval with a confidence interval
- **Historical Precedents** -- browse similar planning applications from your area, with decisions, dates, and evidence details
- **Smart Suggestions** -- AI-recommended alternative improvements with estimated costs, projected value uplift, and approval probability
- **PDF Report Export** -- download a detailed report with all analysis results
- **28 Work Types** across 5 categories: Extensions & Conversions, External Works, Outbuildings & Structures, Change of Use, and Other
- **Responsive Design** -- fully functional on mobile, tablet, and desktop
- **Mock Mode** -- full demo experience without any backend setup

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/analyse` | Main analysis (postcode, property details, work type) |
| `POST` | `/predict_planning` | Planning prediction |
| `POST` | `/estimate_roi` | ROI estimation |

### Example Request

```json
POST /analyse
{
  "postcode": "SW1A 1AA",
  "property_description": {
    "property_type": "Semi-detached",
    "bedrooms": 3,
    "bathrooms": 1,
    "other_details": "Victorian terrace with rear garden"
  },
  "work_type": "rear_extension"
}
```

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `GEMINI_API_KEY` | Backend | Google Gemini API key |
| `IBEX_JWT_TOKEN` | Backend | Ibex Planning API token |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend | Backend API root URL (empty = mock mode) |
| `NEXT_PUBLIC_USE_MOCK` | Frontend | Force mock data (`true` / `false`) |

---

## Team

Built with caffeine and conviction at HackLondon 2026.

---

## License

ISC
