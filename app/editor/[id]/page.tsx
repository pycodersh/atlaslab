'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { EDITOR_NOTES, TOTAL_NOTES } from '@/data/editor-notes'
import { markNoteRead, isNoteRead, getReadCount } from '@/lib/editor/storage'
import { EditorIllustration } from '@/components/EditorIllustration'
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
      if (dx < 0) onLeft()   // swipe left  → next
      else        onRight()  // swipe right → prev
    }
    startX.current = null
  }
  return { onTouchStart, onTouchEnd }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EditorNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params)
  const router = useRouter()
  const id = Number(idStr)

  const note = EDITOR_NOTES.find(n => n.id === id)
  const t = useT()

  const [readCount,  setReadCount]  = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [visible,    setVisible]    = useState(false)

  useEffect(() => {
    if (!note) return
    setVisible(false)
    setReadCount(getReadCount())
    setBookmarked(isNoteRead(note.id))
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

  if (!note) {
    return (
      <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--pb)' }}>
        <p style={{ color:'var(--pm)', fontSize:14 }}>Note not found.</p>
      </div>
    )
  }

  const progress = readCount / TOTAL_NOTES

  return (
    <div
      style={{
        height: '100dvh',
        overflowY: 'auto',
        background: 'var(--pb)',
        opacity: visible ? 1 : 0,
        transition: 'opacity .55s ease-out',
      }}
      {...swipe}
    >
      {/* ── Global TopNav ─────────────────────────────────────────────── */}
      <TopNav />

      {/* ── Progress strip ────────────────────────────────────────────── */}
      <div style={{ padding: `${NAV_HEIGHT + 14}px 22px 0` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
          <span style={{ fontSize:10, fontWeight:700, color:'var(--pa)', letterSpacing:'0.06em' }}>
            {String(note.id).padStart(2,'0')} / {TOTAL_NOTES}
          </span>
          <span style={{ fontSize:10, color:'var(--pm)' }}>
            {fmtTime(note.readTimeSec)}
          </span>
        </div>
        {/* 1px ultra-thin bar */}
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
          {note.title}
        </h1>

        {/* Illustration */}
        <div style={{ margin: '22px auto 26px', maxWidth: 160 }}>
          <EditorIllustration type={note.illustration} />
        </div>

        {/* Bookmark + Share inline */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
          <button
            type="button"
            onClick={() => { markNoteRead(note.id); setBookmarked(true) }}
            style={{ background:'none', border:'none', cursor:'pointer', padding:'4px 0', display:'flex', alignItems:'center', gap:5 }}
          >
            <Bookmark
              style={{ width:14, height:14, color: bookmarked ? 'var(--pa)' : 'var(--pm2)' }}
              fill={bookmarked ? 'var(--pa)' : 'none'}
              strokeWidth={2}
            />
            <span style={{ fontSize:10, color: bookmarked ? 'var(--pa)' : 'var(--pm2)', fontWeight:600 }}>
              {bookmarked ? t('editor_collect') : t('editor_collect_btn')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => { if (navigator.share) navigator.share({ title: note.title, text: note.oneThingToRemember }) }}
            style={{ background:'none', border:'none', cursor:'pointer', padding:'4px 0', display:'flex', alignItems:'center', gap:5 }}
          >
            <Share2 style={{ width:13, height:13, color:'var(--pm2)' }} strokeWidth={2} />
            <span style={{ fontSize:10, color:'var(--pm2)', fontWeight:600 }}>{t('editor_share')}</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {note.body.map((para, i) => (
            <p key={i} style={{
              fontSize: 15.5,
              lineHeight: 1.8,
              color: i === 1 && para.length < 30 ? 'var(--pt)' : 'var(--pt2)',
              fontWeight: i === 1 && para.length < 30 ? 700 : 400,
              fontStyle: i === 1 && para.length < 30 ? 'italic' : 'normal',
              margin: 0,
            }}>
              {para}
            </p>
          ))}
        </div>

        {/* ── One Thing to Remember ──────────────────────────────────── */}
        <div style={{ margin: '52px 0 44px' }}>
          <p style={{
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: '0.28em',
            color: 'var(--pa)',
            margin: '0 0 16px',
          }}>
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
            {note.oneThingToRemember}
          </p>
        </div>

        {/* ── Research Behind This ──────────────────────────────────── */}
        <div style={{ borderTop: '1px solid var(--pd)', paddingTop: 28 }}>
          <p style={{
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: '0.28em',
            color: 'var(--pm)',
            margin: '0 0 20px',
          }}>
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
                  {r.brief}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Swipe hint (mobile) + Arrow nav (all) ─────────────────── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 48,
          paddingTop: 20,
          borderTop: '1px solid var(--pd)',
        }}>
          <button
            type="button"
            onClick={goPrev}
            disabled={!prevId}
            style={{
              background: 'none', border: 'none', cursor: prevId ? 'pointer' : 'default',
              opacity: prevId ? 1 : 0.2,
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0',
            }}
          >
            <ChevronLeft style={{ width:16, height:16, color:'var(--pm)' }} strokeWidth={1.5} />
            <span style={{ fontSize:11, color:'var(--pm)', fontWeight:500 }}>
              {prevId ? `${String(prevId).padStart(2,'0')}` : ''}
            </span>
          </button>

          <span style={{ fontSize:10, color:'var(--pm2)', letterSpacing:'0.08em' }}>
            ← swipe →
          </span>

          <button
            type="button"
            onClick={goNext}
            disabled={!nextId}
            style={{
              background: 'none', border: 'none', cursor: nextId ? 'pointer' : 'default',
              opacity: nextId ? 1 : 0.2,
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0',
            }}
          >
            <span style={{ fontSize:11, color:'var(--pm)', fontWeight:500 }}>
              {nextId ? `${String(nextId).padStart(2,'0')}` : 'Done'}
            </span>
            <ChevronRight style={{ width:16, height:16, color:'var(--pm)' }} strokeWidth={1.5} />
          </button>
        </div>

      </article>
    </div>
  )
}
