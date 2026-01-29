# Tech Context: Seimas v.2

## Stack
- **Language**: Python 3.x
- **Database**: PostgreSQL (with UUID extension)
- **Version Control**: Git

## Key Dependencies
- `subprocess`: For orchestrating script execution.
- `psycopg2` / `sqlalchemy` (implied): For database interaction.
- `requests` / `lxml`: For scraping/API calls.

## Development Environment
- Linux-based environment (Julio's workspace).
- Project root: `/home/julio/.gemini/antigravity/scratch/transparency_project/`

## Database Schema
The schema is defined in `schema.sql` and includes:
- `politicians`: Central identity table.
- `assets`: VMI asset data.
- `interests`: VTEK conflict of interest data.
- `votes` & `mp_votes`: Voting records.
