// 재료 이미지(image_url)가 없을 때 대신 보여 줄 이모지
const INGREDIENT_EMOJIS: Record<string, string> = {
  Kimchi: '🥬', Egg: '🥚', Rice: '🍚', 'Green Onion': '🌿',
  Onion: '🧅', Garlic: '🧄', 'Soy Sauce': '🫙', 'Sesame Oil': '🫒',
  'Sesame Seeds': '🌰', Gochugaru: '🌶', Gochujang: '🌶',
  Doenjang: '🫙', Sugar: '🍬', Salt: '🧂', Tofu: '⬜',
  Beef: '🥩', Pork: '🥩', Chicken: '🍗', Tuna: '🐟',
  Spam: '🥫', Potato: '🥔', Zucchini: '🥒', Mushroom: '🍄',
  Carrot: '🥕', Spinach: '🌿', 'Bean Sprouts': '🌱',
  'Glass Noodles': '🍜', 'Rice Cake': '🍡', 'Anchovy Broth': '🍵',
  'Perilla Oil': '🫒',
}

export function ingredientEmoji(name: string) {
  return INGREDIENT_EMOJIS[name] ?? '🥘'
}
