import { createClient } from '@supabase/supabase-js'
import fs from 'fs'; import path from 'path'
const envPath = path.resolve(process.cwd(), '.env.local')
const raw = fs.readFileSync(envPath, 'utf-8').replace(/^﻿/, '')
for (const line of raw.split(/\r?\n/)) {
  const t = line.trim(); if (!t || t.startsWith('#')) continue
  const eq = t.indexOf('='); if (eq < 0) continue
  process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const now = new Date().toISOString()
console.log('Now (UTC):', now)
async function run() {
  const { count: enAll } = await db.from('blog_posts').select('*', { count: 'exact', head: true }).eq('locale', 'en').lte('published_at', now)
  const { count: koAll } = await db.from('blog_posts').select('*', { count: 'exact', head: true }).eq('locale', 'ko').lte('published_at', now)
  const { count: kpEn }  = await db.from('blog_posts').select('*', { count: 'exact', head: true }).eq('locale', 'en').eq('app', 'k-patto').lte('published_at', now)
  console.log('EN published (no app filter):', enAll, '→ pages:', Math.ceil((enAll||0)/10))
  console.log('KO published (no app filter):', koAll, '→ pages:', Math.ceil((koAll||0)/10))
  console.log('k-patto EN published:', kpEn)
}
run().catch(console.error)
