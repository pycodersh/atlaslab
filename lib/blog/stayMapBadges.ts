/**
 * StayMap 왼쪽 위 위치 뱃지 — '동네 · 도시(섬) 안에서 어디쯤 (공항 · 역에서 걸리는 시간)'.
 * 시간은 각 글(content/stays/*.mdx)의 Location · Quick Facts 에 적힌 값만 쓴다. 글에 없으면 시간은 뺀다.
 * stay-maps.generated.json 은 scripts/make-stay-maps.mjs 가 다시 만들면 덮어써지므로 따로 둔다.
 */
export const STAY_MAP_BADGES: Record<string, string> = {
  'andaz-seoul': 'Apgujeong · Gangnam, south of the Han (70–90 min from ICN Airport)',
  'banyan-tree-seoul': 'Namsan · Central Seoul (70–90 min from ICN Airport)',
  'conrad': 'Yeouido · West Seoul, on the Han (15–20 min from GMP Airport)',
  'fairmont-ambassador': 'Yeouido · West Seoul, on the Han River',
  'four-seasons-seoul': 'Gwanghwamun · Central Seoul, by the palaces (60–75 min from ICN Airport)',
  'grand-intercontinental-parnas': 'Samseong · COEX, East Gangnam',
  'gyeongwonjae': 'Songdo Central Park · Incheon (20–25 min from ICN Airport)',
  'hotel-naru': 'Mapo · West-central Seoul, on the Han River',
  'josun-palace': "Yeoksam · Gangnam's Teheran-ro (70–90 min from ICN Airport)",
  'jw-marriott-seoul': 'Banpo · Express Bus Terminal, Gangnam (60–80 min from ICN Airport)',
  'l7-hongdae': 'Hongdae · West Seoul (50 min from ICN Airport by AREX)',
  'lescape': 'Hoehyeon · Central Seoul, by Myeongdong',
  'mondrian': 'Itaewon · Central Seoul (70–90 min from ICN Airport)',
  'oakwood': 'Songdo · Incheon (20–25 min from ICN Airport)',
  'paradise-busan': 'Haeundae Beach · East Busan (40–50 min from Gimhae Airport)',
  'park-hyatt-seoul': 'Samseong · COEX, East Gangnam (70–90 min from ICN Airport)',
  'parnas-jeju': 'Jungmun Resort · South Jeju (1 hr from CJU Airport)',
  'ryse': 'Hongdae · West Seoul (50 min from ICN Airport by AREX)',
  'sheraton': 'Songdo Central Park · Incheon (20–25 min from ICN Airport)',
  'shilla': 'Jangchung-dong · Namsan, Central Seoul (70–90 min from ICN Airport)',
  'signiel': 'Jamsil · Songpa, East Seoul (70–90 min from ICN Airport)',
  'signiel-busan': 'Haeundae · East Busan (40–50 min from Gimhae Airport)',
  'westin-josun': 'City Hall · Central Seoul (10 min by taxi to Seoul Station)',
}
