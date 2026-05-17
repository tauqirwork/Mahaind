-- Execute this in your Supabase SQL Editor
DELETE FROM employees;
-- Reset ID sequence if necessary (optional)
-- ALTER SEQUENCE employees_id_seq RESTART WITH 1;

INSERT INTO employees (employee_id, name, base_salary, status) VALUES 
('U001', 'Ramkrushna Mastud', 50000, 'active'),
('U002', 'Umran Tamboli', 11333.333333333332, 'active'),
('U004', 'Rehan Jikare', 18000, 'active'),
('U005', 'Mahesh Gheware', 30000, 'active'),
('U007', 'Datta Gitte', 22100, 'active'),
('U008', 'Fazal Chandolkar', 59000, 'active'),
('Total', NULL, 0, 'active'),
('MI Tech', NULL, 0, 'active');