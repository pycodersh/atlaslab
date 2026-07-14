import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

function generateSlug(text: string, locale: string): string {
  if (locale === 'ko') {
    return text
      .replace(/[^가-힣a-z0-9\s]/gi, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 60)
  }
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

async function generateBlogPost(
  patternText: string,
  meaning: string,
  examples: string[],
  storyTitle: string | null,
  locale: 'en' | 'ko'
): Promise<{ title: string; description: string; content: string; tags: string[] }> {
  const prompt = locale === 'en' ? `
You are a blog writer for Patto, an English pattern learning app.
Write an SEO-optimized blog post teaching this English pattern:

Pattern: "${patternText}"
Meaning: "${meaning}"
Example sentences:
${examples.map((e, i) => `${i + 1}. ${e}`).join('\n')}
${storyTitle ? `Related story: "${storyTitle}"` : ''}

Write a blog post (600-800 words) that:
1. Has an engaging title with the pattern included (for SEO)
2. Explains when and how to use this pattern naturally
3. Shows 3-4 real-life example situations
4. Mentions that Patto teaches patterns through stories and spaced repetition
5. Ends with a CTA to try Patto at https://atlaslabstudios.com/patto/home

Return ONLY valid JSON (no markdown, no backticks):
{
  "title": "...",
  "description": "...(meta description, under 160 chars)",
  "content": "...(full markdown content)",
  "tags": ["pattern", "english", "...2 more relevant tags"]
}
` : `
당신은 영어 패턴 학습 앱 Patto의 블로그 작성자입니다.
이 영어 패턴을 가르치는 SEO 최적화된 블로그 글을 작성하세요:

패턴: "${patternText}"
의미: "${meaning}"
예문:
${examples.map((e, i) => `${i + 1}. ${e}`).join('\n')}
${storyTitle ? `관련 스토리: "${storyTitle}"` : ''}

600-800자 분량의 블로그 글을 작성하세요:
1. 패턴이 포함된 흥미로운 제목 (SEO용)
2. 이 패턴을 언제, 어떻게 자연스럽게 사용하는지 설명
3. 실생활 예시 상황 3-4개
4. Patto가 스토리와 반복학습으로 패턴을 가르친다는 내용 포함
5. https://atlaslabstudios.com/patto/home 에서 Patto 시작하기 CTA로 마무리

반드시 유효한 JSON만 반환하세요 (마크다운, 백틱 없이):
{
  "title": "...",
  "description": "...(메타 설명, 160자 이내)",
  "content": "...(전체 마크다운 내용)",
  "tags": ["패턴", "영어", "...관련 태그 2개 더"]
}
`

  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabase()

    // First get already-processed pattern IDs
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('pattern_id')
      .eq('locale', 'en')
      .not('pattern_id', 'is', null)

    const processedIds = (existingPosts || [])
      .map(p => p.pattern_id)
      .filter(Boolean)

    // Then query patterns excluding those IDs
    let query = supabase
      .from('patterns')
      .select(`
        id,
        order_index,
        pattern_translations!inner(pattern_text, meaning, ui_lang),
        examples(sentence, difficulty, example_translations(translation, ui_lang))
      `)
      .eq('is_published', true)
      .eq('pattern_translations.ui_lang', 'en')
      .order('order_index')
      .limit(5)

    if (processedIds.length > 0) {
      query = query.not('id', 'in', `(${processedIds.join(',')})`)
    }

    const { data: patterns, error: patternsError } = await query

    if (patternsError) throw patternsError
    if (!patterns || patterns.length === 0) {
      return NextResponse.json({ message: 'No new patterns to process' })
    }

    const results = []
    const publishHours = [9, 11, 13, 15, 17] // KST

    for (const pattern of patterns) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const translation = Array.isArray(pattern.pattern_translations)
        ? pattern.pattern_translations[0]
        : pattern.pattern_translations

      const patternText = (translation as any)?.pattern_text || ''
      const meaning = (translation as any)?.meaning || ''

      const exampleSentences = ((pattern.examples || []) as any[])
        .filter(e => e.difficulty === 'normal')
        .slice(0, 3)
        .map(e => e.sentence)

      const { data: storyData } = await supabase
        .from('story_patterns')
        .select('stories(story_translations(title, ui_lang))')
        .eq('pattern_id', pattern.id)
        .limit(1)
        .single()

      const storyTitle = (storyData as any)?.stories?.story_translations
        ?.find((t: any) => t.ui_lang === 'en')?.title || null

      const today = new Date()
      today.setHours(publishHours[patterns.indexOf(pattern)], 0, 0, 0)
      const publishedAt = today.toISOString()

      for (const locale of ['en', 'ko'] as const) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000))

          const post = await generateBlogPost(patternText, meaning, exampleSentences, storyTitle, locale)
          const slug = generateSlug(post.title, locale)

          const { error: insertError } = await supabase
            .from('blog_posts')
            .upsert({
              pattern_id: pattern.id,
              locale,
              slug,
              title: post.title,
              description: post.description,
              content: post.content,
              tags: post.tags,
              published_at: publishedAt,
            }, { onConflict: 'pattern_id,locale' })

          if (insertError) throw insertError
          results.push({ pattern_id: pattern.id, locale, title: post.title, status: 'success' })
        } catch (err) {
          results.push({ pattern_id: pattern.id, locale, status: 'error', error: String(err) })
        }
      }
    }

    return NextResponse.json({ success: true, processed: results })
  } catch (error) {
    console.error('Blog generation error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
