// 100% Offline Core Analysis Engine for LabelLens
import { E_NUMBERS } from '../database/eNumbers';
import { HIDDEN_SUGARS } from '../database/hiddenSugars';
import { ALLERGENS } from '../database/allergens';

/**
 * Normalizes input text and extracts tokens, phrases, and E-codes
 */
export function normalizeText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ')
    .replace(/[;]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detects all E-numbers and INS codes inside an ingredient text
 */
export function extractAdditives(text) {
  const found = new Map();

  // Pattern 1: e.g. E102, E-102, E 102, INS 102, INS-102, INS102
  const ePattern = /\b(?:ins|e)[\s\-_]?([0-9]{3,4}[a-z]?)/gi;
  let match;
  while ((match = ePattern.exec(text)) !== null) {
    const rawCode = match[1];
    const standardizedE = 'E' + rawCode.toUpperCase();
    const baseCode = 'E' + rawCode.replace(/[^0-9]/g, '');

    if (E_NUMBERS[standardizedE]) {
      found.set(standardizedE, E_NUMBERS[standardizedE]);
    } else if (E_NUMBERS[baseCode]) {
      found.set(baseCode, E_NUMBERS[baseCode]);
    }
  }

  // Also check additive common names in text (e.g., "monosodium glutamate", "sodium benzoate", "aspartame")
  Object.values(E_NUMBERS).forEach(additive => {
    const nameLower = additive.name.toLowerCase();
    // Split on parentheses or slashes to get distinct names
    const parts = nameLower.split(/[\(\)\/]/).map(p => p.trim()).filter(p => p.length > 3);
    for (const part of parts) {
      if (text.includes(part)) {
        found.set(additive.code, additive);
        break;
      }
    }
  });

  return Array.from(found.values());
}

/**
 * Detects disguised sugars from text
 */
export function extractHiddenSugars(text) {
  const detected = [];
  const lowerText = text.toLowerCase();

  for (const sugar of HIDDEN_SUGARS) {
    for (const alias of sugar.aliases) {
      // Word boundary regex
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(lowerText)) {
        detected.push(sugar);
        break;
      }
    }
  }
  return detected;
}

/**
 * Checks for allergen keywords according to active user profile restrictions
 */
export function extractAllergens(text, userProfile = {}) {
  const results = [];
  const lowerText = text.toLowerCase();

  for (const [allergenKey, allergen] of Object.entries(ALLERGENS)) {
    const matchedKeywords = [];
    for (const keyword of allergen.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerText)) {
        matchedKeywords.push(keyword);
      }
    }

    if (matchedKeywords.length > 0) {
      // Check if this allergen directly violates user profile
      let isProfileViolation = false;
      if (allergenKey === 'gluten' && userProfile.glutenSensitive) isProfileViolation = true;
      if (allergenKey === 'dairy' && (userProfile.lactoseIntolerant || userProfile.vegan)) isProfileViolation = true;
      if (allergenKey === 'peanuts' && userProfile.peanutAllergy) isProfileViolation = true;
      if (allergenKey === 'treeNuts' && userProfile.nutAllergy) isProfileViolation = true;
      if (allergenKey === 'eggs' && (userProfile.eggAllergy || userProfile.vegan)) isProfileViolation = true;
      if (allergenKey === 'soy' && userProfile.soyAllergy) isProfileViolation = true;
      if (allergenKey === 'palmOil' && userProfile.palmOilFree) isProfileViolation = true;
      if (allergenKey === 'transFat' && userProfile.heartHealthy) isProfileViolation = true;

      results.push({
        ...allergen,
        matchedKeywords: Array.from(new Set(matchedKeywords)),
        isProfileViolation,
      });
    }
  }

  return results;
}

/**
 * Master Analysis Function: Computes Health Score, Risk Badges, and Profile Warnings
 */
