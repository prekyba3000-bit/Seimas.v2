-- Migration: Create Materialized View for MP Stats Aggregation
-- Created at: 2026-02-11
-- Purpose: Pre-calculate complex aggregations for the dashboard to speed up read queries.
DROP MATERIALIZED VIEW IF EXISTS mp_stats_summary;
CREATE MATERIALIZED VIEW mp_stats_summary AS
SELECT p.id AS mp_id,
    p.display_name,
    p.current_party,
    p.photo_url,
    p.seimas_mp_id,
    -- Total registered votes for sessions where MP was present (or could be present)
    -- Simplification: Total votes in the database associated with this MP
    COUNT(mv.vote_id) AS total_votes_registered,
    -- Votes where the MP actually cast a vote (was not 'Nedalyvavo')
    COUNT(mv.vote_id) FILTER (
        WHERE mv.vote_choice != 'Nedalyvavo'
    ) AS total_votes_cast,
    -- Attendance %: (Votes Cast / Total Registered) * 100
    CASE
        WHEN COUNT(mv.vote_id) > 0 THEN ROUND(
            (
                COUNT(mv.vote_id) FILTER (
                    WHERE mv.vote_choice != 'Nedalyvavo'
                )::numeric / COUNT(mv.vote_id) * 100
            ),
            2
        )
        ELSE 0
    END AS attendance_percentage,
    -- Most frequent vote choice (e.g. 'Uz', 'Pries', 'Susilaike')
    MODE() WITHIN GROUP (
        ORDER BY mv.vote_choice
    ) AS most_frequent_vote,
    NOW() as last_refreshed
FROM politicians p
    LEFT JOIN mp_votes mv ON p.id = mv.politician_id
GROUP BY p.id,
    p.display_name,
    p.current_party,
    p.photo_url,
    p.seimas_mp_id;
-- Unique index to allow CONCURRENTLY refresh
CREATE UNIQUE INDEX idx_mp_stats_summary_id ON mp_stats_summary(mp_id);