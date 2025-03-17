-- Create profiles table
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    full_name text,
    phone_number text,
    department text,
    role text check (role in ('admin', 'employee')) default 'employee',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
create policy "Users can read any profile"
  on profiles for select
  using ( true );

create policy "Users can create their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update using ( auth.uid() = id );

-- Function to handle updating updated_at
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

-- Trigger to automatically update updated_at
create trigger handle_profiles_updated_at
  before update on profiles
  for each row
  execute procedure handle_updated_at();