export function analyzeIngredients(rawText, userProfile = {}) {
  const normalized = normalizeText(rawText);
  if (!normalized || normalized.length < 5) {
    return null;
  }

  const additives = extractAdditives(normalized);
  const hiddenSugars = extractHiddenSugars(normalized);
  const allergens = extractAllergens(normalized, userProfile);

  // Group additives by hazard level
  const dangerAdditives = additives.filter(a => a.risk === 'danger');
  const cautionAdditives = additives.filter(a => a.risk === 'caution');
  const safeAdditives = additives.filter(a => a.risk === 'safe');

  // Compute 0 - 100 Health Score
  let score = 100;
  const deductions = [];

  // Deduct for High-risk/Dangerous Additives (-15 per danger additive)
  dangerAdditives.forEach(item => {
    score -= 15;
    deductions.push(`-15: Hazardous Additive (${item.code} - ${item.name})`);
  });

  // Deduct for Caution Additives (-6 per item)
  cautionAdditives.forEach(item => {
    score -= 6;
    deductions.push(`-6: Caution Additive (${item.code} - ${item.name})`);
  });

  // Deduct for Hidden Sugars (-8 each, or -15 if diabetic)
  hiddenSugars.forEach(sugar => {
    const penalty = userProfile.diabetic ? 14 : 7;
    score -= penalty;
    deductions.push(`-${penalty}: Hidden High-GI Sugar (${sugar.name})`);
  });

  // Deduct heavily for Profile Violations (-20 per violation)
  const profileViolations = allergens.filter(a => a.isProfileViolation);
  profileViolations.forEach(v => {
    score -= 20;
    deductions.push(`-20: Conflict with your Personal Health Profile (${v.name})`);
  });

  // Deduct for Industrial Trans Fats (-15)
  const hasTransFat = allergens.some(a => a.id === 'transFat');
  if (hasTransFat) {
    score -= 15;
    deductions.push('-15: Contains Industrial Hydrogenated Trans Fat');
  }

  // Deduct for Palm Oil if flagged
  const hasPalmOil = allergens.some(a => a.id === 'palmOil');
  if (hasPalmOil && !userProfile.palmOilFree) {
    score -= 6;
    deductions.push('-6: High Saturated Palm Oil detected');
  }

  // Clamp score between 0 and 100
  score = Math.max(5, Math.min(100, Math.round(score)));

  // Calculate Grade
  let grade = 'A';
  let verdictColor = '#10B981'; // Green
  let verdictTitle = 'Safe & Clean';
  let summary = 'This product appears to have clean ingredients with minimal hazardous additives.';

  if (score < 40) {
    grade = 'F';
    verdictColor = '#EF4444'; // Red
    verdictTitle = 'Unsafe / Severe Hazard';
    summary = 'Multiple high-risk chemicals, hidden sugars, or health profile conflicts detected. Caution advised!';
  } else if (score < 60) {
    grade = 'D';
    verdictColor = '#F97316'; // Orange
    verdictTitle = 'Poor Quality';
    summary = 'Contains concerning additives, artificial coloring, or high-glycemic sweeteners.';
  } else if (score < 75) {
    grade = 'C';
    verdictColor = '#F59E0B'; // Amber
    verdictTitle = 'Moderate / Consume Sparingly';
    summary = 'Moderate level of processing. Contains some synthetic stabilizers or preservatives.';
  } else if (score < 90) {
    grade = 'B';
    verdictColor = '#3B82F6'; // Blue
    verdictTitle = 'Good / Acceptable';
    summary = 'Relatively clean formula with only mild, well-tolerated preservatives or colors.';
  }

  return {
    score,
    grade,
    verdictColor,
    verdictTitle,
    summary,
    deductions,
    stats: {
      totalAdditives: additives.length,
      dangerCount: dangerAdditives.length,
      cautionCount: cautionAdditives.length,
      safeCount: safeAdditives.length,
      sugarCount: hiddenSugars.length,
      allergenCount: allergens.length,
      profileViolationsCount: profileViolations.length,
    },
    dangerAdditives,
    cautionAdditives,
    safeAdditives,
    hiddenSugars,
    allergens,
    profileViolations,
  };
}
