-- Drop and recreate payroll_history view
DROP VIEW IF EXISTS payroll_history;

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
