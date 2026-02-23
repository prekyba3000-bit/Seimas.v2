# Active Context: Seimas v.2

## Current Focus
Stabilize the Hero Parliament platform as a transparent, auditable system with persistent agent context and operational runbooks.

## Recent Changes
- Operation Hero Parliament: added hero engine, `/api/v2/heroes/{mp_id}`, HeroCard integration.
- Operation True Score: introduced direct-data schema expansion (`speeches`, `committee_memberships`, `bills_authored_count`) and ingestion scripts.
- Operation Glass Box: calibrated forensic penalties, added `forensic_breakdown`, and score explainability UI.
- Operation Agentic Mind: installed project rules, skills, MCP memory config, and memory maintenance workflow.

## Current State
- Backend hero scoring and forensic explainability are implemented in `backend/hero_engine.py`.
- Leaderboard endpoint and view are integrated (`/api/v2/heroes/leaderboard`, `LeaderboardView.tsx`).
- Ingestion pipeline now has explicit sequence and script support.
- Persistent project guidance now exists in `.cursor/rules/` and `.cursor/skills/`.
- MCP memory is configured via `.mcp.json`; local memory file is ignored in git.

## Next Steps
1. Run migrations and full ingest pipeline on a configured DB (`DB_DSN`) and validate row populations.
2. Convert API responses to explicit Pydantic response models in FastAPI endpoints.
3. Introduce React Query in dashboard server-state flows to match frontend standards.
4. Add API and UI tests for forensic breakdown rendering and leaderboard integrity indicators.
