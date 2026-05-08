-- MASTER REFERENCE TABLE
CREATE TABLE bag_master (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code_fg      VARCHAR(30) UNIQUE NOT NULL,
  item_code_sfg     VARCHAR(30),
  client_id         UUID REFERENCES clients(id),
  bag_description   TEXT NOT NULL,
  fabric_type       TEXT,
  unit              VARCHAR(10) DEFAULT 'NOS',
  width_inch        NUMERIC(6,2),
  length_inch       NUMERIC(6,2),
  cut_length_inch   NUMERIC(6,2),
  denier            NUMERIC(8,2),
  tape_width_mm     NUMERIC(6,2),
  mesh              NUMERIC(6,2),
  meter_weight_g    NUMERIC(8,4),
  cut_length_fabric_weight_g NUMERIC(8,4),
  total_bag_weight_g NUMERIC(8,4),
  pp_pct            NUMERIC(6,4), filler_pct NUMERIC(6,4),
  mb_pct            NUMERIC(6,4), modifier_pct NUMERIC(6,4),
  ld_pct            NUMERIC(6,4), uv_pct NUMERIC(6,4),
  rp_pct            NUMERIC(6,4),
  bopp_sides        VARCHAR(10), bopp_film_g NUMERIC(8,4),
  lam_sides         VARCHAR(10), lamination_g NUMERIC(8,4),
  lam_pp_pct        NUMERIC(6,4), lam_filler_pct NUMERIC(6,4),
  lam_ld_pct        NUMERIC(6,4), lam_uv_pct NUMERIC(6,4),
  liner_type        VARCHAR(50), liner_g NUMERIC(8,4),
  liner_width_mm    NUMERIC(8,4), liner_length_mm NUMERIC(8,4),
  liner_lldpe_pct   NUMERIC(6,4), liner_filler_pct NUMERIC(6,4),
  liner_tpt_pct     NUMERIC(6,4), liner_ldpe_pct NUMERIC(6,4),
  liner_rp_pct      NUMERIC(6,4),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  is_active         BOOLEAN DEFAULT TRUE
);

-- PP TRACEABILITY (Purchase)
CREATE TABLE pp_purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_date   DATE NOT NULL,
  supplier        TEXT NOT NULL,
  grade           TEXT NOT NULL,
  invoice_no      VARCHAR(60) UNIQUE NOT NULL,
  supplier_invoice_no VARCHAR(60),
  qty_kg          NUMERIC(10,3),
  rate            NUMERIC(10,2),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 01 TAPELINE RM ENTRIES
CREATE TABLE tapeline_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month           VARCHAR(10) NOT NULL,
  entry_date      DATE NOT NULL,
  entry_time      TIME,
  client_code     VARCHAR(20),
  client_id       UUID REFERENCES clients(id),
  item_code_sfg   VARCHAR(30),
  thread_color    TEXT,
  shift           CHAR(1),
  operator_name   TEXT,
  pp_pct          NUMERIC(6,3) DEFAULT 0,
  filler_pct      NUMERIC(6,3) DEFAULT 0,
  mb_pct          NUMERIC(6,3) DEFAULT 0,
  modifier_pct    NUMERIC(6,3) DEFAULT 0,
  ldpe_pct        NUMERIC(6,3) DEFAULT 0,
  uv_pct          NUMERIC(6,3) DEFAULT 0,
  rp_pct          NUMERIC(6,3) DEFAULT 0,
  total_input_kg  NUMERIC(10,3) NOT NULL,
  pp_kg           NUMERIC(10,3),
  filler_kg       NUMERIC(10,3),
  mb_kg           NUMERIC(10,3),
  modifier_kg     NUMERIC(10,3),
  ldpe_kg         NUMERIC(10,3),
  uv_kg           NUMERIC(10,3),
  rp_kg           NUMERIC(10,3),
  starting_wastage_kg  NUMERIC(10,3) DEFAULT 0,
  running_wastage_kg   NUMERIC(10,3) DEFAULT 0,
  total_wastage_kg     NUMERIC(10,3),
  pp_invoice_id   UUID REFERENCES pp_purchases(id),
  tester_name     TEXT,
  batch_no        TEXT,
  tp_code         TEXT,
  remarks         TEXT,
  no_production   BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  gsheet_row      INTEGER
);

