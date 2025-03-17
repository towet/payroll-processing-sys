-- Drop view if it exists
DROP VIEW IF EXISTS payroll_history;

-- Create payroll_periods table to track pay periods
CREATE TABLE payroll_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_period CHECK (period_end > period_start),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Create payroll_items table to store individual payroll entries
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
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    CONSTRAINT unique_employee_period UNIQUE (employee_id, period_id)
);

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payroll_periods_updated_at
    BEFORE UPDATE ON payroll_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_items_updated_at
    BEFORE UPDATE ON payroll_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create payroll_history view for easy querying
CREATE OR REPLACE VIEW payroll_history AS
SELECT 
    pi.id,
    pi.period_id,
    pp.period_start,
    pp.period_end,
    pi.employee_id,
    e.first_name,
    e.last_name,
    e.department,
    e.position,
    pi.base_salary,
    pi.overtime_hours,
    pi.overtime_rate,
    pi.overtime_pay,
    pi.allowances,
    pi.bonuses,
    pi.tax_deductions,
    pi.insurance_deductions,
    pi.other_deductions,
    pi.gross_pay,
    pi.net_pay,
    pi.status,
    pi.notes,
    pi.created_at,
    pi.updated_at
FROM payroll_items pi
JOIN payroll_periods pp ON pi.period_id = pp.id
JOIN employees e ON pi.employee_id = e.id;
