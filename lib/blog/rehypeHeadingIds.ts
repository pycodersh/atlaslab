/**
 * 블로그 본문 h2 · h3 에 앵커 id 를 붙이는 rehype 플러그인(외부 패키지 없이).
 *
 *   "## Bulguksa Temple"            → id="bulguksa-temple"
 *   "### Day 1: Palaces & hanok"    → id="day-1-palaces-hanok"
 *   같은 글에 같은 제목이 또 나오면   → "-2", "-3" 을 붙인다.
 *
 * 위젯(data/regionalHotspots.ts 의 guide.anchor)이 명소 절로 바로 가려고 쓴다.
 * 그래서 새 명소 가이드는 명소 절 제목을 명소 이름 그대로 짧게 쓴다 — 제목을 바꾸면 앵커도 바뀐다.
 * MDX 에서는 {#id} 같은 명시 문법을 쓸 수 없다(중괄호가 JS 식이 된다). 그래서 제목 글자에서만 만든다.
 * 화면은 달라지지 않는다. 이미 id 가 있는 제목은 건드리지 않는다.
 */
type Node = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: Node[] }

const textOf = (n: Node): string => n.type === 'text' ? (n.value ?? '') : (n.children ?? []).map(textOf).join('')

export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')   // é → e
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9가-힣\s-]/g, '')            // 영문 · 숫자 · 한글만 남긴다
    .trim()
    .replace(/[\s-]+/g, '-')
}

export function rehypeHeadingIds() {
  return (tree: Node) => {
    const used = new Map<string, number>()
    const walk = (n: Node) => {
      if (n.type === 'element' && (n.tagName === 'h2' || n.tagName === 'h3')) {
        n.properties ??= {}
        if (!n.properties.id) {
          const base = headingSlug(textOf(n)) || 'section'
          const k = (used.get(base) ?? 0) + 1
          used.set(base, k)
          n.properties.id = k === 1 ? base : `${base}-${k}`
        }
      }
      n.children?.forEach(walk)
    }
    walk(tree)
  }
}
