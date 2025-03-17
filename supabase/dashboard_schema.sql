-- Create employees table
create table employees (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid references profiles(id) on delete cascade,
    position text not null,
    department text not null,
    salary numeric(10, 2) not null,
    hire_date timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create payroll table
create table payroll (
    id uuid primary key default uuid_generate_v4(),
    employee_id uuid references employees(id) on delete cascade,
    amount numeric(10, 2) not null,
    status text check (status in ('Pending', 'Processed', 'Failed')) default 'Pending',
    process_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tax_records table
create table tax_records (
    id uuid primary key default uuid_generate_v4(),
    type text not null,
    amount numeric(10, 2) not null,
    status text check (status in ('Filed', 'Pending')) default 'Pending',
    filing_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create attendance table
create table attendance (
    id uuid primary key default uuid_generate_v4(),
    employee_id uuid references employees(id) on delete cascade,
    status text check (status in ('Present', 'Late', 'Absent')) not null,
    time_in timestamp with time zone,
    time_out timestamp with time zone,
    date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create activity_log table
create table activity_log (
    id uuid primary key default uuid_generate_v4(),
    action text not null,
    user_id uuid references profiles(id) on delete cascade,
    details jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table employees enable row level security;
alter table payroll enable row level security;
alter table tax_records enable row level security;
alter table attendance enable row level security;
alter table activity_log enable row level security;

-- Create policies for employees table
create policy "Employees are viewable by authenticated users"
    on employees for select
    using (auth.role() = 'authenticated');

create policy "Admins can insert employees"
    on employees for insert
    with check (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

create policy "Admins can update employees"
    on employees for update
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Create policies for payroll table
create policy "Payroll records are viewable by authenticated users"
    on payroll for select
    using (auth.role() = 'authenticated');

create policy "Admins can manage payroll"
    on payroll for all
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Create policies for tax_records table
create policy "Tax records are viewable by authenticated users"
    on tax_records for select
    using (auth.role() = 'authenticated');

create policy "Admins can manage tax records"
    on tax_records for all
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Create policies for attendance table
create policy "Attendance records are viewable by authenticated users"
    on attendance for select
    using (auth.role() = 'authenticated');

create policy "Users can view their own attendance"
    on attendance for select
    using (
        employee_id in (
            select id from employees
            where profile_id = auth.uid()
        )
    );

create policy "Admins can manage attendance"
    on attendance for all
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Create policies for activity_log table
create policy "Activity logs are viewable by authenticated users"
    on activity_log for select
    using (auth.role() = 'authenticated');

create policy "System can insert activity logs"
    on activity_log for insert
    with check (true);

-- Create function to handle updated_at
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

-- Create triggers for updated_at
create trigger handle_employees_updated_at
    before update on employees
    for each row
    execute procedure handle_updated_at();

create trigger handle_payroll_updated_at
    before update on payroll
    for each row
    execute procedure handle_updated_at();

create trigger handle_tax_records_updated_at
    before update on tax_records
    for each row
    execute procedure handle_updated_at();

create trigger handle_attendance_updated_at
    before update on attendance
    for each row
    execute procedure handle_updated_at();

-- Function to log activity
create or replace function log_activity(
    action text,
    user_id uuid,
    details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
as $$
begin
    insert into activity_log (action, user_id, details)
    values (action, user_id, details);
end;
$$;
