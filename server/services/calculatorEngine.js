const RM_PRICES = {
  PP: 95.50, Filler: 35.00, MB: 164.17, Modifier: 49.50, UV: 224.00, LD: 103.00, RP: 50.00,
  LLDPE: 94.00, LinerFiller: 37.50, LDPELiner: 118.00, Desicant: 90.00, TPT: 54.00,
  LAMPP: 112.25, LAMFiller: 37.10, LAMLDPE: 137.25,
  BOPPFilm: 420.00, Sterio: 3000.00, Paint: 215.00,
  Handle: 190.00, Hemming: 55.00, BCS: 40.00
};

const PRODUCTION_TYPES = {
  "Type A": { opex_per_bag: 153.88, quote_selection: 40 },
  "Type B": { opex_per_bag: 173.58, quote_selection: 37 },
  "Type C": { opex_per_bag: 159.97, quote_selection: 30 },
  "Type D": { opex_per_bag: 148.66, quote_selection: 26 },
  "Type E": { opex_per_bag: 96.52,  quote_selection: 16 },
  "Type F": { opex_per_bag: 162.24, quote_selection: 33 },
  "Type G": { opex_per_bag: 141.87, quote_selection: 36 }
};

const STITCHING_TYPES = {
  "Double Fold Double Stitch (DFDS)": { bottom: 1.2, top: 1.5, threadUsage: 1.3 },
  "Single Fold Single Stitch (SFSS)": { bottom: 1.2, top: 1.0, threadUsage: 1.0 },
  "Folded and Stitched (Top Hemming)": { bottom: 0, top: 1.5, threadUsage: 1.5 },
  "None": { bottom: 0, top: 0, threadUsage: 0 }
};

