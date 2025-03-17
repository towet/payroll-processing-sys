-- Check for any tables or views named payroll_history
SELECT 
    c.relname as name,
    CASE c.relkind 
        WHEN 'r' THEN 'table'
        WHEN 'v' THEN 'view'
        WHEN 'm' THEN 'materialized view'
    END as type
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relname LIKE '%payroll%';
