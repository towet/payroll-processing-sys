-- Insert federal tax rates for 2024
INSERT INTO tax_rates (tax_type, tax_year, income_from, income_to, rate) VALUES
('federal', 2024, 0, 11600, 10.00),
('federal', 2024, 11601, 47150, 12.00),
('federal', 2024, 47151, 100525, 22.00),
('federal', 2024, 100526, 191950, 24.00),
('federal', 2024, 191951, 267900, 32.00),
('federal', 2024, 267901, 553850, 35.00),
('federal', 2024, 553851, 999999999, 37.00);

-- Insert sample state tax rates (example for California)
INSERT INTO tax_rates (tax_type, state_code, tax_year, income_from, income_to, rate) VALUES
('state', 'CA', 2024, 0, 10099, 1.00),
('state', 'CA', 2024, 10100, 23942, 2.00),
('state', 'CA', 2024, 23943, 37788, 4.00),
('state', 'CA', 2024, 37789, 52455, 6.00),
('state', 'CA', 2024, 52456, 66295, 8.00),
('state', 'CA', 2024, 66296, 338639, 9.30),
('state', 'CA', 2024, 338640, 406364, 10.30),
('state', 'CA', 2024, 406365, 677275, 11.30),
('state', 'CA', 2024, 677276, 999999999, 12.30);

-- Insert sample local tax rates
INSERT INTO tax_rates (tax_type, state_code, locality, tax_year, income_from, income_to, rate) VALUES
('local', 'CA', 'San Francisco', 2024, 0, 999999999, 1.50),
('local', 'CA', 'Los Angeles', 2024, 0, 999999999, 1.00),
('local', 'CA', 'San Diego', 2024, 0, 999999999, 0.75);
