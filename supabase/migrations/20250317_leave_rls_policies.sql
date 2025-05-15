-- First drop all policies that depend on the functions
DROP POLICY IF EXISTS "view_leave_requests" ON leaves;
DROP POLICY IF EXISTS "create_leave_requests" ON leaves;
DROP POLICY IF EXISTS "update_own_leave_requests" ON leaves;
DROP POLICY IF EXISTS "admin_update_leave_requests" ON leaves;
DROP POLICY IF EXISTS "admin_delete_leave_requests" ON leaves;

-- Then drop the functions
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS get_employee_id();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM employees e
    WHERE e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND e.position = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get employee ID from auth.users
CREATE OR REPLACE FUNCTION get_employee_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM employees e
    WHERE e.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for leaves table
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Policy for employees to view their own leave requests
CREATE POLICY "view_leave_requests"
ON leaves FOR SELECT
USING (
  employee_id = get_employee_id()
  OR 
  is_admin()
);

-- Policy for employees to create their own leave requests
CREATE POLICY "create_leave_requests"
ON leaves FOR INSERT
WITH CHECK (
  employee_id = get_employee_id()
);

-- Policy for employees to update their own pending leave requests
CREATE POLICY "update_own_leave_requests"
ON leaves FOR UPDATE
USING (
  employee_id = get_employee_id()
  AND status = 'pending'
);

-- Policy for admin to update any leave request
CREATE POLICY "admin_update_leave_requests"
ON leaves FOR UPDATE
USING (
  is_admin()
);

-- Policy for admin to delete leave requests
CREATE POLICY "admin_delete_leave_requests"
ON leaves FOR DELETE
USING (
  is_admin()
);
