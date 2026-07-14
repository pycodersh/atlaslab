/**
 * Schedule published_at for all draft blog posts
 *
 * Order:
 *   1. Editor tip posts (slug LIKE '%-tip%')
 *   2. Pattern posts (pattern_id IS NOT NULL)
 *
 * 5 posts per day at 09/11/13/15/17 KST (00/02/04/06/08 UTC)
 *
 * Run: npx tsx scripts/schedule-blog-posts.ts
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

// KST hours → UTC hours (subtract 9)
const UTC_HOURS = [0, 2, 4, 6, 8] // 09/11/13/15/17 KST

function buildTimestamp(baseDate: Date, dayOffset: number, slotIndex: number): string {
  const d = new Date(baseDate)
  d.setUTCDate(d.getUTCDate() + dayOffset)
  d.setUTCHours(UTC_HOURS[slotIndex], 0, 0, 0)
  return d.toISOString()
}

async function main() {
  console.log('═══ Schedule Blog Posts ═══\n')

  // Today at midnight UTC
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const startDate = today

  // ── Step 1: Editor tip posts ────────────────────────────────────────────────
  const { data: tipPosts, error: tipErr } = await supabase
    .from('blog_posts')
    .select('id, slug, locale, title')
    .like('slug', '%-tip%')
    .order('slug')
    .order('locale')

  if (tipErr) throw new Error(`Failed to fetch tip posts: ${tipErr.message}`)
  console.log(`Found ${tipPosts?.length ?? 0} editor tip posts`)

  // Sort: EN before KO for same slug (so paired EN/KO go out same day)
  const sortedTips = (tipPosts ?? []).sort((a, b) => {
    const slugCmp = a.slug.localeCompare(b.slug)
    if (slugCmp !== 0) return slugCmp
    return a.locale.localeCompare(b.locale)
  })

  // ── Step 2: Pattern posts ───────────────────────────────────────────────────
  const { data: patternPosts, error: patErr } = await supabase
    .from('blog_posts')
    .select('id, slug, locale, title')
    .not('pattern_id', 'is', null)
    .order('slug')
    .order('locale')

  if (patErr) throw new Error(`Failed to fetch pattern posts: ${patErr.message}`)
  console.log(`Found ${patternPosts?.length ?? 0} pattern posts`)

  const allPosts = [...sortedTips, ...(patternPosts ?? [])]
  console.log(`Total posts to schedule: ${allPosts.length}`)

  // Assign timestamps: 5 per day, round-robin across UTC_HOURS slots
  const updates: { id: string; published_at: string }[] = []
  for (let i = 0; i < allPosts.length; i++) {
    const dayOffset = Math.floor(i / 5)
    const slotIndex = i % 5
    const timestamp = buildTimestamp(startDate, dayOffset, slotIndex)
    updates.push({ id: allPosts[i].id, published_at: timestamp })
  }

  const totalDays = Math.ceil(allPosts.length / 5)
  const lastDate = new Date(startDate)
  lastDate.setUTCDate(lastDate.getUTCDate() + totalDays - 1)

  console.log(`\nSchedule: ${startDate.toISOString().slice(0, 10)} → ${lastDate.toISOString().slice(0, 10)} (${totalDays} days)`)
  console.log('Updating...\n')

  // Batch update in chunks of 50
  let successCount = 0
  const failures: string[] = []
  const CHUNK = 50

  for (let i = 0; i < updates.length; i += CHUNK) {
    const chunk = updates.slice(i, i + CHUNK)
    for (const u of chunk) {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published_at: u.published_at })
        .eq('id', u.id)

      if (error) {
        failures.push(`id ${u.id}: ${error.message}`)
      } else {
        successCount++
      }
    }
    process.stdout.write(`\r  Progress: ${Math.min(i + CHUNK, updates.length)}/${updates.length}`)
  }

  console.log('\n\n═══ Summary ═══════════════════════════════════')
  console.log(`Editor tip posts : ${sortedTips.length}`)
  console.log(`Pattern posts    : ${patternPosts?.length ?? 0}`)
  console.log(`Total scheduled  : ${successCount}`)
  console.log(`Schedule span    : ${totalDays} days`)
  console.log(`Start            : ${startDate.toISOString().slice(0, 10)}`)
  console.log(`End              : ${lastDate.toISOString().slice(0, 10)}`)

  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`)
    failures.forEach(f => console.log('  -', f))
  } else {
    console.log('\n✓ No failures.')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
