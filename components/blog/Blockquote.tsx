import type { ReactNode } from 'react'

/**
 * 본문 인용구(>) — 경고/공지 콜아웃만 따로 표시한다.
 *
 * 이 블로그의 인용구는 두 가지로 쓰인다.
 *   1) 한국어 예문·회화 ("여기서 먹고 가도 돼요?")  → 단정한 기본 스타일
 *   2) 경고·공지 ("**Critical Warning:** …")        → 로즈 틴트 콜아웃
 * 둘은 내용으로만 구분되는데 CSS 는 글자를 볼 수 없어서, 여기서 첫 낱말을
 * 보고 클래스를 붙인다. 스타일은 lib/blog/proseCss.ts 에 있다.
 *
 * 판별은 "머리말 + 콜론" 형태만 인정한다. 본문이 Warning 으로 시작하는
 * 평범한 인용구까지 빨갛게 칠하지 않으려는 것이다.
 */
const WARN_HEAD =
  /^\s*(critical\s+warning|warning|terminal\s+update|important\s+update|alert|caution|note|heads\s+up|주의|경고|알림)\s*[:：]/i

/** 중첩된 자식에서 글자만 뽑는다(<strong> 안에 머리말이 들어 있다). */
function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (typeof node === 'object' && 'props' in node) {
    return textOf((node as { props?: { children?: ReactNode } }).props?.children)
  }
  return ''
}

export function Blockquote({ children }: { children?: ReactNode }) {
  const isWarning = WARN_HEAD.test(textOf(children).trimStart())
  return (
    <blockquote className={isWarning ? 'is-callout-warn' : undefined}>
      {children}
    </blockquote>
  )
}
