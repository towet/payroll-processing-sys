-- Create tax_rates table
CREATE TABLE tax_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tax_type VARCHAR(50) NOT NULL, -- federal, state, local
    state_code VARCHAR(2), -- NULL for federal, state code for state taxes
    locality VARCHAR(100), -- NULL for federal and state taxes
    tax_year INTEGER NOT NULL,
    income_from DECIMAL(12, 2) NOT NULL,
    income_to DECIMAL(12, 2) NOT NULL,
    rate DECIMAL(5, 2) NOT NULL, -- percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_tax_type CHECK (tax_type IN ('federal', 'state', 'local')),
    CONSTRAINT valid_income_range CHECK (income_to > income_from)
);

-- Create employee_tax_details table
CREATE TABLE employee_tax_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL,
    filing_status VARCHAR(50) NOT NULL, -- single, married_joint, married_separate, head_household
    allowances INTEGER DEFAULT 0,
    additional_withholding DECIMAL(10, 2) DEFAULT 0,
    state_code VARCHAR(2),
    locality VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_filing_status CHECK (filing_status IN ('single', 'married_joint', 'married_separate', 'head_household'))
);

-- Create tax_calculations table
CREATE TABLE tax_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    payroll_item_id UUID NOT NULL REFERENCES payroll_items(id) ON DELETE CASCADE,
    tax_type VARCHAR(50) NOT NULL,
    taxable_income DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_tax_type CHECK (tax_type IN ('federal', 'state', 'local'))
);

-- Enable RLS
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_tax_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Authenticated users can view tax rates"
ON tax_rates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view employee tax details"
ON employee_tax_details FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view tax calculations"
ON tax_calculations FOR SELECT
TO authenticated
USING (true);

-- Add update trigger for updated_at
CREATE TRIGGER update_tax_rates_updated_at
    BEFORE UPDATE ON tax_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_tax_details_updated_at
    BEFORE UPDATE ON employee_tax_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_calculations_updated_at
    BEFORE UPDATE ON tax_calculations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