-- 02 ROLL DOWN ENTRIES
CREATE TABLE rolldown_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tapeline_id     UUID REFERENCES tapeline_entries(id),
  tp_code         TEXT,
  batch_no        TEXT,
  week            VARCHAR(5),
  month           VARCHAR(10),
  entry_date      DATE NOT NULL,
  item_code_sfg   VARCHAR(30),
  client_id       UUID REFERENCES clients(id),
  fabric_description TEXT,
  fabric_width_inch NUMERIC(6,2),
  fabric_color    TEXT,
  mesh            NUMERIC(6,2),
  loom_no         INTEGER,
  shift           CHAR(1),
  roll_no         VARCHAR(20),
  bobbin_input_kg NUMERIC(10,3),
  roll_fabric_mtrs NUMERIC(10,3),
  roll_net_wt_kg  NUMERIC(10,3),
  labour_cost     NUMERIC(10,2),
  actual_meter_wt_g NUMERIC(10,4),
  req_meter_wt_g  NUMERIC(10,4),
  loom_wastage_kg NUMERIC(10,3),
  remarks         TEXT,
  qc_name         TEXT,
  issue_date      DATE,
  issue_to        VARCHAR(20),
  status          VARCHAR(20),
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  gsheet_row      INTEGER
);

-- 03 LINER RM ENTRIES
CREATE TABLE liner_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_no        TEXT,
  month           VARCHAR(10),
  entry_date      DATE NOT NULL,
  entry_time      TIME,
  client_code     VARCHAR(20),
  item_code_sfg   VARCHAR(30),
  client_id       UUID REFERENCES clients(id),
  liner_description TEXT,
  shift           CHAR(1),
  operator_name   TEXT,
  machine_no      INTEGER,
  bis_flag        VARCHAR(10),
  liner_color     TEXT,
  meter_weight_g  NUMERIC(8,4),
  width_inch      VARCHAR(10),
  length_inch     VARCHAR(10),
  liner_cut_weight_g NUMERIC(10,4),
  lldpe_kg        NUMERIC(10,3),
  filler_kandui_kg NUMERIC(10,3),
  kandui_mouser_kg NUMERIC(10,3),
  rp_kg           NUMERIC(10,3),
  mb04_kg         NUMERIC(10,3),
  ldpe_kg         NUMERIC(10,3),
  tpt_kg          NUMERIC(10,3),
  liner_wastage_kg NUMERIC(10,3),
  total_kg        NUMERIC(10,3),
  remarks         TEXT,
  tester_name     TEXT,
  no_production   BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  gsheet_row      INTEGER
);

-- 04 PRINTING ENTRIES
CREATE TABLE printing_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_no        TEXT,
  month           VARCHAR(10),
  entry_date      DATE NOT NULL,
  entry_time      TIME,
  item_code_sfg   VARCHAR(30),
  client_id       UUID REFERENCES clients(id),
  bag_description TEXT,
  fabric_description TEXT,
  shift           CHAR(1),
  machine_name    TEXT,
  operator_name   TEXT,
  roll_no         VARCHAR(20),
  rolldown_id     UUID REFERENCES rolldown_entries(id),
  printed_fabric_mtrs NUMERIC(10,3),
  net_weight_kg   NUMERIC(10,3),
  average_g_per_m NUMERIC(10,4),
  printing_wastage_bags_nos INTEGER DEFAULT 0,
  ink_wastage_kg  NUMERIC(10,3) DEFAULT 0,
  reducer_wastage_kg NUMERIC(10,3) DEFAULT 0,
  test_printing_bags_nos INTEGER DEFAULT 0,
  final_print_fabric_mtrs NUMERIC(10,3),
  remarks         TEXT,
  qc_name         TEXT,
  issue_date      DATE,
  issue_to_bcs_machine INTEGER,
  contractor_bill NUMERIC(10,2),
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  gsheet_row      INTEGER
);

-- 05 BOPP / LAMINATION ENTRIES
CREATE TABLE bopp_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month           VARCHAR(10),
  entry_date      DATE NOT NULL,
  entry_time      TIME,
  item_code_sfg   VARCHAR(30),
  client_id       UUID REFERENCES clients(id),
  bag_description TEXT,
  fabric_description TEXT,
  shift           CHAR(1),
  operator_name   TEXT,
  contractor_name TEXT,
  bcs_machine_no  INTEGER,
  roll_no         VARCHAR(20),
  fabric_input_mtrs NUMERIC(10,3),
  bags_produced_nos INTEGER,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  gsheet_row      INTEGER
);

