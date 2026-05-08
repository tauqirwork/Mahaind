// Client-side calculations for real-time form updates
export const calculateTapelineFields = (values) => {
  const total_input_kg = parseFloat(values.total_input_kg) || 0;
  const pp_pct = parseFloat(values.pp_pct) || 0;
  const filler_pct = parseFloat(values.filler_pct) || 0;
  const mb_pct = parseFloat(values.mb_pct) || 0;
  const modifier_pct = parseFloat(values.modifier_pct) || 0;
  const ldpe_pct = parseFloat(values.ldpe_pct) || 0;
  const uv_pct = parseFloat(values.uv_pct) || 0;
  const rp_pct = parseFloat(values.rp_pct) || 0;
  const starting_wastage_kg = parseFloat(values.starting_wastage_kg) || 0;
  const running_wastage_kg = parseFloat(values.running_wastage_kg) || 0;

  const total_pct = pp_pct + filler_pct + mb_pct + modifier_pct + ldpe_pct + uv_pct + rp_pct;

  const calc = (pct) => parseFloat(((total_input_kg * pct) / 100).toFixed(3));

  return {
    pp_kg: calc(pp_pct),
    filler_kg: calc(filler_pct),
    mb_kg: calc(mb_pct),
    modifier_kg: calc(modifier_pct),
    ldpe_kg: calc(ldpe_pct),
    uv_kg: calc(uv_pct),
    rp_kg: calc(rp_pct),
    total_pct: parseFloat(total_pct.toFixed(2)),
    total_wastage_kg: parseFloat((starting_wastage_kg + running_wastage_kg).toFixed(3)),
    isTotalPctValid: Math.abs(total_pct - 100) <= 0.01
  };
};

export const calculateRolldownFields = (values, bagMaster, labourRatePerMeter) => {
  const roll_fabric_mtrs = parseFloat(values.roll_fabric_mtrs) || 0;
  const roll_net_wt_kg = parseFloat(values.roll_net_wt_kg) || 0;
  
  return {
    actual_meter_wt_g: roll_fabric_mtrs > 0 ? parseFloat(((roll_net_wt_kg * 1000) / roll_fabric_mtrs).toFixed(4)) : 0,
    req_meter_wt_g: bagMaster?.meter_weight_g || 0,
    labour_cost: parseFloat((roll_fabric_mtrs * (labourRatePerMeter || 0)).toFixed(2))
  };
};

export const calculateBCSFields = (values, bagMaster) => {
  const bags_produced_nos = parseFloat(values.bags_produced_nos) || 0;
  const bcs_wastage_nos = parseFloat(values.bcs_wastage_nos) || 0;
  const loom_damaged_nos = parseFloat(values.loom_damaged_nos) || 0;
  const print_bopp_damaged_nos = parseFloat(values.print_bopp_damaged_nos) || 0;
  const blade_cut_damaged_nos = parseFloat(values.blade_cut_damaged_nos) || 0;

  const final_wastage_nos = bcs_wastage_nos + loom_damaged_nos + print_bopp_damaged_nos + blade_cut_damaged_nos;
  const finalised_bags_nos = bags_produced_nos - final_wastage_nos;
  
  const bag_weight_g = bagMaster?.total_bag_weight_g || 0;
  const cut_length_inch = bagMaster?.cut_length_inch || 0;

  const total_weight_kg = parseFloat((finalised_bags_nos * bag_weight_g / 1000).toFixed(3));
  const total_mtrs = parseFloat((finalised_bags_nos * cut_length_inch / 39.37).toFixed(3));

  return { 
    final_wastage_nos, 
    finalised_bags_nos,
    total_weight_kg, 
    total_mtrs 
  };
};

export const calculateBalingFields = (values, bagMaster, contractorRatePerBag) => {
  const finished_bags_nos = parseFloat(values.finished_bags_nos) || 0;
  const cut_length_inch = bagMaster?.cut_length_inch || 0;

  const total_mtrs = parseFloat((finished_bags_nos * cut_length_inch / 39.37).toFixed(3));
  const contractor_bill = parseFloat((finished_bags_nos * (contractorRatePerBag || 0)).toFixed(2));
  
  return { 
    total_mtrs, 
    contractor_bill, 
    bis_flag: bagMaster?.bis_flag || 'N/A',
    bag_weight_g: bagMaster?.total_bag_weight_g || 0, 
    cut_length_inch 
  };
};
