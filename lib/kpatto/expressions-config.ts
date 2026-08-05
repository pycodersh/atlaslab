// Permanent slug registry for SEO expression pages.
// NEVER change slugs after publishing — URL changes reset search ranking.
// NEVER reorder or rename. Only append new entries at the bottom of each section.

export const SLUG_TO_ID: Record<string, number> = {
  // ─── EP01~10 (28) ────────────────────────────────────────────────
  'juseyo':                     770,
  'mwoyeyo':                    771,
  'isseoyo':                    772,
  'eotteoke-gayo':              773,
  'gago-sipeoyo':               774,
  'eodiseo-tayo':               792,
  'meokgo-sipeoyo':             793,
  'mot-meogeoyo':               794,
  'ro-halkkeyo':                776,
  'meogeodo-dwaeyo':            795,
  'buteo-kkaji':                1375,
  'hae-bon-jeok':               777,
  'chucheon-juseyo':            778,
  'jusil-su-isseoyo':           779,
  'joahaeyo':                   780,
  'bulleodo-dwaeyo':            796,
  'tto-ogo-sipeoyo':            797,
  'singihaeyo':                 781,
  'deo-juseyo':                 782,
  'kkakka-juseyo':              783,
  'sseobwasseoyo':              784,
  'eotteon-ge-joayo':           785,
  'saenggak-boda':              786,
  'da-gachi-isseoseo-joayo':    787,
  'imi-haeyo':                  788,
  'tteollyeoyo':                789,
  'eseo-wasseoyo':              790,
  'jal-butakdeuryeoyo':         791,

  // ─── EP11~30 (52) ────────────────────────────────────────────────
  'tayo':                       798,
  'naeryeoyo':                  799,
  'kkaji-ga-juseyo':            800,
  'deol-ge-hae-juseyo':         801,
  'ripil-dwaeyo':               802,
  'e-mwo-haeyo':                803,
  'gachi-llaeyo':               804,
  'jogeum-neujeul-geot-gatayo': 805,
  'gireul-ilheosseoyo':         806,
  'jjuk-gamyeon':               807,
  'kkeokkeumyeon':              808,
  'bwasseoyo':                  809,
  'jaemiisseoyo':               810,
  'gangchu-yeyo':               811,
  'nalssi-eottaeyo':            812,
  'ol-geot-gatayo':             813,
  'yak-isseoyo':                816,
  'an-meokneun-ge-naayo':       817,
  'chwimi-mwoyeyo':             818,
  'jeodoyo':                    819,
  'byeolloyeyo':                820,
  'yumyeong-mwoyeyo':           821,
  'sajin-jjigeoyo':             822,
  'sajin-nawasseoyo':           823,
  'oraenmanieyo':               824,
  'jal-jinaesseoyo':            825,
  'daeume-bwayo':               826,
  'eottaesseo':                 828,
  'geot-gatayo':                830,
  'na-bwayo':                   831,
  'haeya-hae':                  833,
  'haji-ma':                    834,
  'itji-ma':                    835,
  'eotteoke-saenggak':          836,
  'matneun-marieyo':            837,
  'jeo-dalayo':                 838,
  'ga-bwasseoyo':               839,
  'kkok-ga-boseyo':             840,
  'yojeum-mwo-bwayo':           842,
  'ppajyeodeureoyo':            843,
  'gidae-dwaeyo':               844,
  'norae-arayo':                845,
  'gasa-tteut':                 846,
  'jungdokseong':               847,
  'gwanri-haeyo':               848,
  'hyogwa-isseoyo':             849,
  'hugi-joayo':                 850,
  'eolmana-jaju':               851,
  'geongang-joayo':             852,
  'kkujunhi':                   853,
  'eodi-sarayo':                854,
  'honja-sarayo':               855,

  // ─── Grammar & Particles (20) ────────────────────────────────────
  'boda':                       896,
  'seumnida':                   1333,
  'at-eot':                     1334,
  'eo-boda':                    1340,
  'eoseo':                      1344,
  'eunikka':                    1347,
  'eul-geoyeyo':                1355,
  'eulge':                      1361,
  'eulkkayo':                   1362,
  'janha':                      1366,
  'jiman':                      1367,
  'gwa-wa':                     1368,
  'man':                        1372,
  'bakke':                      1374,
  'ege-hante':                  1377,
  'euro':                       1379,
  'eullaeyo':                   1380,
  'ieyo-yeyo':                  1383,
  'cheoreom':                   1384,
  'hago':                       1386,
}

export const ID_TO_SLUG: Record<number, string> = Object.fromEntries(
  Object.entries(SLUG_TO_ID).map(([slug, id]) => [id, slug])
)

export const SEO_EXPRESSION_IDS: number[] = Object.values(SLUG_TO_ID)

// ─── Category config ─────────────────────────────────────────────────────────
// Key = URL segment under /kpatto/expressions/topic/
// Maintain this list — do not reorder keys once published.

