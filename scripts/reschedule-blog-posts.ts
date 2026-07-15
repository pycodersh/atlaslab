/**
 * Reschedule blog posts: 5 EN + 5 KO per day, random time KST 09:00~20:00
 * Keeps manually written posts (KEEP_SLUGS) untouched.
 *
 * Run: npx tsx scripts/reschedule-blog-posts.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

// Posts to keep with original dates (manually written)
const KEEP_SLUGS = [
  'patto-learning-loop',
  'patto-learning-loop-ko',
  'why-patterns-not-grammar',
  'why-patterns-not-grammar-ko',
  'science-of-spaced-repetition',
  'science-of-spaced-repetition-ko',
]

function randomUTCMinutes(): number {
  // KST 09:00~20:00 = UTC 00:00~11:00 = 0~660 minutes from UTC midnight
  return Math.floor(Math.random() * 660)
}

async function reschedule() {
  console.log('═══ Reschedule Blog Posts ═══\n')

  // Get all posts except manually written ones
  const { data: enPosts, error: enErr } = await supabase
    .from('blog_posts')
    .select('id, slug')
    .eq('locale', 'en')
    .not('slug', 'in', `(${KEEP_SLUGS.map(s => `'${s}'`).join(',')})`)
    .order('id')

  if (enErr) throw new Error(`EN fetch failed: ${enErr.message}`)

  const { data: koPosts, error: koErr } = await supabase
    .from('blog_posts')
    .select('id, slug')
    .eq('locale', 'ko')
    .not('slug', 'in', `(${KEEP_SLUGS.map(s => `'${s}'`).join(',')})`)
    .order('id')

  if (koErr) throw new Error(`KO fetch failed: ${koErr.message}`)

  console.log(`EN posts to schedule: ${(enPosts || []).length}`)
  console.log(`KO posts to schedule: ${(koPosts || []).length}`)

  const startDate = new Date('2026-07-15T00:00:00Z')
  const postsPerDay = 5

  // Schedule EN posts
  for (let i = 0; i < (enPosts || []).length; i++) {
    const post = enPosts![i]
    const dayOffset = Math.floor(i / postsPerDay)
    const date = new Date(startDate)
    date.setUTCDate(date.getUTCDate() + dayOffset)
    date.setUTCHours(0, randomUTCMinutes(), 0, 0)

    const { error } = await supabase
      .from('blog_posts')
      .update({ published_at: date.toISOString() })
      .eq('id', post.id)

    if (error) console.error(`  ✗ EN [${post.slug}]: ${error.message}`)
    if (i % 100 === 99) process.stdout.write(`\r  EN progress: ${i + 1}/${enPosts!.length}`)
  }
  console.log(`\r✓ Scheduled ${(enPosts || []).length} EN posts`)

  // Schedule KO posts
  for (let i = 0; i < (koPosts || []).length; i++) {
    const post = koPosts![i]
    const dayOffset = Math.floor(i / postsPerDay)
    const date = new Date(startDate)
    date.setUTCDate(date.getUTCDate() + dayOffset)
    date.setUTCHours(0, randomUTCMinutes(), 0, 0)

    const { error } = await supabase
      .from('blog_posts')
      .update({ published_at: date.toISOString() })
      .eq('id', post.id)

    if (error) console.error(`  ✗ KO [${post.slug}]: ${error.message}`)
    if (i % 100 === 99) process.stdout.write(`\r  KO progress: ${i + 1}/${koPosts!.length}`)
  }
  console.log(`\r✓ Scheduled ${(koPosts || []).length} KO posts`)

  // Summary
  const totalDays = Math.ceil((enPosts || []).length / postsPerDay)
  const endDate = new Date(startDate)
  endDate.setUTCDate(endDate.getUTCDate() + totalDays - 1)

  console.log(`\n📅 Schedule summary:`)
  console.log(`  Start     : 2026-07-15`)
  console.log(`  End       : ${endDate.toISOString().split('T')[0]}`)
  console.log(`  Total days: ${totalDays}`)
  console.log(`  EN/day    : ${postsPerDay}`)
  console.log(`  KO/day    : ${postsPerDay}`)
  console.log(`  Auto posts: ${(enPosts || []).length + (koPosts || []).length}`)
  console.log(`  Kept (manual): ${KEEP_SLUGS.length}`)
  console.log(`  Grand total : ${(enPosts || []).length + (koPosts || []).length + KEEP_SLUGS.length}`)
}

reschedule().catch(e => { console.error(e); process.exit(1) })
