-- Daily Tasks Table Migration
-- Run this SQL in your Supabase SQL Editor

-- Create daily_tasks table
create table daily_tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  task_date date not null,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index for efficient querying by date
create index daily_tasks_date_idx on daily_tasks(task_date desc);

-- Index for cleanup queries
create index daily_tasks_date_completed_idx on daily_tasks(task_date, is_completed);

-- RLS policies (enable all access for all users - adjust based on your auth setup)
alter table daily_tasks enable row level security;

create policy "Enable all access for all users" 
  on daily_tasks 
  for all 
  using (true);

-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_daily_tasks_updated_at
  before update on daily_tasks
  for each row
  execute function update_updated_at_column();