exports.calculate = (inputs) => {
  const {
    bagWidth = 0, bagLength = 0, bagWeight = 0, mesh = "10 X 10", quantity = 1,
    linerRequired = false, linerWeight = 0, bagType = "Non-Lamination", printingColors = 0,
    topStitching = "None", bottomStitching = "None", productionTypeCode = "Type E",
    ppPct = 0, fillerPct = 0, mbPct = 0, modifierPct = 0, uvPct = 0, ldPct = 0, rpPct = 0,
    lldpePct = 0, fillerLinerPct = 0, ldpeLinerPct = 0, decedentPct = 0, tptPct = 0,
    lamPpPct = 0, lamFillerPct = 0, lamLdpePct = 0.40, boppGsm = 2.20,
    profitTarget = 0, dispatchKm = 0, handlePct = 0
  } = inputs;

  // Step 1: Bag Cut Size
  const bagCutWidth = Number(bagWidth) + 0.1;
  const topS = STITCHING_TYPES[topStitching] || { top: 0, threadUsage: 0 };
  const botS = STITCHING_TYPES[bottomStitching] || { bottom: 0, threadUsage: 0 };
  const bagCutLength = Number(bagLength) + botS.bottom + topS.top + 0.5;

  const bagCutWidth_cm = bagCutWidth * 2.54;
  const bagCutLength_cm = bagCutLength * 2.54;

  // Step 7: Lamination Weight (needed for fabric weight if lam)
  let lamWeight_g = 0;
  if (bagType.includes('Lamination') || bagType.includes('BOPP')) {
    const lamArea_sqm = (bagCutWidth_cm * bagCutLength_cm) / 10000;
    lamWeight_g = lamArea_sqm * Number(boppGsm);
  }

  // Step 11 & 12 preview
  let boppWeight_g = bagType.includes('BOPP') ? lamWeight_g : 0;
  let handleWeight_g = Number(bagWeight) * Number(handlePct);
  const threadUsage = topS.threadUsage + botS.threadUsage;

  // Step 2: Fabric Weight
  const fabricWeight_g = Number(bagWeight) - (linerRequired ? Number(linerWeight) : 0) - lamWeight_g - boppWeight_g - handleWeight_g;

  // Step 3: Fabric GSM / Denier
  const gsm = fabricWeight_g / ((bagCutWidth_cm / 100) * (bagCutLength_cm / 100)) || 0;
  const meshThreadsPerInch = parseInt(String(mesh).split('X')[0].trim()) || 10;
  const gpm = fabricWeight_g / (bagCutWidth * bagCutLength / 144) || 0;
  const denier = (gpm * 9000) / (meshThreadsPerInch * 2 * 39.37) || 0;

  // Step 4: Fabric Meters
  const fabricMetersPerBag = bagCutLength / 39.37;
  const totalFabricMeters = fabricMetersPerBag * Number(quantity);
  const totalFabricKg = (fabricWeight_g / 1000) * Number(quantity);

  // Step 5: Bag Composition (grams)
  const pp_g = fabricWeight_g * Number(ppPct);
  const filler_g = fabricWeight_g * Number(fillerPct);
  const mb_g = fabricWeight_g * Number(mbPct);
  const modifier_g = fabricWeight_g * Number(modifierPct);
  const uv_g = fabricWeight_g * Number(uvPct);
  const ld_g = fabricWeight_g * Number(ldPct);
  const rp_g = fabricWeight_g * Number(rpPct);

  // Step 6: Liner Composition
  const lldpe_g = linerRequired ? Number(linerWeight) * Number(lldpePct) : 0;
  const fillerLiner_g = linerRequired ? Number(linerWeight) * Number(fillerLinerPct) : 0;
  const ldpeLiner_g = linerRequired ? Number(linerWeight) * Number(ldpeLinerPct) : 0;
  const decedent_g = linerRequired ? Number(linerWeight) * Number(decedentPct) : 0;
  const tpt_g = linerRequired ? Number(linerWeight) * Number(tptPct) : 0;

  // Step 7: Lamination Composition
  const lamPP_g = lamWeight_g * Number(lamPpPct);
  const lamFiller_g = lamWeight_g * Number(lamFillerPct);
  const lamLdpe_g = lamWeight_g * Number(lamLdpePct);

  // Step 8: Bag RM Cost
  const bagRmCost = (pp_g/1000)*RM_PRICES.PP + (filler_g/1000)*RM_PRICES.Filler + (mb_g/1000)*RM_PRICES.MB +
                    (modifier_g/1000)*RM_PRICES.Modifier + (uv_g/1000)*RM_PRICES.UV + (ld_g/1000)*RM_PRICES.LD +
                    (rp_g/1000)*RM_PRICES.RP;

  // Step 9: Liner RM Cost
  const linerRmCost = (lldpe_g/1000)*RM_PRICES.LLDPE + (fillerLiner_g/1000)*RM_PRICES.LinerFiller +
                      (ldpeLiner_g/1000)*RM_PRICES.LDPELiner + (decedent_g/1000)*RM_PRICES.Desicant +
                      (tpt_g/1000)*RM_PRICES.TPT;

  // Step 10: Lam RM Cost
  const lamRmCost = (lamPP_g/1000)*RM_PRICES.LAMPP + (lamFiller_g/1000)*RM_PRICES.LAMFiller + (lamLdpe_g/1000)*RM_PRICES.LAMLDPE;

  // Step 11: BOPP Cost
  const boppFilmCost = (boppWeight_g/1000) * RM_PRICES.BOPPFilm;
  const cylinderCost = Number(quantity) > 0 ? (RM_PRICES.Sterio * Number(printingColors)) / Number(quantity) : 0;
  const inkCostPerBag = Number(quantity) > 0 ? (RM_PRICES.Paint * Number(printingColors)) / Number(quantity) : 0;
  const boppRmCost = boppFilmCost + cylinderCost + inkCostPerBag;

  // Step 12: Handle + Yarn
  const handleCost = (handleWeight_g/1000) * RM_PRICES.Handle;
  const yarnCost = threadUsage * (RM_PRICES.Hemming/1000); 
  const handleYarnCost = handleCost + yarnCost;

  // Step 13: COGS
  const cogs = bagRmCost + linerRmCost + lamRmCost + boppRmCost + handleYarnCost;

  // Step 14: OPEX
  const prodTypeInfo = PRODUCTION_TYPES[productionTypeCode] || PRODUCTION_TYPES["Type E"];
  const opex = prodTypeInfo.opex_per_bag;

  // Step 15: Production Cost
  const productionCost = cogs + opex;
  const productionCostWastage = productionCost * 1.05;

  // Step 16: Min/Max
  const quoteSelection = prodTypeInfo.quote_selection;
  const minQuote = productionCostWastage * (1 + (quoteSelection - 5) / 100);
  const maxQuote = productionCostWastage * (1 + (quoteSelection + 5) / 100);

  // Step 17: Transport
  const transportCostPerBag = Number(quantity) > 0 ? (Number(dispatchKm) * 40.70) / Number(quantity) : 0;

  // Step 18: Pricing
  const selectedRate = productionCostWastage * (1 + Number(profitTarget) / 100) + transportCostPerBag;
  const finalAmount = selectedRate * Number(quantity);
  const gstAmount = finalAmount * 0.18;
  const grossPayable = finalAmount + gstAmount;

  return {
    fabricWeight_g: parseFloat(fabricWeight_g.toFixed(2)),
    bagCutWidth: parseFloat(bagCutWidth.toFixed(2)),
    bagCutLength: parseFloat(bagCutLength.toFixed(2)),
    gsm: parseFloat(gsm.toFixed(2)),
    denier: parseFloat(denier.toFixed(2)),
    gpm: parseFloat(gpm.toFixed(2)),
    totalFabricMeters: parseFloat(totalFabricMeters.toFixed(2)),
    totalFabricKg: parseFloat(totalFabricKg.toFixed(2)),
    pp_g: parseFloat(pp_g.toFixed(2)),
    filler_g: parseFloat(filler_g.toFixed(2)),
    mb_g: parseFloat(mb_g.toFixed(2)),
    bagRmCost: parseFloat(bagRmCost.toFixed(2)),
    linerRmCost: parseFloat(linerRmCost.toFixed(2)),
    lamRmCost: parseFloat(lamRmCost.toFixed(2)),
    boppRmCost: parseFloat(boppRmCost.toFixed(2)),
    cogs: parseFloat(cogs.toFixed(2)),
    opex: parseFloat(opex.toFixed(2)),
    productionCost: parseFloat(productionCost.toFixed(2)),
    productionCostWastage: parseFloat(productionCostWastage.toFixed(2)),
    minQuote: parseFloat(minQuote.toFixed(2)),
    maxQuote: parseFloat(maxQuote.toFixed(2)),
    transportCostPerBag: parseFloat(transportCostPerBag.toFixed(2)),
    selectedRate: parseFloat(selectedRate.toFixed(2)),
    finalAmount: parseFloat(finalAmount.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    grossPayable: parseFloat(grossPayable.toFixed(2))
  };
};
