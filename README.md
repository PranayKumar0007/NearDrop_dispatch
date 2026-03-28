# NearDrop — Intelligent Last-Mile Delivery Recovery Network

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?style=flat&logo=postgresql)](https://postgis.net)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **30–40% of last-mile deliveries fail on the first attempt.** Every retry costs fuel, driver time, and customer trust — yet no affordable solution exists for the SME operators who handle the majority of urban deliveries in emerging markets. NearDrop is that solution.

NearDrop is a three-layer intelligent recovery platform that intercepts failed deliveries in real time, broadcasts them to a geo-proximate network of community micro-hubs, and builds a verifiable trust record for every actor in the delivery chain — turning operational data into financial infrastructure.

---

## Core Concept

Traditional last-mile platforms treat a failed delivery as a terminal event: log it, schedule a retry, burn fuel twice. NearDrop inverts this model. A failure event is a **trigger** — it activates a real-time geospatial marketplace where nearby community nodes (kirana stores, pharmacies, apartment receptions) compete to accept the package as a secure intermediate drop point.

The three pillars that make this work:

**1. DriverOS — Voice-First Delivery Interface**
Delivery drivers in dense urban markets are on bikes, in traffic, under time pressure. NearDrop's driver interface is voice-forward by design. Using OpenAI Whisper for offline-capable speech recognition, drivers report delivery status, request navigation, and trigger hub-drops entirely by voice in their local language (Hindi, Telugu, Tamil). No screen interaction while moving. The system uses intent classification to parse commands like *"customer nahi hai"* and autonomously initiates the recovery flow.

**2. DeadMile Engine — Geospatial Hub Broadcast**
On a failure event, the DeadMile Engine executes a PostGIS radius query to find all available registered hubs within 500m of the failed delivery point. It broadcasts the package offer via Redis pub/sub to hub owner devices over WebSocket. The first hub to accept receives the package assignment; the driver gets a rerouted drop point within 60 seconds. The customer receives an SMS pickup code. Zero retry trips. Zero dead miles.

**3. Trust Score Engine — Reputation as Financial Infrastructure**
Every delivery event — on-time rate, first-attempt success, hub acceptance rate, dispute history — feeds a weighted rolling score for drivers, hub owners, and courier operators. This score is not a gamification layer. It is a structured, portable reputation asset. An operator with 12 months of NearDrop score history holds a verifiable track record that can be presented to fleet insurers, logistics aggregators, and trade credit providers — directly addressing the financial exclusion of SME operators in emerging markets.

**Carbon Ledger (ESG Layer)**
Each hub reroute eliminates a retry trip. NearDrop calculates the distance delta per rerouting event and multiplies by IPCC emission factors per vehicle class, generating an auditable CO₂ saving logged at the transaction level. Operators receive weekly carbon reports — not as a dashboard feature, but as a byproduct of the core mechanic.

---

## System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  Driver PWA (voice-first)  │  Hub App  │  Operator Dashboard    │
└───────────────┬─────────────────────────────────────────────────┘
                │ REST + WebSocket
┌───────────────▼─────────────────────────────────────────────────┐
│                       SERVER LAYER (FastAPI)                     │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Delivery API│  │ DeadMile     │  │  Trust   │  │ Carbon  │  │
│  │ (REST)      │  │ Engine       │  │  Score   │  │ Ledger  │  │
│  └──────┬──────┘  └──────┬───────┘  └────┬─────┘  └────┬────┘  │
│         │                │               │              │        │
│  ┌──────▼────────────────▼───────────────▼──────────────▼─────┐ │
│  │              WebSocket Manager + Redis Pub/Sub              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────┬─────────────────────────────────────────────────┘
                │ SQLAlchemy ORM
┌───────────────▼──────────────┐   ┌────────────────────────────┐
│   PostgreSQL + PostGIS       │   │  External Services          │
│   (Geospatial queries,       │   │  Whisper STT (on-device)    │
│    delivery state,           │   │  OSM Nominatim (geocoding)  │
│    trust scores,             │   │  Twilio (SMS pickup codes)  │
│    carbon ledger)            │   └────────────────────────────┘
└──────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Backend framework | FastAPI (Python 3.11) | Async-native, auto-generated OpenAPI docs, WebSocket support |
| ORM | SQLAlchemy 2.0 | Async session support, clean migration path |
| Database | PostgreSQL 15 + PostGIS | Native geospatial radius queries for hub matching |
| Realtime | WebSocket + Redis pub/sub | Sub-100ms hub broadcast delivery |
| Voice STT | OpenAI Whisper (base model) | Offline-capable, multilingual, no API cost |
| Intent classification | Custom lightweight NLP (spaCy) | Low-latency local inference, no external dependency |
| TTS | gTTS / pyttsx3 | Multilingual spoken responses for driver copilot |
| Frontend | React 18 + Vite | Fast HMR, component-based PWA architecture |
| Styling | Tailwind CSS | Utility-first, mobile-first design system |
| Maps | Leaflet.js + OSM tiles | Open-source, no API key, offline tile support |
| Charts | Recharts | Declarative, composable analytics components |
| Geocoding | OSM Nominatim | Free, self-hostable, no usage limits |
| SMS | Twilio API | Pickup code delivery to customers |
| Local dev DB | SQLite (fallback) | Zero-config quick setup for development |

---

## Data Models

**Core entities and their relationships:**
```
Delivery ──────────────── Driver (Many-to-One)
    │                         │
    │ on failure               │ contributes to
    ▼                         ▼
HubBroadcast ──────── TrustScoreEvent
    │
    ▼
HubDrop ──────────── Hub (Many-to-One)
    │
    ▼
CarbonEvent (distance_delta_km, co2_saved_kg, vehicle_class)
```

**TrustScore computation (rolling weighted average):**
```
score = Σ (event_weight × outcome_value) / Σ event_weight
        over last N events (default N=100)

event_weight = recency_decay(days_ago) × event_type_weight
event_type_weight: { first_attempt_success: 1.0, hub_drop: 0.8,
                     on_time: 0.6, dispute_resolved: 1.2 }
```

---

## Project Structure
```
NearDrop/
├── backend/
│   ├── main.py                    # FastAPI app factory, middleware, router registry
│   ├── models.py                  # SQLAlchemy models (Delivery, Driver, Hub, TrustScore, CarbonEvent)
│   ├── schemas.py                 # Pydantic v2 request/response schemas
│   ├── websocket_manager.py       # Connection registry, room-based broadcast, Redis pub/sub bridge
│   ├── seed.py                    # Hyderabad-context mock data generator
│   └── routes/
│       ├── delivery.py            # Delivery lifecycle endpoints + failure trigger
│       ├── hubs.py                # Geospatial hub query, broadcast, acceptance handshake
│       ├── drivers.py             # Driver state, trust score retrieval
│       ├── dashboard.py           # Aggregate fleet metrics, carbon totals
│       └── voice.py               # Whisper transcription endpoint, intent classification
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DriverPWA.jsx      # Voice-first mobile interface
│   │   │   ├── HubApp.jsx         # Single-screen accept/reject + pickup code display
│   │   │   └── Dashboard.jsx      # Fleet map, analytics, driver leaderboard
│   │   ├── hooks/
│   │   │   ├── useVoice.js        # Whisper integration, MediaRecorder, intent parsing
│   │   │   └── useSocket.js       # WebSocket lifecycle, reconnect logic, event dispatch
│   │   └── components/
│   │       ├── LeafletMap.jsx     # Fleet map with driver/hub pins, status color coding
│   │       ├── MicButton.jsx      # Animated voice capture component
│   │       ├── TrustBadge.jsx     # Score display with trend indicator
│   │       └── HubBroadcastCard.jsx # Incoming package offer card for hub owners
└── neardrop.db                    # SQLite fallback for local development
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/delivery/fail` | Marks delivery failed, triggers DeadMile broadcast |
| `GET` | `/hubs/nearby` | PostGIS radius query — returns available hubs within `radius` metres |
| `POST` | `/hub/accept` | Hub accepts package — generates pickup code, notifies driver |
| `GET` | `/driver/{id}/score` | Returns trust score breakdown and recent delivery history |
| `GET` | `/dashboard/stats` | Aggregate metrics — deliveries, success rate, CO₂ saved |
| `GET` | `/dashboard/fleet` | Live driver positions and delivery statuses |
| `POST` | `/voice/transcribe` | Accepts audio blob, returns transcribed text + classified intent |
| `WS` | `/ws/{client_id}` | WebSocket connection for real-time fleet and hub updates |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15 with PostGIS extension (or use SQLite for local dev)
- Redis (for pub/sub in multi-worker deployments)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# For PostgreSQL + PostGIS (recommended)
export DATABASE_URL="postgresql+asyncpg://user:pass@localhost/neardrop"

# Run migrations and seed Hyderabad mock data
python -m seed

# Start server
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

| Interface | Route |
|---|---|
| Driver PWA | `http://localhost:5173/driver` |
| Hub Owner App | `http://localhost:5173/hub` |
| Operator Dashboard | `http://localhost:5173/dashboard` |

---

## Scalability Path

| Scale tier | Configuration |
|---|---|
| **Development** | SQLite + in-process WebSocket, single Uvicorn worker |
| **Pilot (1–10 operators)** | PostgreSQL + PostGIS, Redis pub/sub, 2–4 Uvicorn workers |
| **City scale (100+ operators)** | Docker + AWS ECS / GCP Cloud Run, managed RDS, ElastiCache Redis |
| **Multi-city** | Multi-region deployment, per-city PostGIS schemas, centralised trust score aggregation |

The geospatial hub query is the only latency-sensitive operation at scale. PostGIS `ST_DWithin` with a GIST index on hub coordinates handles 10,000+ hub lookups per second on standard hardware — no architectural changes required to scale from one city to ten.

---

## License

MIT License — see [LICENSE](LICENSE) for details.