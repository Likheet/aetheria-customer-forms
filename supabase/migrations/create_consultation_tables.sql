-- Aetheria Customer Consultation Database Schema
-- Run this in Supabase SQL Editor

-- Enable extension for UUIDs (usually on by default in Supabase)
create extension if not exists pgcrypto;

-- 1) Customers table (Section A: Basic Information)
create table if not exists customer (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_e164 text not null unique,         -- +91... format
  dob date,
  gender text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Add phone validation
  constraint valid_e164 check (phone_e164 ~ '^\+[1-9]\d{1,14}$')
);

-- 2) Assessment sessions (One row per visit/form-fill)
create table if not exists assessment_session (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer(id),
  tz text not null default 'Asia/Kolkata',
  location text,                           -- clinic/branch if multiple locations
  staff_id uuid,                           -- who conducted the session (optional)
  created_at timestamptz not null default now()
);

-- 3) Intake forms (Sections B-E: The actual form data)
create table if not exists intake_form (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references assessment_session(id) on delete cascade,
  form_version text not null default '1.0',
  answers jsonb not null,                  -- normalized form payload
  raw jsonb,                               -- optional: exact frontend payload
  created_at timestamptz not null default now()
);

-- OPTIONAL: Future machine scan integration
create table if not exists machine_scan (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references assessment_session(id) on delete cascade,
  device_id text,
  capture_modes text[],                    -- ["RGB","PL","UV"]
  level_of_care_hint text,
  raw_report jsonb not null,               -- keep vendor payload
  created_at timestamptz not null default now()
);

create table if not exists machine_metric (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references machine_scan(id) on delete cascade,
  key text not null,                       -- "moisture" | "sebum" | "texture" etc
  value numeric,
  unit text,                               -- "pct" | "score" | ...
  severity text,                           -- "none"|"low"|"moderate"|"high"
  confidence numeric,                      -- 0..1
  source_key text,                         -- vendor label
  mode text                                -- "RGB"|"PL"|"UV"
);

-- Create indexes for performance
create index if not exists idx_session_customer_created
  on assessment_session (customer_id, created_at desc);

create index if not exists idx_intake_answers_gin 
  on intake_form using gin (answers);

create index if not exists idx_metric_scan_key 
  on machine_metric (scan_id, key);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Add trigger to customer table
create trigger update_customer_updated_at 
  before update on customer 
  for each row execute procedure update_updated_at_column();

-- Enable Row Level Security (RLS)
alter table customer enable row level security;
alter table assessment_session enable row level security;
alter table intake_form enable row level security;
alter table machine_scan enable row level security;
alter table machine_metric enable row level security;

-- Create policies (adjust as needed for your auth setup)
-- For now, allow service role full access
create policy "Service role can do everything on customer" on customer
  for all using (auth.role() = 'service_role');

create policy "Service role can do everything on assessment_session" on assessment_session
  for all using (auth.role() = 'service_role');

create policy "Service role can do everything on intake_form" on intake_form
  for all using (auth.role() = 'service_role');

create policy "Service role can do everything on machine_scan" on machine_scan
  for all using (auth.role() = 'service_role');

create policy "Service role can do everything on machine_metric" on machine_metric
  for all using (auth.role() = 'service_role');

-- Insert a test record to verify everything works
insert into customer (full_name, phone_e164, dob, gender) 
values ('Test Customer', '+919999999999', '1990-01-01', 'Female')
on conflict (phone_e164) do nothing;
