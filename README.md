# CoopRank

Prestige rankings for Northeastern University co-op and internship roles. 81 companies ranked across 7 industry tracks using a crowd-trained ELO system.

## What it does

Ranks co-op and internship roles by prestige using a base score weighted by resume signal strength. Users can vote head-to-head on role pairs to train the rankings over time — every vote updates a shared ELO score that all users see.

**Tracks**
- 👑 Most Cracked — global prestige ranking across all roles
- ⚙️ Systems & Embedded — defense tech, hardware, autonomous vehicles
- 📊 Quant & Fintech — hedge funds, asset management, trading firms
- ☁️ Cloud & DevOps — cloud infrastructure, cybersecurity, observability
- 💻 General SWE — big tech, consumer apps, enterprise software
- 🧬 HealthTech & Biotech — pharma, medical devices, health platforms
- 🤖 AI & ML — companies with active AI/ML engineering work

Each track has its own independent ELO leaderboard — voting on AI only moves AI rankings.

**Filters:** role type (co-op vs internship), company size, selectivity

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                       │
│                                                      │
│  app/page.tsx          Server Component              │
│  ├── reads initialRatings from Redis on each load    │
│  └── passes data to RankingApp                       │
│                                                      │
│  components/RankingApp.tsx   Client Component        │
│  ├── all filtering, sorting, tab state               │
│  ├── optimistic ELO updates on vote                  │
│  └── POSTs votes to /api/vote in background          │
│                                                      │
│  app/api/vote/route.ts       Route Handler           │
│  ├── reads current track ratings from Redis          │
│  ├── applies ELO formula (K=16)                      │
│  └── writes updated ratings back                     │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              Upstash Redis (free tier)
              cooprank:ratings:{trackId}   ← per-track ELO scores
              cooprank:votes:{trackId}     ← vote count per track
```

**ELO formula:** `new_rating = old_rating + K × (outcome − expected)` where `expected = 1 / (1 + 10^((opponent − rating) / 400))`. Seed ratings are derived from `base_prestige_score × resume_signaling_multiplier` from the source data.

**Data sources**
- `company_roles_scored.json` — 81 role entries with prestige scores, tech stacks, compensation, and metadata
- `data/company_colors.json` — canonical brand colors per company
- Upstash Redis — live ELO ratings, updated by user votes
