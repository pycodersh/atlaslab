'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bookmark, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { EDITOR_NOTES, TOTAL_NOTES } from '@/data/editor-notes'
import { markNoteRead, isNoteRead, getReadCount } from '@/lib/editor/storage'
import { EditorIllustration } from '@/components/EditorIllustration'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(sec: number): string {
  if (sec < 60) return `${sec} sec`
  return `${Math.round(sec / 60)} min`
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EditorNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params)
  const router = useRouter()
  const id = Number(idStr)

  const note = EDITOR_NOTES.find(n => n.id === id)

  const [readCount, setReadCount]   = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [visible, setVisible]       = useState(false)

  useEffect(() => {
    if (!note) return
    setReadCount(getReadCount())
    setBookmarked(isNoteRead(note.id))
    // mark read after 3s
    const t = setTimeout(() => {
      markNoteRead(note.id)
      setReadCount(getReadCount())
    }, 3000)
    const t2 = setTimeout(() => setVisible(true), 60)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [note])

  if (!note) {
    return (
      <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--pb)' }}>
        <p style={{ color:'var(--pm)', fontSize:14 }}>Note not found.</p>
      </div>
    )
  }

  const prevId = id > 1 ? id - 1 : null
  const nextId = id < TOTAL_NOTES ? id + 1 : null
  const progress = readCount / TOTAL_NOTES

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--pb)',
      opacity: visible ? 1 : 0,
      transition: 'opacity .6s ease-out',
    }}>

      {/* ── Top Bar ────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'var(--pnav)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--pd)',
        padding: '0 16px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* back */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', padding:4 }}
        >
          <ArrowLeft style={{ width:16, height:16, color:'var(--pt)' }} strokeWidth={2} />
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.06em', color:'var(--pt)' }}>
            Editor&apos;s Note
          </span>
        </button>

        {/* right icons */}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:14 }}>
          <button
            type="button"
            onClick={() => { markNoteRead(note.id); setBookmarked(true) }}
            style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}
          >
            <Bookmark
              style={{ width:16, height:16, color: bookmarked ? 'var(--pa)' : 'var(--pm)' }}
              fill={bookmarked ? 'var(--pa)' : 'none'}
              strokeWidth={2}
            />
          </button>
          <button
            type="button"
            onClick={() => { if (navigator.share) navigator.share({ title: note.title, text: note.oneThingToRemember }) }}
            style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}
          >
            <Share2 style={{ width:15, height:15, color:'var(--pm)' }} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Progress row ────────────────────────────────────────────────── */}
      <div style={{ padding:'12px 20px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'var(--pa)', letterSpacing:'0.04em' }}>
            {String(note.id).padStart(2,'0')} / {TOTAL_NOTES}
          </span>
          <span style={{ fontSize:11, color:'var(--pm)' }}>
            Read time · {fmtTime(note.readTimeSec)}
          </span>
        </div>
        {/* progress bar */}
        <div style={{ height:2, background:'var(--pd)', borderRadius:2, overflow:'hidden' }}>
          <div style={{
            height:'100%',
            width: `${Math.max(progress*100, 2)}%`,
            background: 'var(--pa)',
            borderRadius: 2,
            transition: 'width .6s ease-out',
          }} />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px 100px' }}>

        {/* Part label */}
        <p style={{
          marginTop: 28,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.24em',
          color: 'var(--pa)',
          marginBottom: 4,
        }}>
          PART {note.part} — {note.partTitle.toUpperCase()}
        </p>

        {/* Illustration */}
        <div style={{ margin:'20px auto 28px', maxWidth:180 }}>
          <EditorIllustration type={note.illustration} />
        </div>

        {/* Title */}
        <h1
          className="font-playfair"
          style={{
            fontSize: 'clamp(1.7rem, 7vw, 2.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--pt)',
            margin: '0 0 24px',
            letterSpacing: '-0.01em',
          }}
        >
          {note.title}
        </h1>

        {/* Body */}
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {note.body.map((para, i) => (
            <p key={i} style={{
              fontSize: 15.5,
              lineHeight: 1.75,
              color: i === 1 && para.length < 30 ? 'var(--pt)' : 'var(--pt2)',
              fontWeight: i === 1 && para.length < 30 ? 700 : 400,
              margin: 0,
              fontStyle: i === 1 && para.length < 30 ? 'italic' : 'normal',
            }}>
              {para}
            </p>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height:1, background:'var(--pd)', margin:'36px 0 28px' }} />

        {/* Research Behind This */}
        <div>
          <p style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: 'var(--pa)',
            margin: '0 0 18px',
          }}>
            RESEARCH BEHIND THIS
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {note.research.map((r, i) => (
              <div key={i} style={{
                padding: '14px 16px',
                background: 'var(--pc)',
                borderRadius: 12,
                borderLeft: '3px solid var(--pa)',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                  <p style={{ margin:0, fontSize:12, fontWeight:700, color:'var(--pt)' }}>{r.author}</p>
                  <span style={{ fontSize:10, color:'var(--pm)', marginLeft:8, flexShrink:0 }}>{r.year}</span>
                </div>
                <p style={{ margin:'0 0 6px', fontSize:11, fontStyle:'italic', color:'var(--pm)' }}>
                  {r.title}
                </p>
                <p style={{ margin:0, fontSize:12, lineHeight:1.6, color:'var(--pt2)' }}>
                  {r.brief}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:'var(--pd)', margin:'32px 0 28px' }} />

        {/* One Thing to Remember */}
        <div style={{
          padding: '24px 22px',
          background: 'var(--pal)',
          borderRadius: 16,
          border: '1px solid var(--pacb)',
        }}>
          <p style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: 'var(--pa)',
            margin: '0 0 12px',
          }}>
            ONE THING TO REMEMBER
          </p>
          <p
            className="font-playfair"
            style={{
              fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
              fontWeight: 800,
              fontStyle: 'italic',
              lineHeight: 1.3,
              color: 'var(--pa)',
              margin: 0,
            }}
          >
            {note.oneThingToRemember}
          </p>
        </div>

        {/* Prev / Next navigation */}
        <div style={{ display:'flex', gap:12, marginTop:32 }}>
          <button
            type="button"
            disabled={!prevId}
            onClick={() => prevId && router.push(`/editor/${prevId}`)}
            style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              padding:'13px 0',
              background: prevId ? 'var(--pc)' : 'transparent',
              border: `1px solid ${prevId ? 'var(--pd)' : 'var(--pd)'}`,
              borderRadius:12, cursor: prevId ? 'pointer' : 'not-allowed', opacity: prevId ? 1 : 0.35,
              transition:'opacity .2s',
            }}
          >
            <ChevronLeft style={{width:14,height:14,color:'var(--pm)'}} strokeWidth={2} />
            <span style={{fontSize:12,fontWeight:600,color:'var(--pm)'}}>Prev</span>
          </button>
          <button
            type="button"
            disabled={!nextId}
            onClick={() => nextId && router.push(`/editor/${nextId}`)}
            style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              padding:'13px 0',
              background: nextId ? 'var(--pa)' : 'var(--pc)',
              border: `1px solid ${nextId ? 'var(--pa)' : 'var(--pd)'}`,
              borderRadius:12, cursor: nextId ? 'pointer' : 'not-allowed', opacity: nextId ? 1 : 0.5,
              transition:'opacity .2s',
            }}
          >
            <span style={{fontSize:12,fontWeight:700,color: nextId ? '#fff' : 'var(--pm)'}}>
              {nextId ? 'Next Note' : 'All Done'}
            </span>
            {nextId && <ChevronRight style={{width:14,height:14,color:'rgba(255,255,255,.8)'}} strokeWidth={2} />}
          </button>
        </div>
      </div>
    </div>
  )
}
