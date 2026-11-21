// 100% Offline Core Analysis Engine for LabelLens
// Precision detection of Harmful Additives, High-Risk Fats, Refined Carbs & Clean Nutrients

import { E_NUMBERS } from '../database/eNumbers';
import { HIDDEN_SUGARS } from '../database/hiddenSugars';
import { ALLERGENS } from '../database/allergens';

export function normalizeText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ')
    .replace(/[;]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. Comprehensive High-Risk & Hazardous Ingredient Patterns
const HARMFUL_PATTERNS = [
  // Harmful Saturated Fats & Industrial Oils
  {
    pattern: /\b(?:palm\s*oil|palmolein|palm\s*fat|palm\s*kernel|fractionated\s*palm|elaeis\s*guineensis)\b/i,
    name: 'Palm Oil / Palmolein',
    code: 'Saturated Fat',
    severity: 'danger',
    riskLabel: 'High Saturated Fat',
    reason: 'Contains 44% palmitic acid. Strongly linked to arterial inflammation, elevated LDL cholesterol, and cardiovascular disease.',
    penalty: 25,
  },
  {
    pattern: /\b(?:trans\s*fat|partially\s*hydrogenated|hydrogenated\s*vegetable\s*oil|vanaspati|margarine|shortening)\b/i,
    name: 'Industrial Trans Fats',
    code: 'Banned Fat',
    severity: 'danger',
    riskLabel: 'Severe Heart Hazard',
    reason: 'Man-made trans fats directly clog coronary arteries and are a primary WHO-flagged cause of heart disease.',
    penalty: 35,
  },

  // Refined Stripped Flours
  {
    pattern: /\b(?:maida|refined\s*wheat\s*flour|bleached\s*flour|enriched\s*wheat\s*flour)\b/i,
    name: 'Refined Wheat Flour (Maida)',
    code: 'High GI Carb',
    severity: 'caution',
    riskLabel: 'Stripped Carbohydrate',
    reason: 'Completely stripped of natural bran and fiber. Causes rapid blood sugar spikes and promotes visceral fat accumulation.',
    penalty: 15,
  },

  // Disguised Sugars & Sweeteners
  {
    pattern: /\b(?:maltodextrin)\b/i,
    name: 'Maltodextrin',
    code: 'GI: 110',
    severity: 'danger',
    riskLabel: 'Disguised Fast Sugar',
    reason: 'Has a Glycemic Index of 110 (higher than pure table sugar). Causes extreme insulin surges and alters gut microbiome.',
    penalty: 20,
  },
  {
    pattern: /\b(?:high\s*fructose\s*corn\s*syrup|hfcs)\b/i,
    name: 'High Fructose Corn Syrup (HFCS)',
    code: 'GI: 87',
    severity: 'danger',
    riskLabel: 'Liver Fat Trigger',
    reason: 'Metabolized directly by the liver into triglycerides, accelerating non-alcoholic fatty liver disease (NAFLD).',
    penalty: 25,
  },
  {
    pattern: /\b(?:invert\s*sugar|invert\s*syrup|corn\s*syrup|glucose\s*syrup|dextrose|liquid\s*glucose)\b/i,
    name: 'Industrial Liquid Sugars',
    code: 'Hidden Sugar',
    severity: 'danger',
    riskLabel: 'Ultra-Processed Sugar',
    reason: 'Highly concentrated simple sugars added to induce craving cycles and promote metabolic dysfunction.',
    penalty: 18,
  },
  {
    pattern: /\b(?:sugar|sucrose|added\s*sugar)\b/i,
    name: 'Added Refined Sugar',
    code: 'Refined Sugar',
    severity: 'caution',
    riskLabel: 'Empty Calories',
    reason: 'High sucrose load accelerates glycemic volatility, dental decay, and inflammatory cellular pathways.',
    penalty: 12,
  },

  // Flavor Enhancers & Synthetic Chemicals
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:635|627|631)\b|\b(?:flavo?ur\s*enhancer\s*\(?ins\s*635)\b/i,
    name: 'Flavor Enhancer (INS 635 / 627 / 631)',
    code: 'INS 635',
    severity: 'danger',
    riskLabel: 'Synthetic Flavor Chem',
    reason: 'Disodium 5-ribonucleotides. Highly potent synthetic flavor enhancer linked to skin rashes, allergic irritation, and gout.',
    penalty: 22,
  },
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:621)\b|\b(?:monosodium\s*glutamate|msg)\b/i,
    name: 'Monosodium Glutamate (MSG / INS 621)',
    code: 'INS 621',
    severity: 'danger',
    riskLabel: 'Neuro-Excitotoxin',
    reason: 'Excitatory neurotransmitter trigger linked to headaches, chest tightness, sweating, and appetite dysregulation.',
    penalty: 20,
  },
  {
    pattern: /\b(?:hydrolysed\s*(?:vegetable|groundnut|soy|plant)\s*protein|yeast\s*extract)\b/i,
    name: 'Hydrolysed Protein (Hidden Glutamates)',
    code: 'Hidden MSG',
    severity: 'caution',
    riskLabel: 'Processed Flavoring',
    reason: 'Industrial chemically broken-down protein used as a substitute for MSG to enhance umami flavor artificially.',
    penalty: 12,
  },
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:150[a-d]?)\b|\b(?:caramel\s*colou?r)\b/i,
    name: 'Caramel Color IV (INS 150d)',
    code: 'INS 150d',
    severity: 'danger',
    riskLabel: 'Synthetic Chemical Dye',
    reason: 'Manufactured with ammonia and sulfites. Can contain 4-MEI (4-methylimidazole), an animal carcinogen concern.',
    penalty: 20,
  },
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:451(?:\(i\))?|452|450)\b|\b(?:humectant\s*\(?ins\s*451)\b/i,
    name: 'Polyphosphates (INS 451 / 452)',
    code: 'INS 451(i)',
    severity: 'danger',
    riskLabel: 'Industrial Phosphate',
    reason: 'Chemical humectant and moisture-locking agent. High dietary phosphate levels damage kidneys and disrupt bone calcium balance.',
    penalty: 18,
  },
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:500(?:\(i\))?|501(?:\(i\))?|508)\b/i,
    name: 'Acidity Regulators (INS 500 / 501 / 508)',
    code: 'INS 501/500',
    severity: 'caution',
    riskLabel: 'Synthetic Chemical Salt',
    reason: 'Potassium & Sodium carbonates used to alter dough pH and create artificial texture.',
    penalty: 10,
  },
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:412)\b|\b(?:guar\s*gum)\b/i,
    name: 'Guar Gum Thickener (INS 412)',
    code: 'INS 412',
    severity: 'caution',
    riskLabel: 'Industrial Thickener',
    reason: 'Extracted thickener used to artificially body low-quality broths. Can cause digestive gas and abdominal bloating.',
    penalty: 10,
  },
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:102|110|122|124|129|133)\b|\b(?:tartrazine|sunset\s*yellow|allura\s*red)\b/i,
    name: 'Synthetic Azo Dyes (E102 / E110 / E129)',
    code: 'Toxic Dye',
    severity: 'danger',
    riskLabel: 'Hyperactivity & Allergen',
    reason: 'Petroleum-derived synthetic colors proven to cause hyperactivity (ADHD) in children and trigger severe asthma.',
    penalty: 25,
  },
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:211|220|249|250)\b|\b(?:sodium\s*benzoate|sodium\s*nitrite)\b/i,
    name: 'Harsh Chemical Preservatives',
    code: 'Toxic Preservative',
    severity: 'danger',
    riskLabel: 'Cellular Toxin',
    reason: 'Chemical preservatives linked to formation of carcinogenic nitrosamines and benzene when paired with Vitamin C.',
    penalty: 25,
  },
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:319|320|321)\b|\b(?:tbhq|bha|bht|butylated\s*hydroxyanisole|butylated\s*hydroxytoluene)\b/i,
    name: 'Petroleum Preservatives (TBHQ / BHA / BHT)',
    code: 'Synthetic Antioxidant',
    severity: 'danger',
    riskLabel: 'Endocrine & Cell Toxin',
    reason: 'Synthetic petroleum-derived preservatives linked to hormonal imbalance, vision changes, and tumor risk in animal studies.',
    penalty: 25,
  },
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:407)\b|\b(?:carrageenan)\b/i,
    name: 'Carrageenan (INS 407)',
    code: 'INS 407',
    severity: 'danger',
    riskLabel: 'Gut Inflammatory',
    reason: 'Industrial seaweed extract proven in clinical trials to trigger chronic gut inflammation, ulceration, and IBS symptoms.',
    penalty: 20,
  },
  {
    pattern: /\b(?:ins|e)[\s\-_]?(?:950|951|954|955)\b|\b(?:aspartame|acesulfame\s*k?|sucralose|saccharin)\b/i,
    name: 'Artificial Sweeteners (Aspartame / Sucralose / Ace-K)',
    code: 'Synthetic Sweetener',
    severity: 'danger',
    riskLabel: 'Microbiome Disruptor',
    reason: 'Non-caloric chemical sweeteners linked to glucose intolerance, gut dysbiosis, and neurological headaches.',
    penalty: 22,
  },

  // Ultra-Processed Brand & Product Signatures (For front-of-pack or quick scans)
  {
    pattern: /\b(?:maggi|instant\s*noodles?|ramen|2-minute\s*noodles?)\b/i,
    name: 'Instant Fried Noodle Cake & Seasoning',
    code: 'Ultra-Processed',
    severity: 'danger',
    riskLabel: 'Deep-Fried Noodle',
    reason: 'Instant noodles are flash-fried in palm oil and packed with extreme sodium (1000mg/serving), refined maida, and synthetic flavor enhancers.',
    penalty: 35,
  },
  {
    pattern: /\b(?:potato\s*chips?|nachos?|doritos|kurkure|cheetos|pringles)\b/i,
    name: 'Deep Fried Extruded Snack',
    code: 'Ultra-Processed',
    severity: 'danger',
    riskLabel: 'Industrial Fried Snack',
    reason: 'Extruded high-heat fried in industrial palm/seed oils with excessive sodium and chemical flavoring.',
    penalty: 30,
  },
  {
    pattern: /\b(?:carbonated\s*water|cola|soda|soft\s*drink|energy\s*drink|mountain\s*dew|pepsi|coca[\s\-]*cola)\b/i,
    name: 'Carbonated Sugary Beverage',
    code: 'High Fructose',
    severity: 'danger',
    riskLabel: 'Metabolic Hazard',
    reason: 'Contains 35-40g of free liquid sugars per can with zero dietary fiber, triggering fatty liver disease and rapid tooth decay.',
    penalty: 35,
  },
];

