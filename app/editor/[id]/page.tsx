'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { EDITOR_NOTES, TOTAL_NOTES, type LangMap } from '@/data/editor-notes'
import { markNoteRead, getReadCount } from '@/lib/editor/storage'
import { EditorIllustration } from '@/components/EditorIllustration'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useT } from '@/hooks/useT'

function fmtTime(sec: number): string {
  if (sec < 60) return `${sec} sec`
  return `${Math.round(sec / 60)} min`
}

// ── Swipe hook ────────────────────────────────────────────────────────────────
function useSwipe(onLeft: () => void, onRight: () => void) {
  const startX = useRef<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > 60) {
      if (dx < 0) onLeft()
      else        onRight()
    }
    startX.current = null
  }
  return { onTouchStart, onTouchEnd }
}

// ── Note Picker ───────────────────────────────────────────────────────────────
const ITEM_H  = 44
const VISIBLE = 5
const PAD     = Math.floor(VISIBLE / 2) * ITEM_H

type NotePickerProps = {
  currentId: number
  lang: keyof LangMap<unknown>
  onSelect: (id: number) => void
  onClose: () => void
}

function NotePicker({ currentId, lang, onSelect, onClose }: NotePickerProps) {
  const listRef   = useRef<HTMLDivElement>(null)
  const [selId, setSelId] = useState(currentId)

  useEffect(() => {
    if (!listRef.current) return
    const idx = EDITOR_NOTES.findIndex(n => n.id === currentId)
    if (idx >= 0) listRef.current.scrollTop = idx * ITEM_H
  }, [currentId])

  function handleScroll() {
    if (!listRef.current) return
    const idx = Math.round(listRef.current.scrollTop / ITEM_H)
    const clamped = Math.min(Math.max(idx, 0), EDITOR_NOTES.length - 1)
    const note = EDITOR_NOTES[clamped]
    if (note) setSelId(note.id)
  }

  function scrollTo(id: number) {
    if (!listRef.current) return
    const idx = EDITOR_NOTES.findIndex(n => n.id === id)
    if (idx >= 0) listRef.current.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' })
    setSelId(id)
  }

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.4)', backdropFilter:'blur(2px)' }}
      onClick={onClose}
    >
      <div
        style={{ background:'var(--pb)', borderRadius:20, width:300, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.22)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Label */}
        <div style={{ padding:'16px 20px 4px', textAlign:'center' }}>
          <p style={{ fontSize:9, letterSpacing:'0.3em', color:'var(--pa)', fontWeight:700, margin:0 }}>
            SELECT TIP
          </p>
        </div>

        {/* Wheel */}
        <div style={{ position:'relative', height: ITEM_H * VISIBLE }}>
          <div style={{ position:'absolute', inset:'0 0 auto 0', height:PAD, background:`linear-gradient(to bottom, var(--pb) 30%, transparent)`, zIndex:10, pointerEvents:'none' }} />
          <div style={{ position:'absolute', inset:'auto 0 0 0', height:PAD, background:`linear-gradient(to top, var(--pb) 30%, transparent)`, zIndex:10, pointerEvents:'none' }} />
          <div style={{ position:'absolute', left:20, right:20, top:PAD, height:ITEM_H, borderTop:'1px solid var(--pd)', borderBottom:'1px solid var(--pd)', zIndex:10, pointerEvents:'none' }} />

          <div
            ref={listRef}
            style={{ height:'100%', overflowY:'scroll', scrollbarWidth:'none', scrollSnapType:'y mandatory', paddingTop:PAD, paddingBottom:PAD }}
            onScroll={handleScroll}
          >
            {EDITOR_NOTES.map(note => {
              const t = note.title[lang] ?? note.title.en
              const isActive = note.id === selId
              return (
                <div
                  key={note.id}
                  style={{ height:ITEM_H, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 20px', scrollSnapAlign:'center', cursor:'pointer' }}
                  onClick={() => scrollTo(note.id)}
                >
                  <span style={{ fontSize:12, textAlign:'center', lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical' }}>
                    <span style={{ color:'var(--pa)', fontWeight:700, marginRight:6 }}>{String(note.id).padStart(2,'0')}</span>
                    <span style={{ color: isActive ? 'var(--pt)' : 'var(--pm2)', fontWeight: isActive ? 600 : 400 }}>{t}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', borderTop:'1px solid var(--pd)' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex:1, padding:'14px 0', fontSize:13, color:'var(--pm)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => { onSelect(selId); onClose() }}
            style={{ flex:1, padding:'14px 0', fontSize:13, fontWeight:700, color:'var(--pa)', background:'none', border:'none', borderLeft:'1px solid var(--pd)', cursor:'pointer', fontFamily:'inherit' }}
          >
            선택
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EditorNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params)
  const router = useRouter()
  const id = Number(idStr)

  const note = EDITOR_NOTES.find(n => n.id === id)
  const t = useT()
  const { prefs } = usePreferences()
  const lang = prefs.appLang as keyof LangMap<unknown>

  const [readCount,   setReadCount]   = useState(0)
  const [visible,     setVisible]     = useState(false)
  const [pickerOpen,  setPickerOpen]  = useState(false)

  useEffect(() => {
    if (!note) return
    setVisible(false)
    setReadCount(getReadCount())
    const t1 = setTimeout(() => setVisible(true), 60)
    const t2 = setTimeout(() => {
      markNoteRead(note.id)
      setReadCount(getReadCount())
    }, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [note])

  const prevId = id > 1           ? id - 1 : null
  const nextId = id < TOTAL_NOTES ? id + 1 : null

  const goNext = () => { if (nextId) router.push(`/editor/${nextId}`) }
  const goPrev = () => { if (prevId) router.push(`/editor/${prevId}`) }

  const swipe = useSwipe(goNext, goPrev)

  const title = note ? (note.title[lang] ?? note.title.en) : ''
  const body  = note ? (note.body[lang]  ?? note.body.en)  : []
  const otr   = note ? (note.oneThingToRemember[lang] ?? note.oneThingToRemember.en) : ''

  if (!note) {
    return (
      <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--pb)' }}>
        <p style={{ color:'var(--pm)', fontSize:14 }}>Note not found.</p>
      </div>
    )
  }

  const progress = readCount / TOTAL_NOTES

  return (
    <>
      <div
        style={{ height:'100dvh', overflowY:'auto', background:'var(--pb)', opacity: visible ? 1 : 0, transition:'opacity .55s ease-out' }}
        {...swipe}
      >
        {/* ── Global TopNav ─────────────────────────────────────────────── */}
        <TopNav />

        {/* ── Progress strip ────────────────────────────────────────────── */}
        <div style={{ padding: `${NAV_HEIGHT + 14}px 22px 0` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>

            {/* Left: clickable note counter */}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 0', display:'flex', alignItems:'center', gap:4 }}
            >
              <span style={{ fontSize:10, fontWeight:700, color:'var(--pa)', letterSpacing:'0.06em' }}>
                {String(note.id).padStart(2,'0')} / {TOTAL_NOTES}
              </span>
            </button>

            {/* Right: read time + share icon */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:10, color:'var(--pm)' }}>
                {fmtTime(note.readTimeSec)}
              </span>
              <button
                type="button"
                onClick={() => { if (navigator.share) navigator.share({ title, text: otr }) }}
                style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 0', display:'flex', alignItems:'center' }}
                aria-label={t('editor_share')}
              >
                <Share2 style={{ width:13, height:13, color:'var(--pm2)' }} strokeWidth={2} />
              </button>
            </div>

          </div>

          {/* Progress bar */}
          <div style={{ height:1, background:'var(--pd)', borderRadius:1, overflow:'hidden' }}>
            <div style={{
              height:'100%',
              width: `${Math.max(progress * 100, 0.5)}%`,
              background: 'var(--pa)',
              transition: 'width .8s ease-out',
            }} />
          </div>
        </div>

        {/* ── Article ───────────────────────────────────────────────────── */}
        <article style={{ maxWidth: 480, margin: '0 auto', padding: '0 22px 100px' }}>

          {/* Title */}
          <h1 className="font-playfair" style={{
            fontSize: 'clamp(1.7rem, 7vw, 2.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: 'var(--pt)',
            margin: '32px 0 8px',
          }}>
            {title}
          </h1>

          {/* Illustration */}
          <div style={{ margin: '22px auto 26px', maxWidth: 160 }}>
            <EditorIllustration type={note.illustration} />
          </div>

          {/* Body */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {body.map((para, i) => (
              <p key={i} style={{
                fontSize: 15.5,
                lineHeight: 1.8,
                color: 'var(--pt2)',
                fontWeight: 400,
                margin: 0,
              }}>
                {para}
              </p>
            ))}
          </div>

          {/* ── One Thing to Remember ──────────────────────────────────── */}
          <div style={{ margin: '52px 0 44px' }}>
            <p style={{ fontSize:8.5, fontWeight:700, letterSpacing:'0.28em', color:'var(--pa)', margin:'0 0 16px' }}>
              ONE THING TO REMEMBER
            </p>
            <p className="font-playfair" style={{
              fontSize: 'clamp(1.35rem, 5.5vw, 1.7rem)',
              fontWeight: 800,
              fontStyle: 'italic',
              lineHeight: 1.35,
              color: 'var(--pa)',
              margin: 0,
            }}>
              {otr}
            </p>
          </div>

          {/* ── Research (hidden when empty) ───────────────────────────── */}
          {note.research.length > 0 && (
            <div style={{ borderTop:'1px solid var(--pd)', paddingTop:28 }}>
              <p style={{ fontSize:8.5, fontWeight:700, letterSpacing:'0.28em', color:'var(--pm)', margin:'0 0 20px' }}>
                RESEARCH BEHIND THIS
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {note.research.map((r, i) => (
                  <div key={i}>
                    <p style={{ margin:'0 0 3px', fontSize:11, fontWeight:700, color:'var(--pm)', letterSpacing:'0.02em' }}>
                      {r.author} ({r.year})
                    </p>
                    <p style={{ margin:'0 0 5px', fontSize:10, fontStyle:'italic', color:'var(--pm2)' }}>
                      {r.title}
                    </p>
                    <p style={{ margin:0, fontSize:12, lineHeight:1.65, color:'var(--pm)' }}>
                      {r.brief[lang] ?? r.brief.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Arrow nav ─────────────────────────────────────────────── */}
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            marginTop:48, paddingTop:20, borderTop:'1px solid var(--pd)',
          }}>
            <button
              type="button"
              onClick={goPrev}
              disabled={!prevId}
              style={{ background:'none', border:'none', cursor: prevId ? 'pointer' : 'default', opacity: prevId ? 1 : 0.2, display:'flex', alignItems:'center', gap:6, padding:'6px 0' }}
            >
              <ChevronLeft style={{ width:16, height:16, color:'var(--pm)' }} strokeWidth={1.5} />
              <span style={{ fontSize:11, color:'var(--pm)', fontWeight:500 }}>
                {prevId ? String(prevId).padStart(2,'0') : ''}
              </span>
            </button>

            <span style={{ fontSize:10, color:'var(--pm2)', letterSpacing:'0.08em' }}>← swipe →</span>

            <button
              type="button"
              onClick={goNext}
              disabled={!nextId}
              style={{ background:'none', border:'none', cursor: nextId ? 'pointer' : 'default', opacity: nextId ? 1 : 0.2, display:'flex', alignItems:'center', gap:6, padding:'6px 0' }}
            >
              <span style={{ fontSize:11, color:'var(--pm)', fontWeight:500 }}>
                {nextId ? String(nextId).padStart(2,'0') : 'Done'}
              </span>
              <ChevronRight style={{ width:16, height:16, color:'var(--pm)' }} strokeWidth={1.5} />
            </button>
          </div>

        </article>
      </div>

      {/* ── Note Picker modal ─────────────────────────────────────────────── */}
      {pickerOpen && (
        <NotePicker
          currentId={id}
          lang={lang}
          onSelect={newId => router.push(`/editor/${newId}`)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}
