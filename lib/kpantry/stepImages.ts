/**
 * 과정 사진 → 스텝 매핑.
 *
 * pantry_recipe_steps 에는 레시피마다 사진 3장(드물게 2장)이 step 1·2·3 행에 순서대로 붙어 있다
 * (파일명 {slug}-step1/2/3.png). 그런데 사진은 스텝 제목별로 찍은 게 아니라 '재료 준비 · 조리 중 · 완성'
 * 세 장면이라, 스텝이 4개 이상인 레시피에서는 3번 사진(완성)이 3번 스텝에 붙어 엉뚱한 설명 옆에 나온다.
 * 고정 규칙(2번 → N-1, 3번 → N)은 맞지 않는 레시피가 절반쯤이라(예: 비빔냉면 1번 사진은 면 삶기 = 2번 스텝)
 * 103개 레시피의 사진 307장을 스텝 제목과 하나씩 대조해(2026-11-02) 레시피별로 정했다.
 *
 * 값: 지금 붙어 있는 순서대로 n번째 사진이 가야 할 step_order. 같은 스텝에 두 장이 가면 나란히 보여 준다.
 * 목록에 없는 레시피(새로 추가된 것)는 DB 에 붙은 그대로 둔다.
 */
const STEP_FOR_IMAGE: Record<string, number[]> = {
  'altang': [1, 3, 4],
  'anchovy-noodle-soup': [1, 3, 6],
  'andong-jjimdak': [1, 3, 5],
  'bibim-gimbap': [1, 5, 6],
  'bibim-naengmyeon': [2, 3, 5],
  'bibimbap': [1, 5, 6],
  'broccoli-muchim': [1, 2, 5],
  'buchu-jeon': [1, 2, 3],
  'budae-jjigae': [1, 3, 4],
  'budae-jjigae-deluxe': [1, 3, 4],
  'buldak': [1, 2, 4],
  'bulgogi': [1, 2, 3],
  'cabbage-doenjang-muchim': [1, 1, 3],
  'curry-rice': [1, 4, 5],
  'dak-bokkeum-tang': [1, 3, 4],
  'dak-gangjeong': [1, 1, 3],
  'dak-twigim': [1, 3, 4],
  'dakdoritang': [1, 3, 4],
  'dakgalbi': [1, 2, 3],
  'dakgalbi-bokkeumbap': [1, 2, 4],
  'dakgalbi-jjigae': [1, 3, 4],
  'doenjang-bibimbap': [1, 2, 5],
  'doenjang-jjigae': [1, 3, 4],
  'doenjang-sundubu-jjigae': [1, 3, 4],
  'doraji-namul': [1, 1, 2],
  'dubu-buchim': [1, 2, 3],
  'dubu-jorim': [1, 3, 4],
  'dwaeji-galbi': [1, 2, 3],
  'egg-rice-bowl': [1, 2, 4],
  'eomuk-bokkeum': [1, 2, 4],
  'eomuk-tang': [1, 1, 3],
  'gaji-namul': [1, 1, 3],
  'galbi-jjim': [1, 2, 4],
  'galbitang': [1, 3, 4],
  'gamja-guk': [1, 4, 5],
  'gamja-jorim': [1, 2, 3],
  'gamja-tang': [1, 3, 4],
  'gimbap': [1, 5, 6],
  'gochujang-jjigae': [1, 2, 4],
  'gunmandu': [1, 2, 4],
  'gyeran-mari': [1, 2, 3],
  'haejang-guk': [1, 1, 4],
  'haemul-doenjang-jjigae': [1, 1, 4],
  'haemul-pajeon': [1, 2, 3],
  'haemul-sundubu-jjigae': [1, 2, 4],
  'hobak-doenjang-muchim': [1, 2, 4],
  'hobak-jeon': [1, 2, 3],
  'homemade-kimchi': [1, 1, 3],
  'hotteok': [1, 4, 4],
  'jangjorim': [1, 2, 4],
  'japchae': [1, 4, 6],
  'japchae-namul-bowl': [1, 2, 4],
  'japchae-with-beef': [1, 5, 6],
  'jeyuk-bokkeum': [1, 1, 3],
  'jeyuk-dupbap': [1, 2, 3],
  'jjajangmyeon': [1, 4, 6],
  'jjamppong': [1, 3, 6],
  'kalguksu': [1, 4, 5],
  'kimchi-bokkeumbap-deluxe': [1, 2, 5],
  'kimchi-fried-rice': [1, 2, 5],
  'kimchi-guk': [1, 1, 3],
  'kimchi-jeon-quick': [1, 1, 3],
  'kimchi-jjigae': [1, 2, 4],
  'kimchi-pajeon': [1, 2, 3],
  'kimchi-pancake': [1, 1, 2],
  'kimchi-ramen': [1, 3, 4],
  'kimchi-stew-with-spam': [1, 2, 4],
  'kimchi-sundubu-jjigae': [1, 1],
  'kkori-gomtang': [1, 2, 4],
  'kongbiji-jjigae': [1, 2, 4],
  'kongguksu': [1, 1, 4],
  'kongjorim': [1, 2, 3],
  'kongnamul-bibimbap': [1, 1, 5],
  'kongnamul-guk': [1, 1, 2],
  'kongnamul-muchim': [1, 1, 3],
  'miyeok-guk': [1, 3, 4],
  'mu-doenjang-guk': [1, 3, 5],
  'mu-jorim': [1, 2, 3],
  'mul-naengmyeon': [1, 3, 4],
  'musaengchae': [1, 2, 3],
  'oi-muchim': [1, 1, 3],
  'oi-naengchae': [1, 1, 3],
  'ojingeo-bokkeum': [1, 2, 3],
  'ojingeo-bokkeum-noodles': [1, 4, 6],
  'omurice': [1, 2, 4],
  'ramyeon-upgrade': [1, 3, 5],
  'samgyeopsal': [1, 2, 3],
  'samgyetang': [1, 2, 4],
  'sigeumchi-namul': [1, 1, 2],
  'sogogi-muguk': [1, 3, 4],
  'soondae-bokkeum': [1, 3, 4],
  'spinach-doenjang-soup': [1, 1, 3],
  'ssamjang-veggie-bowl': [1, 1, 5],
  'steamed-egg': [1, 2, 3],
  'sukju-namul': [1, 1, 3],
  'sundae-tteokbokki': [1, 2, 4],
  'sundubu-dupbap': [1, 2, 5],
  'sundubu-jjigae': [1, 1, 4],
  'tteok-ramen': [1, 3, 4],
  'tteokbokki': [1, 2, 4],
  'tuna-mayo-rice-bowl': [1, 2],
  'twigim': [1, 2, 3],
  'yukgaejang': [1, 2, 4],
}

export interface StepRow {
  id: string
  step_order: number
  title: string
  description: string
  image_url?: string | null
}

export type StepWithImages = Omit<StepRow, 'image_url'> & { images: string[] }

/** 스텝마다 그 스텝에 보여 줄 사진 목록을 붙인다(없으면 빈 배열). steps 는 step_order 순이어야 한다 */
export function placeStepImages(slug: string, steps: StepRow[]): StepWithImages[] {
  const attached = steps.filter(s => s.image_url).map(s => s.image_url as string)
  const targets = STEP_FOR_IMAGE[slug]
  const byStep = new Map<number, string[]>()

  attached.forEach((url, i) => {
    // 매핑이 없거나 사진 수가 달라졌으면(데이터가 바뀜) 원래 붙은 스텝을 그대로 쓴다
    const original = steps.find(s => s.image_url === url)!.step_order
    const target = targets && targets.length === attached.length ? targets[i] : original
    const step = steps.some(s => s.step_order === target) ? target : original
    byStep.set(step, [...(byStep.get(step) ?? []), url])
  })

  return steps.map(({ image_url: _, ...s }) => ({ ...s, images: byStep.get(s.step_order) ?? [] }))
}
