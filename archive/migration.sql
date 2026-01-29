-- Migration: Add WCAG 2.1 AA Support Fields
-- Date: 2026-01-29
-- 1. Add multilingual alt_text field
ALTER TABLE politicians
ADD COLUMN IF NOT EXISTS alt_text JSONB;
-- 2. Add plain_text_bio field
ALTER TABLE politicians
ADD COLUMN IF NOT EXISTS plain_text_bio TEXT;
-- 3. Comments for documentation
COMMENT ON COLUMN politicians.alt_text IS 'Multilingual alt text for accessibility (e.g. {"lt": "...", "en": "..."})';
COMMENT ON COLUMN politicians.plain_text_bio IS 'Simplified, screen-reader friendly bio without rich formatting';