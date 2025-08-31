-- Feedback table for customer service ratings
-- This table handles post-appointment customer feedback

create table if not exists public.feedback (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default now(),
  appointment_id text not null,
  customer_name text not null,
  services text[] null default '{}'::text[],
  staff_member text not null,
  service_duration text null default ''::text,
  overall_rating integer null default 0,
  service_quality integer null default 0,
  staff_rating integer null default 0,
  cleanliness integer null default 0,
  value_for_money integer null default 0,
  text_feedback text null default ''::text,
  additional_comments text null default ''::text,
  recommendation_score integer null default 0,
  would_return text null default ''::text,
  submitted_by_staff_id text null default ''::text,
  submission_device text null default 'tablet'::text,
  constraint feedback_pkey primary key (id)
) TABLESPACE pg_default;

-- Create indexes for performance
create index if not exists feedback_appointment_id_idx 
  on public.feedback using btree (appointment_id) TABLESPACE pg_default;

create index if not exists feedback_created_at_idx 
  on public.feedback using btree (created_at desc) TABLESPACE pg_default;

create index if not exists feedback_overall_rating_idx 
  on public.feedback using btree (overall_rating) TABLESPACE pg_default;

create index if not exists feedback_recommendation_score_idx 
  on public.feedback using btree (recommendation_score) TABLESPACE pg_default;

create index if not exists feedback_staff_member_idx 
  on public.feedback using btree (staff_member) TABLESPACE pg_default;
