# Skaidrus Seimas - Project Documentation

**Project Type:** Transparency Dashboard (Web Application)
**Status:** Active Development (Brownfield)

## 📌 Executive Summary
"Skaidrus Seimas" (Transparent Parliament) is a data visualization platform designed to illuminate the voting records, attendance, and asset declarations of Lithuanian Parliament (Seimas) members. By providing pairwise comparison tools and historical data analysis, it aims to increase political accountability.

## 🏗 Architecture

### Frontend (`dashboard/`)
- **Technology:** React, Vite, Tailwind CSS, Framer Motion
- **Key Views:**
  - `ComparisonView`: Matrix view of MP voting alignment.
  - `MpProfileView`: Individual MP detailed statistics.
  - `VotesListView`: Searchable legislation history.

### Backend (`backend/`)
- **Technology:** FastAPI, PostgreSQL (psycopg2)
- **Status:** Functional API with rate limiting and connection pooling.

### Data Pipelines (`scripts/`)
- **Ingestion:** Python scripts (`ingest_*.py`) fetch data from external sources (LRS/VRK).
- **Orchestration:** `orchestrator.py` manages the daily sync.

## 📂 Documentation Index
- [Accessibility Plan](compliance/ACCESSIBILITY_PLAN.md)
- [Security Review](compliance/SECURITY_REVIEW.md)
- [Funding Proposal](funding/PROPOSAL_OUTLINE.md)

## 📝 BMAD Integration
- **Classification:** Brownfield
- **Tracking:** Active (repo ID fixed)
