const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const conversionCalculator = require('../services/conversionCalculator');
const batchCodeGenerator = require('../services/batchCodeGenerator');
const gsheetsService = require('../services/gsheetsService');

// Dummy validateBody, actual zod schema should be in schemas
const validateBody = require('../middleware/validateBody');
const { z } = require('zod');

const TapelineSchema = z.object({
  entry_date: z.string().min(1),
  entry_time: z.string().optional(),
  shift: z.enum(['A', 'B']),
  month: z.string().min(1),
  client_code: z.string().optional(),
  client_id: z.string().uuid().optional(),
  item_code_sfg: z.string().optional(),
  thread_color: z.string().optional(),
  operator_name: z.string().optional(),
  pp_pct: z.number().min(0).max(100).optional(),
  filler_pct: z.number().min(0).max(100).optional(),
  mb_pct: z.number().min(0).max(100).optional(),
  modifier_pct: z.number().min(0).max(100).optional(),
  ldpe_pct: z.number().min(0).max(100).optional(),
  uv_pct: z.number().min(0).max(100).optional(),
  rp_pct: z.number().min(0).max(100).optional(),
  total_input_kg: z.number().min(0.001),
  starting_wastage_kg: z.number().min(0).optional(),
  running_wastage_kg: z.number().min(0).optional(),
  pp_invoice_id: z.string().uuid().optional(),
  tester_name: z.string().optional(),
  remarks: z.string().optional(),
  no_production: z.boolean().optional()
});

const getNextSequenceNo = async (type, date) => {
  // Simplistic implementation, would need better sequence logic for concurrent reqs
  const { count } = await supabase
    .from('tapeline_entries')
    .select('*', { count: 'exact', head: true })
    .eq('entry_date', date);
  return (count || 0) + 1;
};

router.post('/', validateBody(TapelineSchema), async (req, res) => {
  try {
    const { body, user } = req;

    if (body.no_production) {
      const { data: entry, error } = await supabase
        .from('tapeline_entries')
        .insert({ ...body, created_by: user.id })
        .select().single();
      if (error) throw error;
      return res.status(201).json({ success: true, data: entry });
    }

    // 1. Run calculations
    const calculated = conversionCalculator.calculateTapelineFields(body);

    // 2. Fetch PP invoice
    let invoiceNo = 'NO-INV';
    if (body.pp_invoice_id) {
      const { data: invoice } = await supabase
        .from('pp_purchases').select('invoice_no').eq('id', body.pp_invoice_id).single();
      if (invoice) invoiceNo = invoice.invoice_no;
    }

    // 3. Generate TP Code + Batch No
    const seqNo = await getNextSequenceNo('tapeline', body.entry_date);
    const tp_code = batchCodeGenerator.generateTPCode(body, invoiceNo, seqNo);
    const batch_no = batchCodeGenerator.generateBatchNo(body, invoiceNo, seqNo);

    // 4. Insert into Supabase
    const { data: entry, error } = await supabase
      .from('tapeline_entries')
      .insert({ ...body, ...calculated, tp_code, batch_no, created_by: user.id })
      .select().single();
    if (error) throw error;

    // 5. Async Google Sheets sync (non-blocking)
    gsheetsService.appendTapelineRow(entry).catch(err => {
      console.error('GSheets sync failed for Tapeline:', err);
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { month, page = 1, limit = 50 } = req.query;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = supabase.from('tapeline_entries').select('*', { count: 'exact' });
  if (month) query = query.eq('month', month);

  const { data, count, error } = await query.order('created_at', { ascending: false }).range(start, end);
  
  if (error) return res.status(400).json({ success: false, error: error.message });
  res.json({ success: true, data, count });
});

router.get('/summary', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ success: false, error: 'date query param is required' });

  const { data, error } = await supabase
    .from('tapeline_entries')
    .select('total_input_kg, total_wastage_kg')
    .eq('entry_date', date);

  if (error) return res.status(400).json({ success: false, error: error.message });

  const summary = data.reduce((acc, curr) => {
    acc.total_input_kg += Number(curr.total_input_kg || 0);
    acc.total_wastage_kg += Number(curr.total_wastage_kg || 0);
    return acc;
  }, { total_input_kg: 0, total_wastage_kg: 0 });

  res.json({ success: true, data: summary });
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('tapeline_entries')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  if (error) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data });
});

module.exports = router;
