require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const sheetConfig = {
  tapeline: '14P-A70WDKX3yBEo6dHlJ-JNf5ED0_BUt_PTl-Ly132A',
  rolldown: '1UPnnZkUEds0tZT4r0f6NDDu4DSV4L6txyJpOV_29gmE',
  liner: '1fzieAQ5pZGanlZTs26K6oyd9ZEmjUqFIZB0yLsDIxG4',
  printing: '1yAKfrU32cFEQOhqzBNeST2qB352dSwVxI3tBLXtjmrY',
  lamination: '10VxRFybwvLApMVX9n0Vu5N0xRjLoLLSiNzn_zB6vTB8',
  bcs: '1SkGQbq-6IMXV4GbcA7StSt3hbxar3ljfNfqWMXsuxCs',
  baling: '1EKUA_GyXkQDI3OQTPPueecrZ0knaUa_3710WQyPZxUg'
};

async function saveConfig() {
  console.log("Saving sheet config to Supabase...");
  const { data, error } = await supabase.from('app_settings').upsert({
    key: 'sheet_config',
    value: sheetConfig
  });
  
  if (error) {
    console.error("Failed to save:", error);
  } else {
    console.log("Successfully saved sheet config!");
  }
}

saveConfig();
