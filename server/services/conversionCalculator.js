exports.calculateTapelineFields = (input) => {
  const { total_input_kg, pp_pct = 0, filler_pct = 0, mb_pct = 0,
          modifier_pct = 0, ldpe_pct = 0, uv_pct = 0, rp_pct = 0,
          starting_wastage_kg = 0, running_wastage_kg = 0 } = input;

  const total_pct = [pp_pct, filler_pct, mb_pct, modifier_pct, ldpe_pct, uv_pct, rp_pct]
    .reduce((a, b) => a + parseFloat(b || 0), 0);

  if (Math.abs(total_pct - 100) > 0.01) {
    throw new Error(`Total % must equal 100. Current: ${total_pct}`);
  }

  const calc = (pct) => parseFloat(((total_input_kg * pct) / 100).toFixed(3));

  return {
    pp_kg: calc(pp_pct),
    filler_kg: calc(filler_pct),
    mb_kg: calc(mb_pct),
    modifier_kg: calc(modifier_pct),
    ldpe_kg: calc(ldpe_pct),
    uv_kg: calc(uv_pct),
    rp_kg: calc(rp_pct),
    total_wastage_kg: parseFloat(starting_wastage_kg) + parseFloat(running_wastage_kg)
  };
};

exports.calculateRolldownFields = (input, bagMaster, labourRatePerMeter) => {
  const { roll_fabric_mtrs, roll_net_wt_kg } = input;
  return {
    actual_meter_wt_g: parseFloat(((roll_net_wt_kg * 1000) / roll_fabric_mtrs).toFixed(4)),
    req_meter_wt_g: bagMaster.meter_weight_g,
    labour_cost: parseFloat((roll_fabric_mtrs * labourRatePerMeter).toFixed(2))
  };
};

exports.calculateBCSFields = (input, bagMaster) => {
  const {
    bags_produced_nos, bcs_wastage_nos = 0, loom_damaged_nos = 0,
    print_bopp_damaged_nos = 0, blade_cut_damaged_nos = 0
  } = input;

  const final_wastage = bcs_wastage_nos + loom_damaged_nos +
                        print_bopp_damaged_nos + blade_cut_damaged_nos;
  const finalised_bags = bags_produced_nos - final_wastage;
  const total_weight_kg = parseFloat((finalised_bags * bagMaster.total_bag_weight_g / 1000).toFixed(3));
  const total_mtrs = parseFloat((finalised_bags * bagMaster.cut_length_inch / 39.37).toFixed(3));

  return { final_wastage_nos: final_wastage, finalised_bags_nos: finalised_bags,
           total_weight_kg, total_mtrs };
};

exports.calculateBalingFields = (input, bagMaster, contractorRatePerBag) => {
  const { finished_bags_nos } = input;
  const total_mtrs = parseFloat((finished_bags_nos * bagMaster.cut_length_inch / 39.37).toFixed(3));
  const contractor_bill = parseFloat((finished_bags_nos * contractorRatePerBag).toFixed(2));
  
  return { 
    total_mtrs, 
    contractor_bill, 
    bis_flag: bagMaster.bis_flag, // Need to handle depending on actual master data structure
    bag_weight_g: bagMaster.total_bag_weight_g, 
    cut_length_inch: bagMaster.cut_length_inch 
  };
};
