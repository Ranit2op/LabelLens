// 100% Offline Core Analysis Engine for LabelLens
// Simple, transparent categorization: Good vs. Bad / Harmful ingredients

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

export function extractAdditives(text) {
  const found = new Map();

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

  Object.values(E_NUMBERS).forEach(additive => {
    const nameLower = additive.name.toLowerCase();
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

export function extractHiddenSugars(text) {
  const detected = [];
  const lowerText = text.toLowerCase();

  for (const sugar of HIDDEN_SUGARS) {
    for (const alias of sugar.aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(lowerText)) {
        detected.push(sugar);
        break;
      }
    }
  }
  return detected;
}

export function extractAllergens(text) {
  const results = [];
  const lowerText = text.toLowerCase();

  for (const [key, allergen] of Object.entries(ALLERGENS)) {
    for (const keyword of allergen.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerText)) {
        results.push(allergen);
        break;
      }
    }
  }
  return results;
}

const BENEFICIAL_SOURCES = [
  { word: 'whole wheat', name: 'Whole Wheat', benefit: 'High in natural dietary fiber and B-complex vitamins.' },
  { word: 'atta', name: 'Whole Wheat (Atta)', benefit: 'Complex carbohydrates providing steady energy.' },
  { word: 'oats', name: 'Rolled Oats', benefit: 'Rich in beta-glucan fiber, supports heart and gut health.' },
  { word: 'milk', name: 'Milk / Dairy Nutrients', benefit: 'Natural source of calcium and essential amino acids.' },
  { word: 'almond', name: 'Almonds', benefit: 'Packed with healthy monounsaturated fats and Vitamin E.' },
  { word: 'cashew', name: 'Cashews', benefit: 'Good source of magnesium and plant protein.' },
  { word: 'cocoa', name: 'Cocoa Solids', benefit: 'Rich in natural polyphenol antioxidants.' },
  { word: 'turmeric', name: 'Turmeric / Curcumin', benefit: 'Potent natural anti-inflammatory and cellular protector.' },
  { word: 'salt', name: 'Salt (Iodized)', benefit: 'Provides essential sodium and iodine for thyroid health.' },
];

/**
 * Master Analyzer: Identifies Good vs Bad / Harmful ingredients
 */
export function analyzeIngredients(rawText) {
  const normalized = normalizeText(rawText);
  if (!normalized || normalized.length < 3) return null;

  const additives = extractAdditives(normalized);
  const hiddenSugars = extractHiddenSugars(normalized);
  const allergens = extractAllergens(normalized);

  const badIngredients = [];
  const goodIngredients = [];

  // 1. Process Chemical Additives (E-numbers / INS)
  additives.forEach(item => {
    if (item.risk === 'danger') {
      badIngredients.push({
        name: item.name,
        code: item.code,
        severity: 'danger',
        riskLabel: 'Hazardous Chemical',
        reason: (item.sideEffects && item.sideEffects[0]) || item.description,
      });
    } else if (item.risk === 'caution') {
      badIngredients.push({
        name: item.name,
        code: item.code,
        severity: 'caution',
        riskLabel: 'Moderate Additive',
        reason: (item.sideEffects && item.sideEffects[0]) || item.description,
      });
    } else {
      goodIngredients.push({
        name: item.name,
        code: item.code,
        benefit: item.description || 'Natural, safe food additive',
      });
    }
  });

  // 2. Process Disguised High-Glycemic Sugars
  hiddenSugars.forEach(sugar => {
    badIngredients.push({
      name: sugar.name,
      code: `GI: ${sugar.glycemicIndex}`,
      severity: 'danger',
      riskLabel: 'Disguised Sugar',
      reason: sugar.description,
    });
  });

  // 3. Process Harmful Oils & Fats
  allergens.forEach(allergen => {
    if (allergen.id === 'transFat') {
      badIngredients.push({
        name: 'Trans Fats (Hydrogenated Oils)',
        code: 'Banned Fat',
        severity: 'danger',
        riskLabel: 'Heart Hazard',
        reason: 'Partially hydrogenated vegetable fats elevate bad cholesterol (LDL) and damage arteries.',
      });
    } else if (allergen.id === 'palmOil') {
      badIngredients.push({
        name: 'Palm Oil / Palmolein',
        code: 'Saturated Fat',
        severity: 'caution',
        riskLabel: 'High Saturated Fat',
        reason: 'High in palmitic acid (44%), causes arterial inflammation and heart strain.',
      });
    } else if (allergen.id === 'cosmeticToxins') {
      badIngredients.push({
        name: 'Cosmetic Toxins (SLS / Parabens)',
        code: 'Toxin',
        severity: 'danger',
        riskLabel: 'Skin / Hormone Hazard',
        reason: allergen.description,
      });
    }
  });

  // 4. Identify Wholesome / Good Ingredients
  BENEFICIAL_SOURCES.forEach(item => {
    if (normalized.includes(item.word) && !goodIngredients.some(g => g.name.toLowerCase().includes(item.word))) {
      goodIngredients.push({
        name: item.name,
        code: 'Wholesome',
        benefit: item.benefit,
      });
    }
  });

  // If no good ingredients matched yet, extract natural components
  if (goodIngredients.length === 0 && badIngredients.length === 0) {
    goodIngredients.push({
      name: 'Unspecified Ingredients',
      code: 'Clean',
      benefit: 'No toxic chemicals or artificial sweeteners detected in the scanned text.',
    });
  }

  // Calculate 0-100 Score
  let score = 100;
  badIngredients.forEach(b => {
    if (b.severity === 'danger') score -= 18;
    else score -= 8;
  });
  score = Math.max(10, Math.min(100, Math.round(score)));

  let verdict = 'Safe & Wholesome';
  let verdictColor = '#10B981'; // Green
  let summary = 'This item has clean ingredients with no major toxic additives found.';

  if (score < 50) {
    verdict = 'Harmful / High Risk';
    verdictColor = '#EF4444'; // Red
    summary = 'Multiple dangerous chemicals, artificial colors, or hidden sugars detected!';
  } else if (score < 75) {
    verdict = 'Moderate / Consume Sparingly';
    verdictColor = '#F59E0B'; // Amber
    summary = 'Contains some processed additives or high-saturated oils. Eat in moderation.';
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
