import type { ReactNode } from 'react'

/**
 * 글 본문의 코드·고정 표기는 자동 번역(Google Translate)에서 빼야 한다.
 * MDX 의 code / pre 를 가로채 translate="no" 를 붙인다(원고는 고치지 않는다).
 * 코드 펜스의 className(language-*)은 그대로 이어 준다.
 */
type Props = { children?: ReactNode; className?: string }

export function NoTranslateCode({ children, className }: Props) {
  return <code translate="no" className={['notranslate', className].filter(Boolean).join(' ')}>{children}</code>
}

export function NoTranslatePre({ children, className }: Props) {
  return <pre translate="no" className={['notranslate', className].filter(Boolean).join(' ')}>{children}</pre>
}
