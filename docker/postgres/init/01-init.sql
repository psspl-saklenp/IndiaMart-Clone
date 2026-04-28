-- Create test database (development DB is created automatically by POSTGRES_DB env var)
SELECT 'CREATE DATABASE indiamart_clone_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'indiamart_clone_test')\gexec

-- Enable required extensions on the development database
\c indiamart_clone_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Same on the test database
\c indiamart_clone_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
