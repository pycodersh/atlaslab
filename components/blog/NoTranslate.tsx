import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'

/**
 * 글 본문의 코드·고정 표기는 자동 번역(Google Translate)에서 빼야 한다.
 * MDX 의 code / pre 를 가로채 translate="no" 를 붙인다(원고는 고치지 않는다).
 * 코드 펜스의 className(language-*)은 그대로 이어 준다.
 */
type Props = { children?: ReactNode; className?: string }

const HANGUL = /[ㄱ-ㆎ가-힣]/

/** children 안의 글자를 이어 붙인다(중첩된 <strong> · <a> 안까지) */
function textOf(node: ReactNode): string {
  return Children.toArray(node).map(c => {
    if (typeof c === 'string' || typeof c === 'number') return String(c)
    if (isValidElement<{ children?: ReactNode }>(c)) return textOf(c.props.children)
    return ''
  }).join('')
}

/**
 * 한국어가 든 표 칸 · 굵게 · 기울임을 번역에서 뺀다.
 * 페이지 원문 언어가 영어라 구글 번역이 본문의 한국어 예문까지 '영어'로 보고 다시 번역해,
 * '몇 분이세요?' 가 '몇 가지 특징이 있나요?' 로, '캐리어' 가 '롤링' 으로 바뀐다. 가르치는 문장이 망가진다.
 * 한국어가 없는 칸 · 굵게(영어 설명)는 그대로 번역된다. 원고는 고치지 않는다.
 */
function keepKorean<T extends 'td' | 'th' | 'strong' | 'em'>(Tag: T) {
  function KeepKorean({ children, className, ...rest }: ComponentPropsWithoutRef<T>) {
    const korean = HANGUL.test(textOf(children as ReactNode))
    const Component = Tag as 'td'
    return (
      <Component
        {...(rest as ComponentPropsWithoutRef<'td'>)}
        className={[korean && 'notranslate', className].filter(Boolean).join(' ') || undefined}
        translate={korean ? 'no' : undefined}
      >
        {children as ReactNode}
      </Component>
    )
  }
  KeepKorean.displayName = `KeepKorean(${Tag})`
  return KeepKorean
}

export const KoreanTd = keepKorean('td')
export const KoreanTh = keepKorean('th')
export const KoreanStrong = keepKorean('strong')
export const KoreanEm = keepKorean('em')

export function NoTranslateCode({ children, className }: Props) {
  return <code translate="no" className={['notranslate', className].filter(Boolean).join(' ')}>{children}</code>
}

export function NoTranslatePre({ children, className }: Props) {
  return <pre translate="no" className={['notranslate', className].filter(Boolean).join(' ')}>{children}</pre>
}
