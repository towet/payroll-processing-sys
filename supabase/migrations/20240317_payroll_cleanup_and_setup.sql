-- First, drop everything in the correct order to avoid dependency issues
DROP TABLE IF EXISTS payroll_history;
DROP TABLE IF EXISTS payroll_items;
DROP TABLE IF EXISTS payroll_periods;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Create the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create payroll_periods table
CREATE TABLE payroll_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_period CHECK (period_end > period_start),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Create payroll_items table
CREATE TABLE payroll_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    base_salary DECIMAL(10, 2) NOT NULL,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    overtime_rate DECIMAL(10, 2) DEFAULT 0,
    overtime_pay DECIMAL(10, 2) GENERATED ALWAYS AS (overtime_hours * overtime_rate) STORED,
    allowances DECIMAL(10, 2) DEFAULT 0,
    bonuses DECIMAL(10, 2) DEFAULT 0,
    tax_deductions DECIMAL(10, 2) DEFAULT 0,
    insurance_deductions DECIMAL(10, 2) DEFAULT 0,
    other_deductions DECIMAL(10, 2) DEFAULT 0,
    gross_pay DECIMAL(10, 2) GENERATED ALWAYS AS (
        base_salary + (overtime_hours * overtime_rate) + allowances + bonuses
    ) STORED,
    net_pay DECIMAL(10, 2) GENERATED ALWAYS AS (
        base_salary + (overtime_hours * overtime_rate) + allowances + bonuses 
        - tax_deductions - insurance_deductions - other_deductions
    ) STORED,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    CONSTRAINT unique_employee_period UNIQUE (employee_id, period_id)
);

-- Create triggers for updated_at
CREATE TRIGGER update_payroll_periods_updated_at
    BEFORE UPDATE ON payroll_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_items_updated_at
    BEFORE UPDATE ON payroll_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create payroll_history as a table instead of a view for better performance
CREATE TABLE payroll_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period_id UUID NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    employee_id UUID NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    base_salary DECIMAL(10, 2) NOT NULL,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    overtime_rate DECIMAL(10, 2) DEFAULT 0,
    overtime_pay DECIMAL(10, 2) DEFAULT 0,
    allowances DECIMAL(10, 2) DEFAULT 0,
    bonuses DECIMAL(10, 2) DEFAULT 0,
    tax_deductions DECIMAL(10, 2) DEFAULT 0,
    insurance_deductions DECIMAL(10, 2) DEFAULT 0,
    other_deductions DECIMAL(10, 2) DEFAULT 0,
    gross_pay DECIMAL(10, 2) NOT NULL,
    net_pay DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT fk_period FOREIGN KEY (period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE,
    CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create a trigger to automatically populate payroll_history
CREATE OR REPLACE FUNCTION sync_payroll_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO payroll_history (
            period_id, period_start, period_end, employee_id,
            first_name, last_name, department, position,
            base_salary, overtime_hours, overtime_rate, overtime_pay,
            allowances, bonuses, tax_deductions, insurance_deductions,
            other_deductions, gross_pay, net_pay, status, notes
        )
        SELECT
            pi.period_id, pp.period_start, pp.period_end, pi.employee_id,
            e.first_name, e.last_name, e.department, e.position,
            pi.base_salary, pi.overtime_hours, pi.overtime_rate, pi.overtime_pay,
            pi.allowances, pi.bonuses, pi.tax_deductions, pi.insurance_deductions,
            pi.other_deductions, pi.gross_pay, pi.net_pay, pi.status, pi.notes
        FROM payroll_items pi
        JOIN payroll_periods pp ON pi.period_id = pp.id
        JOIN employees e ON pi.employee_id = e.id
        WHERE pi.id = NEW.id
        ON CONFLICT (id) DO UPDATE SET
            period_id = EXCLUDED.period_id,
            period_start = EXCLUDED.period_start,
            period_end = EXCLUDED.period_end,
            employee_id = EXCLUDED.employee_id,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            department = EXCLUDED.department,
            position = EXCLUDED.position,
            base_salary = EXCLUDED.base_salary,
            overtime_hours = EXCLUDED.overtime_hours,
            overtime_rate = EXCLUDED.overtime_rate,
            overtime_pay = EXCLUDED.overtime_pay,
            allowances = EXCLUDED.allowances,
            bonuses = EXCLUDED.bonuses,
            tax_deductions = EXCLUDED.tax_deductions,
            insurance_deductions = EXCLUDED.insurance_deductions,
            other_deductions = EXCLUDED.other_deductions,
            gross_pay = EXCLUDED.gross_pay,
            net_pay = EXCLUDED.net_pay,
            status = EXCLUDED.status,
            notes = EXCLUDED.notes,
            updated_at = TIMEZONE('utc'::text, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_payroll_history_trigger
    AFTER INSERT OR UPDATE ON payroll_items
    FOR EACH ROW
    EXECUTE FUNCTION sync_payroll_history();
