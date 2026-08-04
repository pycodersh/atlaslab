// Permanent slug registry for SEO expression pages.
// NEVER change slugs after publishing — URL changes reset search ranking.

export const SLUG_TO_ID: Record<string, number> = {
  'juseyo':               770,
  'mwoyeyo':              771,
  'isseoyo':              772,
  'eotteoke-gayo':        773,
  'gago-sipeoyo':         774,
  'joahaeyo':             780,
  'eseo-wasseoyo':        790,
  'jal-butakdeuryeoyo':   791,
  'meokgo-sipeoyo':       793,
  'mot-meogeoyo':         794,
  'meogeodo-dwaeyo':      795,
  'gireul-ilheosseoyo':   806,
  'jaemiisseoyo':         810,
  'nalssi-eottaeyo':      812,
  'oraenmanieyo':         824,
  'jal-jinaesseoyo':      825,
  'geot-gatayo':          830,
  'na-bwayo':             831,
  'haeya-hae':            833,
  'haji-ma':              834,
  'boda':                 896,
  'seumnida':             1333,
  'eo-boda':              1340,
  'man':                  1372,
  'bakke':                1374,
  'ege-hante':            1377,
  'euro':                 1379,
  'eullaeyo':             1380,
  'ieyo-yeyo':            1383,
  'hago':                 1386,
}

export const ID_TO_SLUG: Record<number, string> = Object.fromEntries(
  Object.entries(SLUG_TO_ID).map(([slug, id]) => [id, slug])
)

export const SEO_EXPRESSION_IDS: number[] = Object.values(SLUG_TO_ID)
