-- FireForge Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table (optional, for metadata & admin flag)
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    is_admin boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- API Keys Table
CREATE TABLE api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    key_prefix text NOT NULL,
    hashed_key text NOT NULL,
    revoked boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Credits Table
CREATE TABLE credits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    balance int DEFAULT 0,
    updated_at timestamptz DEFAULT now()
);

-- Endpoint Pricing Table
CREATE TABLE endpoint_pricing (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint text UNIQUE NOT NULL,
    cost int NOT NULL DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Usage Logs Table
CREATE TABLE usage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint text NOT NULL,
    request_size int,
    response_size int,
    credits_used int NOT NULL,
    status_code int NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_revoked ON api_keys(revoked);
CREATE INDEX idx_credits_user_id ON credits(user_id);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_api_key_id ON usage_logs(api_key_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_usage_logs_endpoint ON usage_logs(endpoint);

-- Optional: Insert default endpoint pricing
INSERT INTO endpoint_pricing (endpoint, cost) VALUES
    ('/v1/scrape', 1),
    ('/v1/crawl', 5),
    ('/v1/map', 2),
    ('/v1/search', 1),
    ('/v1/extract', 3),
    ('/v1/batch/scrape', 10),
    ('/v1/batch/crawl', 20)
ON CONFLICT (endpoint) DO NOTHING;

-- Optional: Create an admin user
-- INSERT INTO users (email, is_admin) VALUES ('admin@example.com', true);
