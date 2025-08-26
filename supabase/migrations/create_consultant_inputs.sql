-- Create the consultant_inputs table
create table if not exists consultant_inputs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  consultation_id uuid references consultations(id) not null,
  customer_name text not null,
  customer_phone text not null,
  
  -- Evaluation
  evaluation jsonb not null default '{}'::jsonb,
  unsuitable_products text[] not null default '{}',
  
  -- Skin Analysis
  skin_analysis jsonb not null default '{
    "skin_type_confirmation": "",
    "additional_skin_concerns": [],
    "recommended_treatments": [],
    "contraindications": [],
    "patch_test_required": false,
    "patch_test_notes": null
  }'::jsonb,
  
  -- Product Recommendations
  product_recommendations jsonb not null default '{
    "cleanser": "",
    "toner": "",
    "serum": [],
    "moisturizer": "",
    "sunscreen": "",
    "treatments": [],
    "masks": []
  }'::jsonb,
  
  -- Treatment Plan
  treatment_plan jsonb not null default '{
    "immediate_treatments": [],
    "future_treatments": [],
    "treatment_frequency": "",
    "special_considerations": ""
  }'::jsonb,
  
  -- Notes and Staff Info
  staff_notes text not null default '',
  follow_up_required boolean not null default false,
  follow_up_date date,
  staff_member text not null,
  consultation_date date not null,
  
  -- Add foreign key constraint
  constraint fk_consultation
    foreign key (consultation_id)
    references consultations(id)
    on delete cascade
);

-- Create index for faster lookups
create index if not exists consultant_inputs_consultation_id_idx
  on consultant_inputs(consultation_id);

-- Enable Row Level Security (RLS)
alter table consultant_inputs enable row level security;

-- Create policy to allow all operations for authenticated users
create policy "Enable all operations for authenticated users"
  on consultant_inputs
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Create a view to get consultations without consultant input
create or replace view consultations_without_input as
select c.*
from consultations c
left join consultant_inputs ci on c.id = ci.consultation_id
where ci.id is null; 