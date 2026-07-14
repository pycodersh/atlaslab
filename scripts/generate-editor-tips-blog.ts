/**
 * Generate EN + KO blog posts for all 24 editor tips
 * Reads from data/editor-notes.ts and data/editor-tips-translations.ts
 * Inserts into blog_posts (pattern_id: NULL, published_at: NULL)
 *
 * Run: npx tsx scripts/generate-editor-tips-blog.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { EDITOR_NOTES } from '../data/editor-notes'
import { editorTipTranslations } from '../data/editor-tips-translations'

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf-8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 0) continue
    process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70)
}

function generateEnContent(
  tipNumber: number,
  partTitle: string,
  title: string,
  body: string[],
  researchBriefs: string[],
  oneThingToRemember: string
): string {
  const bodyParagraphs = body.map(para => para.trim()).join('\n\n')

  const researchSection = researchBriefs.length > 0
    ? `\n\n---\n\n## What Research Says\n\n${researchBriefs.map(r => `> ${r}`).join('\n\n')}`
    : ''

  return `## Editor's Tip #${tipNumber} — ${partTitle}

Every English learner hits a wall. You study, you practice, you put in the time — and yet something isn't clicking. This tip is about one of the most common sticking points: **${title.toLowerCase()}**

Understanding this will change how you approach your daily practice.

---

## The Core Insight

${bodyParagraphs}

---

## Why This Matters for Pattern Learning

Language patterns don't exist in a vacuum. How you listen, speak, read, and think about English all feed into how quickly patterns become automatic. This tip targets one of those underlying habits — the kind that most study methods never address directly.

When you practice with Patto, you're not just memorizing sentences. You're training your brain to produce natural English in real situations. Tips like this one help you make the most of every repetition.${researchSection}

---

## One Thing to Remember

> **${oneThingToRemember}**

Write this down. Say it before your next study session. Come back to it when you feel stuck.

---

Practice with Patto's story-based method. [Start for free →](/patto/home)`
}

function generateKoContent(
  tipNumber: number,
  partTitle: string,
  title: string,
  body: string[],
  researchBrief: string | null,
  oneThingToRemember: string
): string {
  const bodyParagraphs = body.map(para => para.trim()).join('\n\n')

  const researchSection = researchBrief
    ? `\n\n---\n\n## 연구에서 뭐라고 하나요?\n\n> ${researchBrief}`
    : ''

  return `## 에디터 팁 #${tipNumber} — ${partTitle}

영어 공부를 하다 보면 분명히 노력하고 있는데 뭔가 제자리걸음인 느낌이 드는 순간이 있습니다. 이 팁은 많은 학습자들이 공통으로 막히는 부분을 다룹니다: **${title}**

이 내용을 이해하면 매일의 영어 연습 방식이 달라집니다.

---

## 핵심 포인트

${bodyParagraphs}

---

## 패턴 학습에서 왜 중요할까요?

언어 패턴은 따로 존재하지 않습니다. 듣기, 말하기, 읽기, 그리고 영어를 생각하는 방식이 모두 패턴이 자동화되는 속도에 영향을 줍니다. 이 팁은 그런 기저 습관 중 하나를 다루는데, 대부분의 학습법에서는 잘 다루지 않는 부분입니다.

패토에서 연습할 때 단순히 문장을 암기하는 것이 아닙니다. 실제 상황에서 자연스럽게 영어가 나오도록 뇌를 훈련하는 것입니다. 이런 팁들이 매번 반복 연습을 더 효과적으로 만들어줍니다.${researchSection}

---

## 꼭 기억하세요

> **${oneThingToRemember}**

이 문장을 적어두세요. 다음 학습 세션 전에 소리 내어 읽어보세요. 막힐 때마다 다시 꺼내보세요.

---

패토의 스토리 기반 학습으로 연습해보세요. [무료로 시작하기 →](/patto/home)`
}

async function main() {
  console.log('═══ Generate Editor Tips Blog Posts ═══\n')

  // Build lookup map: noteId → EN translation
  const enTransMap = new Map(
    editorTipTranslations.map(t => [t.noteId, t.translations.en])
  )

  let successCount = 0
  const failures: string[] = []

  for (const note of EDITOR_NOTES) {
    const enTrans = enTransMap.get(note.id)
    if (!enTrans) {
      failures.push(`Tip #${note.id}: no EN translation found`)
      continue
    }

    const koBody = note.body.ko ?? note.body.en
    const koTitle = note.title.ko ?? note.title.en
    const koOneThingToRemember = note.oneThingToRemember.ko ?? note.oneThingToRemember.en
    const koResearchBrief = note.research[0]?.brief.ko ?? note.research[0]?.brief.en ?? null

    // ── EN post ──────────────────────────────────────────────────────────────
    const enTitle = `${enTrans.title} — A Guide for English Learners`
    const enSlug = slugify(enTrans.title) + '-tip'
    const enContent = generateEnContent(
      note.id,
      note.partTitle,
      enTrans.title,
      enTrans.body,
      enTrans.researchBriefs,
      enTrans.oneThingToRemember
    )

    const { error: enErr } = await supabase
      .from('blog_posts')
      .upsert(
        {
          pattern_id: null,
          locale: 'en',
          slug: enSlug,
          title: enTitle,
          description: enTrans.body[0]?.slice(0, 160) ?? enTitle,
          content: enContent,
          tags: ['learning-tips', 'english', 'study-method'],
          published_at: null,
        },
        { onConflict: 'slug,locale' }
      )

    if (enErr) {
      failures.push(`Tip #${note.id} EN: ${enErr.message}`)
    } else {
      console.log(`✓ EN [${note.id}] ${enTrans.title}`)
      successCount++
    }

    // ── KO post ──────────────────────────────────────────────────────────────
    const koTitleFull = `${koTitle} — 영어 학습자를 위한 가이드`
    const koSlug = slugify(enTrans.title) + '-tip-ko'
    const koContent = generateKoContent(
      note.id,
      note.partTitle,
      koTitle,
      koBody,
      koResearchBrief,
      koOneThingToRemember
    )

    const { error: koErr } = await supabase
      .from('blog_posts')
      .upsert(
        {
          pattern_id: null,
          locale: 'ko',
          slug: koSlug,
          title: koTitleFull,
          description: koBody[0]?.slice(0, 160) ?? koTitleFull,
          content: koContent,
          tags: ['학습팁', '영어', '공부법'],
          published_at: null,
        },
        { onConflict: 'slug,locale' }
      )

    if (koErr) {
      failures.push(`Tip #${note.id} KO: ${koErr.message}`)
    } else {
      console.log(`✓ KO [${note.id}] ${koTitle}`)
      successCount++
    }
  }

  console.log('\n═══ Done ═══════════════════════════════════')
  console.log(`✓ Inserted: ${successCount} posts`)
  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`)
    failures.forEach(f => console.log('  -', f))
  }
}

main().catch(e => { console.error(e); process.exit(1) })