-- 06 BCS (BAG CUTTING & STITCHING) ENTRIES
CREATE TABLE bcs_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_no        TEXT,
  week            VARCHAR(5),
  month           VARCHAR(10),
  entry_date      DATE NOT NULL,
  entry_time      TIME,
  client_code     VARCHAR(20),
  item_code_sfg   VARCHAR(30),
  client_id       UUID REFERENCES clients(id),
  bag_description TEXT,
  fabric_description TEXT,
  shift           CHAR(1),
  operator_name   TEXT,
  contractor_name TEXT,
  bcs_machine_no  INTEGER,
  roll_no         VARCHAR(20),
  bopp_entry_id   UUID REFERENCES bopp_entries(id),
  printing_entry_id UUID REFERENCES printing_entries(id),
  fabric_input_mtrs NUMERIC(10,3),
  bags_produced_nos INTEGER,
  bag_weight_g    NUMERIC(10,4),
  bcs_wastage_nos NUMERIC(10,3) DEFAULT 0,
  loom_damaged_nos NUMERIC(10,3) DEFAULT 0,
  print_bopp_damaged_nos NUMERIC(10,3) DEFAULT 0,
  blade_cut_damaged_nos NUMERIC(10,3) DEFAULT 0,
  repairable_bags_nos NUMERIC(10,3) DEFAULT 0,
  final_wastage_nos NUMERIC(10,3),
  finalised_bags_nos NUMERIC(10,3),
  total_weight_kg NUMERIC(10,3),
  cut_length_inch NUMERIC(6,2),
  total_mtrs      NUMERIC(10,3),
  contractor_bill NUMERIC(10,2),
  remarks         TEXT,
  tester_name     TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  gsheet_row      INTEGER
);

-- 07 BALING / MANUAL STITCHING ENTRIES
CREATE TABLE baling_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_no        TEXT,
  month           VARCHAR(10),
  entry_date      DATE NOT NULL,
  entry_time      TIME,
  client_id       UUID REFERENCES clients(id),
  bag_description TEXT,
  fabric_description TEXT,
  shift           CHAR(1),
  machine_no      INTEGER,
  tailor_name     TEXT,
  contractor_name TEXT,
  tester_name     TEXT,
  finished_bags_nos INTEGER,
  chain_waste_kg  NUMERIC(10,3),
  damaged_bags_nos INTEGER DEFAULT 0,
  remarks         TEXT,
  bag_weight_g    NUMERIC(10,4),
  cut_length_inch NUMERIC(6,2),
  total_mtrs      NUMERIC(10,3),
  bis_flag        VARCHAR(15),
  contractor_bill NUMERIC(10,2),
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  gsheet_row      INTEGER
);

-- GOOGLE SHEETS SYNC LOG
CREATE TABLE gsheet_sync_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name      TEXT NOT NULL,
  record_id       UUID NOT NULL,
  sheet_name      TEXT NOT NULL,
  gsheet_row      INTEGER,
  operation       VARCHAR(10),
  status          VARCHAR(10),
  error_msg       TEXT,
  synced_at       TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSION SHEET CONFIG
CREATE TABLE conversion_sheet_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_label VARCHAR(10) NOT NULL,
  is_active   BOOLEAN DEFAULT FALSE,
  tapeline_sheet_id   TEXT,
  rolldown_sheet_id   TEXT,
  liner_sheet_id      TEXT,
  printing_sheet_id   TEXT,
  bopp_sheet_id       TEXT,
  bcs_sheet_id        TEXT,
  baling_sheet_id     TEXT,
  tapeline_sheet_name TEXT DEFAULT 'A. Tapeline RM',
  rolldown_sheet_name TEXT DEFAULT 'A. Roll Down',
  liner_sheet_name    TEXT DEFAULT 'A. Liner RM',
  printing_sheet_name TEXT DEFAULT 'A. Printing',
  bopp_sheet_name     TEXT DEFAULT 'BCS Data Pool',
  bcs_sheet_name      TEXT DEFAULT 'A. BCS (Bag Conversion Section)',
  baling_sheet_name   TEXT DEFAULT 'A.Manul Stitching',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE bag_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE pp_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tapeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rolldown_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE liner_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE printing_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bopp_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bcs_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE baling_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsheet_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_sheet_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON bag_master FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for quality and above" ON bag_master FOR INSERT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('quality_operator', 'supervisor', 'super_admin'))
);

CREATE POLICY "Enable read for authenticated users" ON pp_purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for quality and above" ON pp_purchases FOR INSERT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('quality_operator', 'supervisor', 'super_admin'))
);

CREATE POLICY "Enable read for authenticated users" ON tapeline_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for quality and above" ON tapeline_entries FOR INSERT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('quality_operator', 'supervisor', 'super_admin'))
);

-- Implement similar policies for other tables here