// 2. Comprehensive Wholesome & Clean Ingredient Patterns
const WHOLESOME_PATTERNS = [
  { pattern: /\b(?:rolled\s*oats|whole\s*oats|wholegrain\s*oats|whole\s*grain\s*oats|oats)\b/i, name: '100% Whole Grain Oats', benefit: 'Rich in soluble beta-glucan fiber, lowering LDL cholesterol and stabilizing blood glucose.' },
  { pattern: /\b(?:beta[\s\-]*glucan)\b/i, name: 'Beta-Glucan Soluble Fiber', benefit: 'Clinically proven to reduce heart disease risk and enhance gut microbiome diversity.' },
  { pattern: /\b(?:dietary\s*fib(?:re|er))\b/i, name: 'Natural Dietary Fiber', benefit: 'Slows carbohydrate absorption, supports healthy digestion, and promotes prolonged satiety.' },
  { pattern: /\b(?:plant\s*protein|pea\s*protein|protein)\b/i, name: 'Plant Protein', benefit: 'Essential amino acids for cellular repair, immune support, and lean muscle maintenance.' },
  { pattern: /\b(?:iron|magnesium|zinc|calcium)\b/i, name: 'Essential Minerals', benefit: 'Critical micronutrients for cellular oxygenation, bone density, and neurological health.' },
  { pattern: /\b(?:chia\s*seeds?|flax\s*seeds?)\b/i, name: 'Omega-3 Rich Seeds', benefit: 'Packed with alpha-linolenic acid (ALA) for cardiovascular health and anti-inflammatory support.' },
  { pattern: /\b(?:almonds?|walnuts?|cashews?)\b/i, name: 'Raw Tree Nuts', benefit: 'Wholesome monounsaturated fats, Vitamin E, and powerful antioxidant cellular protection.' },
  { pattern: /\b(?:whole\s*wheat|brown\s*rice|quinoa)\b/i, name: 'Whole Grains', benefit: 'Unrefined complex carbohydrates with natural germ and bran intact for sustained energy.' },
];

