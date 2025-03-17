-- Add INSERT and UPDATE policies for tax_rates
CREATE POLICY "Authenticated users can insert tax rates"
ON tax_rates FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tax rates"
ON tax_rates FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Add INSERT and UPDATE policies for employee_tax_details
CREATE POLICY "Authenticated users can insert employee tax details"
ON employee_tax_details FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update employee tax details"
ON employee_tax_details FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Add INSERT and UPDATE policies for tax_calculations
CREATE POLICY "Authenticated users can insert tax calculations"
ON tax_calculations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tax calculations"
ON tax_calculations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
