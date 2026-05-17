-- EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id            VARCHAR(10) PRIMARY KEY,  -- U001, U002
  name          VARCHAR(100) NOT NULL,
  designation   VARCHAR(100),
  doj           DATE,
  base_salary   DECIMAL(10,2) NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- LEAVE BALANCES (per employee per year)
CREATE TABLE IF NOT EXISTS leave_balances (
  id            SERIAL PRIMARY KEY,
  employee_id   VARCHAR(10) REFERENCES employees(id),
  year          INT NOT NULL,
  al_balance    DECIMAL(4,1) DEFAULT 0,   -- Annual Leave days remaining
  sl_balance    DECIMAL(4,1) DEFAULT 0,   -- Sick Leave balance
  comp_off_bal  DECIMAL(4,1) DEFAULT 0,
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, year)
);

-- ATTENDANCE (one row per employee per day)
CREATE TABLE IF NOT EXISTS attendance (
  id            SERIAL PRIMARY KEY,
  employee_id   VARCHAR(10) REFERENCES employees(id),
  date          DATE NOT NULL,
  status        VARCHAR(20) NOT NULL,
  -- ENUM: 'Onsite','WFH','AL','HD','PH','Comp Off','Week Off','Sick Leave','Absent','Unpaid Leave'
  notes         TEXT,
  marked_by     VARCHAR(100),   -- manager who marked it
  marked_at     TIMESTAMP DEFAULT NOW(),
  updated_by    VARCHAR(100),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- PAYROLL (monthly, one row per employee per month)
CREATE TABLE IF NOT EXISTS payroll (
  id               SERIAL PRIMARY KEY,
  employee_id      VARCHAR(10) REFERENCES employees(id),
  month            INT NOT NULL,           -- 1–12
  year             INT NOT NULL,
  base_salary      DECIMAL(10,2),
  -- Attendance summary
  onsite_days      DECIMAL(4,1) DEFAULT 0,
  wfh_days         DECIMAL(4,1) DEFAULT 0,
  al_taken         DECIMAL(4,1) DEFAULT 0,
  hd_taken         DECIMAL(4,1) DEFAULT 0,
  ph_days          DECIMAL(4,1) DEFAULT 0,
  comp_off_days    DECIMAL(4,1) DEFAULT 0,
  week_offs        INT DEFAULT 0,
  sick_leave_days  DECIMAL(4,1) DEFAULT 0,
  -- Calculated
  leave_balance_ytd DECIMAL(4,1) DEFAULT 0,
  approved_leaves  DECIMAL(4,1) DEFAULT 0,
  lwp_days         DECIMAL(4,1) DEFAULT 0,
  paid_days        DECIMAL(4,1) DEFAULT 30,
  working_days     DECIMAL(4,1) DEFAULT 0,
  -- Salary
  calculated_salary DECIMAL(10,2),
  nsa_amount       DECIMAL(10,2) DEFAULT 0,
  meal_allowance   DECIMAL(10,2) DEFAULT 0,
  arrears          DECIMAL(10,2) DEFAULT 0,
  bonus            DECIMAL(10,2) DEFAULT 0,
  advance_deduction DECIMAL(10,2) DEFAULT 0,
  manual_adjustment DECIMAL(10,2) DEFAULT 0,
  net_pay          DECIMAL(10,2),
  -- Meta
  status           VARCHAR(20) DEFAULT 'draft',  -- draft, finalized, paid
  notes            TEXT,
  finalized_by     VARCHAR(100),
  finalized_at     TIMESTAMP,
  created_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- NSA / NIGHT SHIFT LOG
CREATE TABLE IF NOT EXISTS nsa_log (
  id           SERIAL PRIMARY KEY,
  employee_id  VARCHAR(10) REFERENCES employees(id),
  date         DATE NOT NULL,
  login_time   TIME,
  logout_time  TIME,
  after_midnight BOOLEAN DEFAULT FALSE,
  total_hours  DECIMAL(4,2),
  amount       DECIMAL(8,2),
  month        INT,
  year         INT,
  notes        TEXT
);

-- SALARY HISTORY (audit trail)
CREATE TABLE IF NOT EXISTS salary_history (
  id           SERIAL PRIMARY KEY,
  employee_id  VARCHAR(10) REFERENCES employees(id),
  old_salary   DECIMAL(10,2),
  new_salary   DECIMAL(10,2),
  effective_from DATE NOT NULL,
  reason       TEXT,
  changed_by   VARCHAR(100),
  changed_at   TIMESTAMP DEFAULT NOW()
);

-- AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
  id           SERIAL PRIMARY KEY,
  table_name   VARCHAR(50),
  record_id    VARCHAR(50),
  action       VARCHAR(20),  -- INSERT, UPDATE, DELETE
  old_value    JSONB,
  new_value    JSONB,
  performed_by VARCHAR(100),
  performed_at TIMESTAMP DEFAULT NOW()
);
