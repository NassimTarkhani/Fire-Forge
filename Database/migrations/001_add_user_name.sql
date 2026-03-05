-- Migration: Add name column to users table
-- Run this in your Supabase SQL Editor if you have an existing database

-- Add name column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS name text;

-- Optional: Add a comment
COMMENT ON COLUMN users.name IS 'User full name';
