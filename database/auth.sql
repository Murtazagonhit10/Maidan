USE master;
GO

-- Find all connections to Maidan database
SELECT 
    session_id,
    login_name,
    status,
    host_name,
    program_name,
    command,
    last_request_start_time
FROM sys.dm_exec_sessions
WHERE database_id = DB_ID('Maidan');
GO