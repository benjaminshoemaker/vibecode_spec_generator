-- ================================================
-- COHORT ANALYSIS QUERIES FOR VIBESCAFFOLD
-- Run these directly in Neon console or psql
-- ================================================

-- 1. Daily active users (last 14 days)
SELECT
  DATE(created_at) as day,
  COUNT(DISTINCT client_id) as unique_users,
  COUNT(*) as total_events
FROM user_events
WHERE created_at > NOW() - INTERVAL '14 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- 2. Weekly cohort retention
-- Shows: Of users who first appeared in week X, what % came back in subsequent weeks?
WITH first_seen AS (
  SELECT
    client_id,
    DATE_TRUNC('week', MIN(created_at)) as cohort_week
  FROM user_events
  GROUP BY client_id
),
user_activity AS (
  SELECT
    e.client_id,
    f.cohort_week,
    DATE_TRUNC('week', e.created_at) as activity_week
  FROM user_events e
  JOIN first_seen f ON e.client_id = f.client_id
)
SELECT
  cohort_week,
  COUNT(DISTINCT client_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN activity_week = cohort_week THEN client_id END) as week_0,
  COUNT(DISTINCT CASE WHEN activity_week = cohort_week + INTERVAL '1 week' THEN client_id END) as week_1,
  COUNT(DISTINCT CASE WHEN activity_week = cohort_week + INTERVAL '2 weeks' THEN client_id END) as week_2,
  COUNT(DISTINCT CASE WHEN activity_week = cohort_week + INTERVAL '3 weeks' THEN client_id END) as week_3
FROM user_activity
GROUP BY cohort_week
ORDER BY cohort_week DESC
LIMIT 8;

-- 3. Conversion funnel (last 7 days)
SELECT
  COUNT(DISTINCT CASE WHEN event_type = 'session_start' THEN client_id END) as sessions,
  COUNT(DISTINCT CASE WHEN event_type = 'wizard_start' THEN client_id END) as started_wizard,
  COUNT(DISTINCT CASE WHEN event_type = 'doc_generated' THEN client_id END) as generated_doc,
  COUNT(DISTINCT CASE WHEN event_type = 'wizard_complete' THEN client_id END) as completed_wizard,
  COUNT(DISTINCT CASE WHEN event_type = 'download' THEN client_id END) as downloaded
FROM user_events
WHERE created_at > NOW() - INTERVAL '7 days';

-- 4. Power users (3+ active days in last 14 days)
SELECT
  client_id,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  COUNT(*) FILTER (WHERE event_type = 'chat_message') as total_chats,
  COUNT(*) FILTER (WHERE event_type = 'doc_generated') as docs_generated,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM user_events
WHERE created_at > NOW() - INTERVAL '14 days'
GROUP BY client_id
HAVING COUNT(DISTINCT DATE(created_at)) >= 3
ORDER BY active_days DESC;

-- 5. Returning vs new users by day (last 7 days)
SELECT
  DATE(created_at) as day,
  COUNT(DISTINCT client_id) FILTER (WHERE metadata->>'returning' = 'true') as returning_users,
  COUNT(DISTINCT client_id) FILTER (WHERE metadata->>'returning' = 'false') as new_users
FROM user_events
WHERE event_type = 'session_start'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- 6. Weekly active users who generate docs (your target metric)
SELECT
  DATE_TRUNC('week', created_at) as week,
  COUNT(DISTINCT client_id) as users_who_generated
FROM user_events
WHERE event_type = 'doc_generated'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;

-- 7. 30-day retention check
-- Of users from first week, how many are still active in last 7 days?
WITH early_users AS (
  SELECT DISTINCT client_id
  FROM user_events
  WHERE created_at < (SELECT MIN(created_at) + INTERVAL '7 days' FROM user_events)
),
recent_activity AS (
  SELECT DISTINCT client_id
  FROM user_events
  WHERE created_at > NOW() - INTERVAL '7 days'
)
SELECT
  (SELECT COUNT(*) FROM early_users) as early_cohort_size,
  COUNT(*) as still_active,
  ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM early_users), 0) * 100, 1) as retention_pct
FROM early_users e
JOIN recent_activity r ON e.client_id = r.client_id;

-- 8. Engagement depth: chats and docs per user per day
SELECT
  client_id,
  DATE(created_at) as day,
  COUNT(*) FILTER (WHERE event_type = 'chat_message') as chats,
  COUNT(*) FILTER (WHERE event_type = 'doc_generated') as docs_generated
FROM user_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY client_id, DATE(created_at)
ORDER BY chats DESC
LIMIT 20;

-- 9. Funnel by step: which steps do users complete?
SELECT
  metadata->>'step_name' as step,
  COUNT(DISTINCT client_id) as users
FROM user_events
WHERE event_type = 'doc_generated'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY metadata->>'step_name'
ORDER BY users DESC;

-- 10. Time to first doc: how long after session_start do users generate their first doc?
WITH first_session AS (
  SELECT client_id, MIN(created_at) as first_session_at
  FROM user_events
  WHERE event_type = 'session_start'
  GROUP BY client_id
),
first_doc AS (
  SELECT client_id, MIN(created_at) as first_doc_at
  FROM user_events
  WHERE event_type = 'doc_generated'
  GROUP BY client_id
)
SELECT
  CASE
    WHEN EXTRACT(EPOCH FROM (d.first_doc_at - s.first_session_at))/60 < 5 THEN '0-5 min'
    WHEN EXTRACT(EPOCH FROM (d.first_doc_at - s.first_session_at))/60 < 15 THEN '5-15 min'
    WHEN EXTRACT(EPOCH FROM (d.first_doc_at - s.first_session_at))/60 < 30 THEN '15-30 min'
    ELSE '30+ min'
  END as time_bucket,
  COUNT(*) as users
FROM first_session s
JOIN first_doc d ON s.client_id = d.client_id
GROUP BY 1
ORDER BY 1;
