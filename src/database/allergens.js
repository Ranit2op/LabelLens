// 100% Offline Database of Allergens, Dietary Triggers & Toxic Cosmetics

export const ALLERGENS = {
  gluten: {
    id: 'gluten',
    name: 'Gluten / Wheat',
    description: 'Protein causing severe autoimmune damage in Celiac Disease and gut inflammation in gluten sensitivity.',
    keywords: [
      'wheat', 'wheat flour', 'maida', 'refined wheat flour', 'atta',
      'gluten', 'wheat gluten', 'vital wheat gluten',
      'barley', 'barley malt', 'malt extract',
      'rye', 'spelt', 'semolina', 'suji', 'sooji',
      'durum', 'bulgur', 'couscous', 'farina', 'triticale'
    ]
  },
  dairy: {
    id: 'dairy',
    name: 'Dairy / Lactose',
    description: 'Milk proteins and sugars causing lactose intolerance, digestive distress, and milk protein allergies.',
    keywords: [
      'milk', 'milk solids', 'whole milk powder', 'skimmed milk powder',
      'whey', 'whey protein', 'whey permeate', 'demineralized whey',
      'casein', 'sodium caseinate', 'calcium caseinate',
      'butter', 'butter oil', 'ghee', 'milk fat', 'anhydrous milk fat',
      'cheese', 'paneer', 'cream', 'curd', 'yogurt', 'lactose'
    ]
  },
  soy: {
    id: 'soy',
    name: 'Soy / Soya',
    description: 'One of the top 8 food allergens with phytoestrogenic compounds. Highly prevalent in processed foods.',
    keywords: [
      'soy', 'soya', 'soybean', 'soy lecithin', 'soya lecithin',
      'soy protein', 'soy protein isolate', 'hydrolyzed soy protein',
      'tofu', 'edamame', 'soy sauce', 'tamari', 'textured vegetable protein', 'tvp'
    ]
  },
  peanuts: {
    id: 'peanuts',
    name: 'Peanuts / Groundnuts',
    description: 'Can trigger life-threatening anaphylactic shock even in microscopic trace quantities.',
    keywords: [
      'peanut', 'peanuts', 'groundnut', 'groundnuts',
      'peanut oil', 'arachis oil', 'peanut butter', 'peanut flour'
    ]
  },
  treeNuts: {
    id: 'treeNuts',
    name: 'Tree Nuts',
    description: 'Almonds, cashews, walnuts, pistachios capable of causing severe allergic shock.',
    keywords: [
      'almond', 'almonds', 'cashew', 'cashews', 'kaju',
      'walnut', 'walnuts', 'akhrot', 'pistachio', 'pistachios', 'pista',
      'hazelnut', 'hazelnuts', 'macadamia', 'pecan', 'pecans', 'brazil nut', 'pine nut'
    ]
  },
  eggs: {
    id: 'eggs',
    name: 'Eggs / Egg Protein',
    description: 'Common childhood and adult allergen found in baked goods, noodles, and mayonnaise.',
    keywords: [
      'egg', 'eggs', 'egg white', 'egg yolk', 'albumen', 'ovalbumin',
      'egg powder', 'whole egg powder', 'lysozyme', 'globulin'
    ]
  },
  palmOil: {
    id: 'palmOil',
    name: 'Palm Oil / Palmate',
    description: 'High in saturated palmitic acid (44%), linked to arterial plaques, elevated LDL cholesterol, and environmental deforestation.',
    keywords: [
      'palm oil', 'palmolein', 'palm kernel oil', 'fractionated palm oil',
      'palmate', 'palmitate', 'sodium palmate', 'sodium palm kernelate',
      'elaeis guineensis', 'palm fruit oil'
    ]
  },
  transFat: {
    id: 'transFat',
    name: 'Industrial Trans Fats',
    description: 'Man-made partially hydrogenated oils banned by WHO due to extreme coronary heart disease risks.',
    keywords: [
      'partially hydrogenated', 'hydrogenated vegetable oil', 'hydrogenated oil',
      'vanaspati', 'shortening', 'margarine', 'interesterified vegetable fat'
    ]
  },
  cosmeticToxins: {
    id: 'cosmeticToxins',
    name: 'Toxic Cosmetics & Toiletries Additives',
    description: 'Endocrine disruptors, harsh foaming agents, and skin irritants found in shampoos and soaps.',
    keywords: [
      'sodium lauryl sulfate', 'sls', 'sodium laureth sulfate', 'sles',
      'methylparaben', 'propylparaben', 'butylparaben', 'paraben',
      'dimethicone', 'cyclopentasiloxane', 'silicone',
      'phthalate', 'dep', 'dbp',
      'mineral oil', 'liquid paraffin', 'petrolatum',
      'dmdm hydantoin', 'triclosan'
    ]
  }
};
