-- Fix RLS policies to allow form submissions from anonymous users
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policies
drop policy if exists "Service role can do everything on customer" on customer;
drop policy if exists "Service role can do everything on assessment_session" on assessment_session;
drop policy if exists "Service role can do everything on intake_form" on intake_form;
drop policy if exists "Service role can do everything on machine_scan" on machine_scan;
drop policy if exists "Service role can do everything on machine_metric" on machine_metric;

-- Create more permissive policies for form submissions

-- Customer table policies
create policy "Anyone can insert customers" on customer
  for insert with check (true);

create policy "Anyone can update customers" on customer
  for update using (true);

create policy "Anyone can select customers" on customer
  for select using (true);

-- Assessment session table policies  
create policy "Anyone can insert sessions" on assessment_session
  for insert with check (true);

create policy "Anyone can select sessions" on assessment_session
  for select using (true);

-- Intake form table policies
create policy "Anyone can insert intake forms" on intake_form
  for insert with check (true);

create policy "Anyone can select intake forms" on intake_form
  for select using (true);

-- Machine scan policies (for future use)
create policy "Anyone can insert machine scans" on machine_scan
  for insert with check (true);

create policy "Anyone can select machine scans" on machine_scan
  for select using (true);

-- Machine metric policies (for future use)
create policy "Anyone can insert machine metrics" on machine_metric
  for insert with check (true);

create policy "Anyone can select machine metrics" on machine_metric
  for select using (true);
