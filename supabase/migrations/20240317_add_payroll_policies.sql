-- Enable RLS on payroll tables
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;

-- Policies for payroll_periods
CREATE POLICY "Authenticated users can view payroll periods"
ON payroll_periods FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create payroll periods"
ON payroll_periods FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update payroll periods"
ON payroll_periods FOR UPDATE
TO authenticated
USING (true);

-- Policies for payroll_items
CREATE POLICY "Authenticated users can view payroll items"
ON payroll_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create payroll items"
ON payroll_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update payroll items"
ON payroll_items FOR UPDATE
TO authenticated
USING (true);