/**
 * Master Analyzer: Identifies Good vs Bad / Harmful ingredients
 */
export function analyzeIngredients(rawText) {
  const normalized = normalizeText(rawText);
  if (!normalized || normalized.length < 3) return null;

  const badIngredients = [];
  const goodIngredients = [];
  let totalPenalty = 0;

  // 1. Match Harmful Additives, Oils, and Brand Signatures
  for (const item of HARMFUL_PATTERNS) {
    if (item.pattern.test(normalized)) {
      badIngredients.push({
        name: item.name,
        code: item.code,
        severity: item.severity,
        riskLabel: item.riskLabel,
        reason: item.reason,
      });
      totalPenalty += item.penalty;
    }
  }

  // 2. Also cross-match with E-Numbers database for any extra specialized codes
  const ePattern = /\b(?:ins|e)[\s\-_]?([0-9]{3,4}[a-z]?)/gi;
  let match;
  while ((match = ePattern.exec(normalized)) !== null) {
    const rawCode = match[1];
    const upperCode = 'E' + rawCode.toUpperCase();
    const lowerCode = 'E' + rawCode.toLowerCase();
    const numOnly = 'E' + rawCode.replace(/[^0-9]/g, '');

    const foundE = E_NUMBERS[upperCode] || E_NUMBERS[lowerCode] || E_NUMBERS[numOnly];
    if (foundE && !badIngredients.some(b => b.name === foundE.name)) {
      if (foundE.risk === 'danger') {
        badIngredients.push({
          name: foundE.name,
          code: foundE.code,
          severity: 'danger',
          riskLabel: 'Hazardous Chemical',
          reason: (foundE.sideEffects && foundE.sideEffects[0]) || foundE.description,
        });
        totalPenalty += 20;
      } else if (foundE.risk === 'caution') {
        badIngredients.push({
          name: foundE.name,
          code: foundE.code,
          severity: 'caution',
          riskLabel: 'Moderate Additive',
          reason: (foundE.sideEffects && foundE.sideEffects[0]) || foundE.description,
        });
        totalPenalty += 10;
      }
    }
  }

  // 3. Match Wholesome Ingredients
  for (const item of WHOLESOME_PATTERNS) {
    if (item.pattern.test(normalized) && !goodIngredients.some(g => g.name === item.name)) {
      goodIngredients.push({
        name: item.name,
        code: 'Wholesome',
        benefit: item.benefit,
      });
    }
  }

  // 4. Calculate Mathematical Health Score (0 - 100)
  let score;
  if (badIngredients.length === 0) {
    // Clean product: if wholesome ingredients matched, 100/100, otherwise neutral
    score = goodIngredients.length > 0 ? 100 : 90;
    if (goodIngredients.length === 0) {
      goodIngredients.push({
        name: 'Clean Ingredients',
        code: 'Safe',
        benefit: 'No harmful additives, toxic preservatives, or high-glycemic sugars detected.',
      });
    }
  } else {
    // Harmful product: apply calibrated penalties
    score = Math.max(15, Math.min(65, 100 - totalPenalty));
  }

  let verdict = 'Safe & Wholesome';
  let verdictColor = '#16A34A'; // Emerald Green
  let summary = 'Clean ingredients with natural nutritional value and zero harmful additives.';

  if (score < 50) {
    verdict = 'Harmful / High Risk';
    verdictColor = '#DC2626'; // Coral Red
    summary = 'Multiple high-hazard additives, palm oil, refined carbs, or disguised sugars detected!';
  } else if (score < 75) {
    verdict = 'Moderate / Consume Sparingly';
    verdictColor = '#D97706'; // Amber
    summary = 'Contains processed ingredients or saturated fats. Consume in moderation.';
  }

  return {
    score,
    verdict,
    verdictColor,
    summary,
    badIngredients,
    goodIngredients,
  };
}
