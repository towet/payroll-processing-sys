-- Drop existing policies
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;
drop policy if exists "Users can read any profile" on profiles;
drop policy if exists "Users can create their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Temporarily disable RLS for setup
alter table profiles disable row level security;

-- Delete existing data if needed (be careful with this in production!)
truncate table profiles;

-- Enable RLS
alter table profiles enable row level security;

-- Create new policies with more permissive insert
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using ( auth.role() = 'authenticated' );

create policy "Users can create their own profile"
  on profiles for insert
  with check ( true ); -- More permissive during signup

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Ensure the trigger is set up correctly
drop trigger if exists handle_profiles_updated_at on profiles;
drop function if exists handle_updated_at();

create or replace function handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger handle_profiles_updated_at
  before update on profiles
  for each row
  execute procedure handle_updated_at();
