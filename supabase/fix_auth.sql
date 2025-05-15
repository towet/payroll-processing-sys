-- Drop existing policies
drop policy if exists "Profiles are viewable by authenticated users" on profiles;
drop policy if exists "Users can create their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Create new policies with proper authentication checks
create policy "Anyone can create their own profile"
  on profiles for insert
  with check (
    auth.uid() = id
  );

create policy "Authenticated users can read profiles"
  on profiles for select
  using (
    auth.role() = 'authenticated'
  );

create policy "Users can update their own profile"
  on profiles for update
  using (
    auth.uid() = id
  );
