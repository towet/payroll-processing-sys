-- Drop existing update policies
DROP POLICY IF EXISTS "Authenticated users can update payroll periods" ON payroll_periods;
DROP POLICY IF EXISTS "Authenticated users can update payroll items" ON payroll_items;

-- Create updated policies with WITH CHECK clause
CREATE POLICY "Authenticated users can update payroll periods"
ON payroll_periods FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can update payroll items"
ON payroll_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