export type CategoryKey =
  | 'greeting'
  | 'ordering-food'
  | 'getting-around'
  | 'shopping'
  | 'feelings-opinions'
  | 'hobbies-culture'
  | 'grammar-particles'

export interface CategoryConfig {
  key: CategoryKey
  labelKo: string        // Hub page section header (Korean)
  labelEn: string        // Hub page section header (English)
  titleEn: string        // Page <title> — SEO optimised
  h1En: string           // H1 on category page
  descriptionEn: string  // meta description
  ids: number[]          // expression IDs (order = display order)
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'greeting',
    labelKo: '인사',
    labelEn: 'Greetings',
    titleEn: 'Korean Greeting Phrases — with Audio & Examples | K-PATTO',
    h1En: 'Korean Greeting Phrases',
    descriptionEn:
      'Master Korean greetings: from introducing yourself to saying goodbye. ' +
      'Each phrase includes audio, real examples, and webtoon scenes.',
    ids: [790, 791, 789, 787, 824, 825, 826, 796, 797, 819, 854, 855, 805],
  },
  {
    key: 'ordering-food',
    labelKo: '주문·음식',
    labelEn: 'Ordering Food',
    titleEn: 'Korean Phrases for Ordering Food — with Audio | K-PATTO',
    h1En: 'Korean Phrases for Ordering Food',
    descriptionEn:
      'Order food and drinks like a local. Essential Korean café and restaurant phrases ' +
      'with audio pronunciation and real webtoon examples.',
    ids: [770, 771, 772, 776, 793, 794, 795, 782, 801, 802, 778, 785, 817, 816, 820],
  },
  {
    key: 'getting-around',
    labelKo: '길찾기·교통',
    labelEn: 'Getting Around',
    titleEn: 'Korean Phrases for Getting Around Seoul — with Audio | K-PATTO',
    h1En: 'Korean Phrases for Getting Around',
    descriptionEn:
      'Navigate Seoul with confidence. Korean phrases for directions, subway, and taxi — ' +
      'each with audio and webtoon context.',
    ids: [773, 774, 792, 798, 799, 800, 806, 807, 808, 1375],
  },
  {
    key: 'shopping',
    labelKo: '쇼핑',
    labelEn: 'Shopping',
    titleEn: 'Korean Shopping Phrases — with Audio & Examples | K-PATTO',
    h1En: 'Korean Shopping Phrases',
    descriptionEn:
      'Shop in Korea without awkwardness. Bargaining, asking about products, and reading ' +
      'reviews — all with audio and real K-PATTO scenes.',
    ids: [783, 784, 779, 781, 786, 788, 848, 849, 850, 851, 852, 853],
  },
  {
    key: 'feelings-opinions',
    labelKo: '감정·의견',
    labelEn: 'Feelings & Opinions',
    titleEn: 'Korean Expressions for Feelings and Opinions — with Audio | K-PATTO',
    h1En: 'Korean Expressions for Feelings & Opinions',
    descriptionEn:
      'Say what you think and how you feel in Korean. From "I like it" to "seems like…" — ' +
      'with audio and authentic webtoon dialogue.',
    ids: [810, 811, 812, 813, 828, 830, 831, 780, 833, 834, 835, 836, 837, 838, 843, 847, 844],
  },
  {
    key: 'hobbies-culture',
    labelKo: '취미·문화',
    labelEn: 'Hobbies & Culture',
    titleEn: 'Korean Phrases for Hobbies and Culture — with Audio | K-PATTO',
    h1En: 'Korean Phrases for Hobbies & Culture',
    descriptionEn:
      'Talk K-dramas, K-pop, and travel plans in Korean. Phrases from real webtoon episodes ' +
      'with audio and cultural context.',
    ids: [777, 803, 804, 809, 818, 821, 822, 823, 839, 840, 842, 845, 846],
  },
  {
    key: 'grammar-particles',
    labelKo: '문법·조사',
    labelEn: 'Grammar & Particles',
    titleEn: 'Essential Korean Grammar Patterns — with Audio & Examples | K-PATTO',
    h1En: 'Essential Korean Grammar Patterns',
    descriptionEn:
      'The grammar patterns every Korean learner needs: past tense, particles, endings, and more. ' +
      'Each with audio, usage rules, and real examples.',
    ids: [896, 1333, 1334, 1340, 1344, 1347, 1355, 1361, 1362, 1366, 1367, 1368, 1372, 1374, 1377, 1379, 1380, 1383, 1384, 1386],
  },
]

export const CATEGORY_BY_KEY: Record<CategoryKey, CategoryConfig> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c])
) as Record<CategoryKey, CategoryConfig>

/** Map expression ID → category key (for "which category does this belong to?" on individual pages) */
export const ID_TO_CATEGORY: Record<number, CategoryKey> = Object.fromEntries(
  CATEGORIES.flatMap(c => c.ids.map(id => [id, c.key]))
)
