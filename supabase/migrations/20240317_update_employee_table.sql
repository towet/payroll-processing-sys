-- Drop foreign key constraints first
ALTER TABLE IF EXISTS employee_deductions
    DROP CONSTRAINT IF EXISTS employee_deductions_employee_id_fkey;

ALTER TABLE IF EXISTS payroll_history
    DROP CONSTRAINT IF EXISTS payroll_history_employee_id_fkey;

ALTER TABLE IF EXISTS payroll
    DROP CONSTRAINT IF EXISTS payroll_employee_id_fkey;

ALTER TABLE IF EXISTS attendance
    DROP CONSTRAINT IF EXISTS attendance_employee_id_fkey;

ALTER TABLE IF EXISTS activity_log
    DROP CONSTRAINT IF EXISTS activity_log_employee_id_fkey;

-- Now we can safely drop the employees table
DROP TABLE IF EXISTS employees;

-- Create new employee table with additional fields
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50),
    position VARCHAR(50),
    hire_date DATE NOT NULL,
    gross_salary DECIMAL(10, 2) NOT NULL,
    pay_period VARCHAR(20) NOT NULL, -- e.g., 'MONTHLY', 'BI-WEEKLY'
    tax_deduction DECIMAL(10, 2) DEFAULT 0,
    insurance_deduction DECIMAL(10, 2) DEFAULT 0,
    other_deductions DECIMAL(10, 2) DEFAULT 0,
    net_salary DECIMAL(10, 2) GENERATED ALWAYS AS (
        gross_salary - tax_deduction - insurance_deduction - other_deductions
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Recreate the foreign key relationships with the new employees table
ALTER TABLE IF EXISTS employee_deductions
    ADD CONSTRAINT employee_deductions_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES employees(id)
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS payroll_history
    ADD CONSTRAINT payroll_history_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES employees(id)
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS payroll
    ADD CONSTRAINT payroll_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES employees(id)
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS attendance
    ADD CONSTRAINT attendance_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES employees(id)
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS activity_log
    ADD CONSTRAINT activity_log_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES employees(id)
    ON DELETE CASCADE;
