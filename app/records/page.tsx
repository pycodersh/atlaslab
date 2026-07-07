'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Info, BookOpen, Layers } from 'lucide-react'
import { TopNav } from '@/components/TopNav'
import { usePreferences } from '@/contexts/PreferencesContext'
import { TAB_BAR_HEIGHT } from '@/components/MainTabBar'
import { LearningCalendar } from '@/components/LearningCalendar'
import {
  getAllRecords, getStreak, getActivityByDate,
  getStudiedTodayStoryCount, getReviewedTodayCount, todayStr,
  type LearningRecord,
} from '@/lib/srs/storage'
import {
  getFutureSchedule, getEnhancedDayDetail,
  type EnhancedDayDetail, type ScheduledDay,
} from '@/lib/srs/engine'

// ── Inline i18n for score/mastery strings ─────────────────────────────────────

type ScoreStrings = {
  scoreGrades: Array<{ grade: string; comment: string; color: string }>
  scoreInfoTitle: string
  scoreInfoDesc: string
  scoreCurrent: string
  masterySubtitle: string
  masteryDesc: string
  masterySteps: Array<{ step: string; desc: string; color: string }>
  masteryFooter: string
  masteryCardBottom: string
  masteryRingLabel: (n: number) => string
}

const SCORE_I18N: Record<string, ScoreStrings> = {
  ko: {
    scoreGrades: [
      { grade: 'Excellent!',      comment: '최고예요 🎉 이 루틴을 계속 유지하세요.',          color: '#2A7A3A' },
      { grade: 'Very Good',       comment: '훌륭해요! 장기 기억으로 자리잡고 있어요.',        color: '#4A7AC8' },
      { grade: 'Good',            comment: '잘 하고 있어요. 반복 복습이 기억을 강화시켜요.',   color: '#7A6AC8' },
      { grade: 'Building Up',     comment: '기초가 쌓이고 있어요. 복습 패턴을 유지해보세요.', color: '#C8913A' },
      { grade: 'Getting Started', comment: '좋은 시작이에요! 매일 조금씩 쌓아가면 돼요.',    color: '#C87A3A' },
      { grade: 'Just Starting',   comment: '첫 학습을 시작해보세요. 매일 조금씩이면 충분해요.', color: '#A0A0AA' },
    ],
    scoreInfoTitle: '장기 기억 점수',
    scoreInfoDesc: 'Story와 Pattern을 얼마나 반복 학습했는지 측정한 지수예요.',
    scoreCurrent: '현재 점수:',
    masterySubtitle: '각 회차별 패턴 도달 비율',
    masteryDesc: '전체 500개 패턴 중 몇 개가 각 복습 회차에 도달했는지 보여줘요. 회차가 높을수록 장기 기억에 가까워집니다.',
    masterySteps: [
      { step: '1회', desc: '패턴을 처음 학습한 단계', color: '#C87A3A' },
      { step: '2회', desc: '1차 복습 완료 — 단기 기억 강화', color: '#C8913A' },
      { step: '3회', desc: '2차 복습 — 중기 기억으로 전환', color: '#7A6AC8' },
      { step: '4회', desc: '3차 복습 — 장기 기억 진입', color: '#4A7AC8' },
      { step: '5회', desc: '완전 습득 — 장기 기억 정착', color: '#2A7A3A' },
    ],
    masteryFooter: '복습은 간격 반복(Spaced Repetition) 방식으로 진행돼요. 복습할수록 다음 복습 간격이 늘어나며 기억이 강화됩니다.',
    masteryCardBottom: '전체 학습 패턴 중 각 회차 도달 비율',
    masteryRingLabel: (n) => `${n}회`,
  },
  en: {
    scoreGrades: [
      { grade: 'Excellent!',      comment: 'Amazing 🎉 Keep up this routine!',                     color: '#2A7A3A' },
      { grade: 'Very Good',       comment: "Great work! It's moving into long-term memory.",        color: '#4A7AC8' },
      { grade: 'Good',            comment: 'Doing well. Repeated reviews strengthen memory.',       color: '#7A6AC8' },
      { grade: 'Building Up',     comment: 'Foundation is growing. Stay consistent!',               color: '#C8913A' },
      { grade: 'Getting Started', comment: 'Good start! A little every day adds up.',               color: '#C87A3A' },
      { grade: 'Just Starting',   comment: 'Start your first session. A little daily is enough.',   color: '#A0A0AA' },
    ],
    scoreInfoTitle: 'Long-term Memory Score',
    scoreInfoDesc: 'Measures how much you have repeatedly studied Stories and Patterns.',
    scoreCurrent: 'Current score:',
    masterySubtitle: 'Pattern completion rate per review round',
    masteryDesc: 'Shows how many of the 500 patterns have reached each review round. Higher rounds mean closer to long-term memory.',
    masterySteps: [
      { step: '1×', desc: 'First time learning the pattern', color: '#C87A3A' },
      { step: '2×', desc: '1st review done — short-term reinforcement', color: '#C8913A' },
      { step: '3×', desc: '2nd review — shifting to mid-term memory', color: '#7A6AC8' },
      { step: '4×', desc: '3rd review — entering long-term memory', color: '#4A7AC8' },
      { step: '5×', desc: 'Fully acquired — long-term memory settled', color: '#2A7A3A' },
    ],
    masteryFooter: 'Reviews follow Spaced Repetition. Each review extends the next interval, strengthening memory over time.',
    masteryCardBottom: 'Completion rate per review round across all learned patterns',
    masteryRingLabel: (n) => `${n}×`,
  },
  ja: {
    scoreGrades: [
      { grade: 'Excellent!',      comment: '素晴らしい 🎉 このペースを続けてください！',         color: '#2A7A3A' },
      { grade: 'Very Good',       comment: '素晴らしいです！長期記憶に定着しています。',           color: '#4A7AC8' },
      { grade: 'Good',            comment: 'よくできています。繰り返し復習で記憶が強化されます。', color: '#7A6AC8' },
      { grade: 'Building Up',     comment: '基礎が積み重なっています。復習を続けましょう。',       color: '#C8913A' },
      { grade: 'Getting Started', comment: '良いスタートです！毎日少しずつ積み上げましょう。',     color: '#C87A3A' },
      { grade: 'Just Starting',   comment: '最初の学習を始めましょう。毎日少しずつで十分です。',   color: '#A0A0AA' },
    ],
    scoreInfoTitle: '長期記憶スコア',
    scoreInfoDesc: 'ストーリーとパターンをどれだけ繰り返し学習したかを測る指標です。',
    scoreCurrent: '現在のスコア:',
    masterySubtitle: '各回数のパターン達成率',
    masteryDesc: '500個のパターンのうち、何個が各復習回数に到達したかを示します。回数が高いほど長期記憶に近づきます。',
    masterySteps: [
      { step: '1回', desc: 'パターンを初めて学習した段階', color: '#C87A3A' },
      { step: '2回', desc: '1回目の復習完了 — 短期記憶の強化', color: '#C8913A' },
      { step: '3回', desc: '2回目の復習 — 中期記憶への移行', color: '#7A6AC8' },
      { step: '4回', desc: '3回目の復習 — 長期記憶への進入', color: '#4A7AC8' },
      { step: '5回', desc: '完全習得 — 長期記憶の定着', color: '#2A7A3A' },
    ],
    masteryFooter: '復習は間隔反復(Spaced Repetition)方式で行われます。復習するたびに次の間隔が延び、記憶が強化されます。',
    masteryCardBottom: '全学習パターンの各回数達成率',
    masteryRingLabel: (n) => `${n}回`,
  },
  es: {
    scoreGrades: [
      { grade: 'Excellent!',      comment: '¡Increíble 🎉 Sigue con esta rutina!',              color: '#2A7A3A' },
      { grade: 'Very Good',       comment: '¡Excelente! Se está fijando en la memoria a largo plazo.', color: '#4A7AC8' },
      { grade: 'Good',            comment: 'Bien hecho. Las repeticiones fortalecen la memoria.', color: '#7A6AC8' },
      { grade: 'Building Up',     comment: 'Las bases crecen. ¡Mantén la constancia!',           color: '#C8913A' },
      { grade: 'Getting Started', comment: '¡Buen comienzo! Un poco cada día suma mucho.',       color: '#C87A3A' },
      { grade: 'Just Starting',   comment: 'Empieza tu primera sesión. Un poco al día es suficiente.', color: '#A0A0AA' },
    ],
    scoreInfoTitle: 'Puntuación de memoria a largo plazo',
    scoreInfoDesc: 'Mide cuánto has estudiado repetidamente los Stories y Patterns.',
    scoreCurrent: 'Puntuación actual:',
    masterySubtitle: 'Tasa de patrones alcanzados por ronda de repaso',
    masteryDesc: 'Muestra cuántos de los 500 patrones han alcanzado cada ronda de repaso. Más rondas significa más cerca de la memoria a largo plazo.',
    masterySteps: [
      { step: '1×', desc: 'Primera vez que aprendiste el patrón', color: '#C87A3A' },
      { step: '2×', desc: '1er repaso completo — refuerzo a corto plazo', color: '#C8913A' },
      { step: '3×', desc: '2o repaso — transición a memoria media', color: '#7A6AC8' },
      { step: '4×', desc: '3er repaso — entrando en memoria a largo plazo', color: '#4A7AC8' },
      { step: '5×', desc: 'Completamente adquirido — memoria a largo plazo', color: '#2A7A3A' },
    ],
    masteryFooter: 'Los repasos siguen el método de Repetición Espaciada. Cada repaso amplía el intervalo siguiente, fortaleciendo la memoria.',
    masteryCardBottom: 'Tasa de completado por ronda en todos los patrones aprendidos',
    masteryRingLabel: (n) => `${n}×`,
  },
  fr: {
    scoreGrades: [
      { grade: 'Excellent!',      comment: "Incroyable 🎉 Continue sur cette lancée !",          color: '#2A7A3A' },
      { grade: 'Very Good',       comment: "Super ! Ça s'ancre dans la mémoire à long terme.",   color: '#4A7AC8' },
      { grade: 'Good',            comment: 'Bien joué. La répétition consolide la mémoire.',     color: '#7A6AC8' },
      { grade: 'Building Up',     comment: 'Les bases se construisent. Reste régulier !',        color: '#C8913A' },
      { grade: 'Getting Started', comment: 'Bon début ! Un peu chaque jour, ça porte ses fruits.', color: '#C87A3A' },
      { grade: 'Just Starting',   comment: 'Lance ta première session. Un peu par jour suffit.', color: '#A0A0AA' },
    ],
    scoreInfoTitle: 'Score de mémoire à long terme',
    scoreInfoDesc: 'Mesure à quel point tu as étudié de manière répétée les Stories et Patterns.',
    scoreCurrent: 'Score actuel :',
    masterySubtitle: 'Taux de patterns atteints par tour de révision',
    masteryDesc: "Indique combien des 500 patterns ont atteint chaque tour de révision. Plus le tour est élevé, plus la mémoire à long terme est proche.",
    masterySteps: [
      { step: '1×', desc: "Première fois que tu as appris le pattern", color: '#C87A3A' },
      { step: '2×', desc: '1re révision — renforcement à court terme', color: '#C8913A' },
      { step: '3×', desc: '2e révision — passage en mémoire moyenne', color: '#7A6AC8' },
      { step: '4×', desc: '4e révision — entrée dans la mémoire à long terme', color: '#4A7AC8' },
      { step: '5×', desc: "Entièrement acquis — mémoire à long terme établie", color: '#2A7A3A' },
    ],
    masteryFooter: "Les révisions suivent la méthode de Répétition Espacée. Chaque révision allonge l'intervalle suivant, renforçant la mémoire.",
    masteryCardBottom: 'Taux de completion par tour sur tous les patterns appris',
    masteryRingLabel: (n) => `${n}×`,
  },
  de: {
    scoreGrades: [
      { grade: 'Excellent!',      comment: 'Fantastisch 🎉 Mach weiter so!',                    color: '#2A7A3A' },
      { grade: 'Very Good',       comment: 'Toll! Es festigt sich im Langzeitgedächtnis.',       color: '#4A7AC8' },
      { grade: 'Good',            comment: 'Gut gemacht. Wiederholungen stärken das Gedächtnis.', color: '#7A6AC8' },
      { grade: 'Building Up',     comment: 'Die Grundlage wächst. Bleib dabei!',                 color: '#C8913A' },
      { grade: 'Getting Started', comment: 'Guter Start! Ein bisschen täglich baut sich auf.',   color: '#C87A3A' },
      { grade: 'Just Starting',   comment: 'Starte deine erste Sitzung. Etwas täglich reicht.', color: '#A0A0AA' },
    ],
    scoreInfoTitle: 'Langzeitgedächtnis-Score',
    scoreInfoDesc: 'Misst, wie intensiv du Stories und Patterns wiederholt gelernt hast.',
    scoreCurrent: 'Aktueller Score:',
    masterySubtitle: 'Musterabschlussrate pro Wiederholungsrunde',
    masteryDesc: 'Zeigt, wie viele der 500 Muster jede Wiederholungsrunde erreicht haben. Höhere Runden bedeuten näher am Langzeitgedächtnis.',
    masterySteps: [
      { step: '1×', desc: 'Erstes Lernen des Musters', color: '#C87A3A' },
      { step: '2×', desc: '1. Wiederholung — Kurzzeit-Verstärkung', color: '#C8913A' },
      { step: '3×', desc: '2. Wiederholung — Übergang zum Mittelfristgedächtnis', color: '#7A6AC8' },
      { step: '4×', desc: '3. Wiederholung — Eintritt ins Langzeitgedächtnis', color: '#4A7AC8' },
      { step: '5×', desc: 'Vollständig erworben — Langzeitgedächtnis gefestigt', color: '#2A7A3A' },
    ],
    masteryFooter: 'Wiederholungen folgen dem Prinzip der Spaced Repetition. Jede Wiederholung verlängert das nächste Intervall und stärkt das Gedächtnis.',
    masteryCardBottom: 'Abschlussrate pro Runde über alle erlernten Muster',
    masteryRingLabel: (n) => `${n}×`,
  },
  'zh-cn': {
    scoreGrades: [
      { grade: 'Excellent!',      comment: '太棒了 🎉 请继续保持这个节奏！',       color: '#2A7A3A' },
      { grade: 'Very Good',       comment: '非常好！正在向长期记忆转化。',          color: '#4A7AC8' },
      { grade: 'Good',            comment: '做得不错。反复复习能强化记忆。',        color: '#7A6AC8' },
      { grade: 'Building Up',     comment: '基础正在积累。保持复习节奏吧！',        color: '#C8913A' },
      { grade: 'Getting Started', comment: '开始得不错！每天一点点，积少成多。',    color: '#C87A3A' },
      { grade: 'Just Starting',   comment: '开始第一次学习吧。每天一点点就够了。',  color: '#A0A0AA' },
    ],
    scoreInfoTitle: '长期记忆评分',
    scoreInfoDesc: '衡量你对故事和句型进行了多少次重复学习。',
    scoreCurrent: '当前评分：',
    masterySubtitle: '各复习轮次的句型达成率',
    masteryDesc: '显示500个句型中有多少已达到各复习轮次。轮次越高，越接近长期记忆。',
    masterySteps: [
      { step: '第1次', desc: '首次学习句型', color: '#C87A3A' },
      { step: '第2次', desc: '第1次复习完成 — 短期记忆强化', color: '#C8913A' },
      { step: '第3次', desc: '第2次复习 — 转向中期记忆', color: '#7A6AC8' },
      { step: '第4次', desc: '第3次复习 — 进入长期记忆', color: '#4A7AC8' },
      { step: '第5次', desc: '完全掌握 — 长期记忆稳固', color: '#2A7A3A' },
    ],
    masteryFooter: '复习采用间隔重复（Spaced Repetition）方式。每次复习后间隔延长，记忆不断强化。',
    masteryCardBottom: '所有已学句型各轮次达成率',
    masteryRingLabel: (n) => `第${n}次`,
  },
  'zh-tw': {
    scoreGrades: [
      { grade: 'Excellent!',      comment: '太棒了 🎉 請繼續保持這個節奏！',       color: '#2A7A3A' },
      { grade: 'Very Good',       comment: '非常好！正在向長期記憶轉化。',          color: '#4A7AC8' },
      { grade: 'Good',            comment: '做得不錯。反覆複習能強化記憶。',        color: '#7A6AC8' },
      { grade: 'Building Up',     comment: '基礎正在累積。保持複習節奏吧！',        color: '#C8913A' },
      { grade: 'Getting Started', comment: '開始得不錯！每天一點點，積少成多。',    color: '#C87A3A' },
      { grade: 'Just Starting',   comment: '開始第一次學習吧。每天一點點就夠了。',  color: '#A0A0AA' },
    ],
    scoreInfoTitle: '長期記憶評分',
    scoreInfoDesc: '衡量你對故事和句型進行了多少次重複學習。',
    scoreCurrent: '目前評分：',
    masterySubtitle: '各複習輪次的句型達成率',
    masteryDesc: '顯示500個句型中有多少已達到各複習輪次。輪次越高，越接近長期記憶。',
    masterySteps: [
      { step: '第1次', desc: '首次學習句型', color: '#C87A3A' },
      { step: '第2次', desc: '第1次複習完成 — 短期記憶強化', color: '#C8913A' },
      { step: '第3次', desc: '第2次複習 — 轉向中期記憶', color: '#7A6AC8' },
      { step: '第4次', desc: '第3次複習 — 進入長期記憶', color: '#4A7AC8' },
      { step: '第5次', desc: '完全掌握 — 長期記憶穩固', color: '#2A7A3A' },
    ],
    masteryFooter: '複習採用間隔重複（Spaced Repetition）方式。每次複習後間隔延長，記憶不斷強化。',
    masteryCardBottom: '所有已學句型各輪次達成率',
    masteryRingLabel: (n) => `第${n}次`,
  },
}

function getScoreI18n(lang: string): ScoreStrings {
  return SCORE_I18N[lang] ?? SCORE_I18N.en
}

// ── Calculations ──────────────────────────────────────────────────────────────

function computeMemoryScore(records: LearningRecord[]): number {
  const patternRecords = records.filter(r => r.itemType === 'pattern')
  const storyIds = new Set(patternRecords.map(r => r.storyId).filter(Boolean))
  const patternScore = patternRecords.reduce((sum, r) => sum + Math.min(r.repeatCount, 5) / 5, 0) / 500
  const storyScore = storyIds.size / 100
  return Math.round((patternScore + storyScore) / 2 * 100)
}

function computeReviewMastery(records: LearningRecord[]): number[] {
  const patterns = records.filter(r => r.itemType === 'pattern' && r.repeatCount > 0)
  const total = patterns.length
  if (total === 0) return [0, 0, 0, 0, 0]
  return [1, 2, 3, 4, 5].map(n =>
    Math.round((patterns.filter(r => r.repeatCount >= n).length / total) * 100)
  )
}

function getBestStreak(): number {
  const map = getActivityByDate()
  const dates = Object.keys(map).filter(d => (map[d] ?? 0) > 0).sort()
  if (dates.length === 0) return 0
  let best = 1, current = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round(
      (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000
    )
    if (diff === 1) { current++; best = Math.max(best, current) }
    else current = 1
  }
  return best
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[m - 1]} ${d}, ${y}`
}

function getScoreGrade(score: number, grades: ScoreStrings['scoreGrades']): { grade: string; comment: string; color: string } {
  if (score >= 80) return grades[0]
  if (score >= 60) return grades[1]
  if (score >= 40) return grades[2]
  if (score >= 20) return grades[3]
  if (score > 0)   return grades[4]
  return                  grades[5]
}

// ── Shared ────────────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  borderRadius: 24,
  border: '1px solid var(--pglass-border)',
  boxShadow: '0 2px 24px rgba(40,50,80,0.06), 0 1px 4px rgba(40,50,80,0.03)',
}

// ── Circular Progress Ring ────────────────────────────────────────────────────

function RingProgress({ pct, size = 80, stroke = 5, color = '#4A7AC8' }: {
  pct: number; size?: number; stroke?: number; color?: string
}) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct, 100) / 100)

  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(140,150,185,0.13)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

// ── Slim progress bar ─────────────────────────────────────────────────────────

function SlimBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 3, background: 'rgba(140,150,185,0.12)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(pct, 100)}%`,
        background: color, borderRadius: 99,
        transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  )
}

// ── Mastery ring (small SVG circle with stroke) ───────────────────────────────

function MasteryRing({ pct, label }: { pct: number; label: string }) {
  const size = 44, stroke = 3, r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const active = pct > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="rgba(140,150,185,0.14)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={active ? '#4A7AC8' : 'transparent'}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: active ? '#4A7AC8' : 'rgba(140,150,185,0.55)',
            lineHeight: 1,
          }}>
            {pct}%
          </span>
        </div>
      </div>
      <span style={{ fontSize: 9.5, fontWeight: 500, color: 'var(--pm2)', letterSpacing: '0.02em' }}>
        {label}
      </span>
    </div>
  )
}

// ── Score Info Popup ──────────────────────────────────────────────────────────

function ScoreInfoPopup({ score, onClose }: { score: number; onClose: () => void }) {
  const { prefs } = usePreferences()
  const s = getScoreI18n(prefs.language)
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(20,20,40,0.38)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }} />
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 81,
        width: 'calc(100vw - 48px)',
        maxWidth: 320,
        background: 'rgba(252,251,255,0.97)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.92)',
        boxShadow: '0 12px 48px rgba(40,50,80,0.18), 0 2px 8px rgba(40,50,80,0.08)',
        padding: '24px 22px 22px',
      }}>
        {/* Close */}
        <button type="button" onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(140,150,185,0.10)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X style={{ width: 11, height: 11, color: 'var(--pm2)' }} strokeWidth={2} />
        </button>

        {/* Title */}
        <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--pt)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {s.scoreInfoTitle}
        </p>
        <p style={{ fontSize: 11, color: 'var(--pm2)', margin: '0 0 18px', lineHeight: 1.5 }}>
          {s.scoreCurrent} <strong style={{ color: '#4A7AC8' }}>{score}%</strong>
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(140,150,185,0.10)', marginBottom: 16 }} />

        {/* Explanation */}
        <p style={{ fontSize: 12, color: 'var(--pt2)', lineHeight: 1.75, margin: '0 0 14px', fontWeight: 500 }}>
          {s.scoreInfoDesc}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { range: '0 – 19', label: 'Getting Started', color: '#C87A3A' },
            { range: '20 – 39', label: 'Building Up',    color: '#C8913A' },
            { range: '40 – 59', label: 'Good',           color: '#7A6AC8' },
            { range: '60 – 79', label: 'Very Good',      color: '#4A7AC8' },
            { range: '80+',     label: 'Excellent',      color: '#2A7A3A' },
          ].map(({ range, label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--pm2)', width: 46, flexShrink: 0 }}>{range}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color,
                background: `${color}12`,
                border: `1px solid ${color}28`,
                borderRadius: 6, padding: '2px 8px',
              }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Review Mastery Info Popup ─────────────────────────────────────────────────
function MasteryInfoPopup({ onClose }: { onClose: () => void }) {
  const { prefs } = usePreferences()
  const s = getScoreI18n(prefs.language)
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(20,20,40,0.38)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }} />
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 81,
        width: 'calc(100vw - 48px)',
        maxWidth: 320,
        background: 'rgba(252,251,255,0.97)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.92)',
        boxShadow: '0 12px 48px rgba(40,50,80,0.18), 0 2px 8px rgba(40,50,80,0.08)',
        padding: '24px 22px 22px',
      }}>
        <button type="button" onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(140,150,185,0.10)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X style={{ width: 11, height: 11, color: 'var(--pm2)' }} strokeWidth={2} />
        </button>

        <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--pt)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Review Mastery
        </p>
        <p style={{ fontSize: 11, color: 'var(--pm2)', margin: '0 0 16px', lineHeight: 1.5 }}>
          {s.masterySubtitle}
        </p>

        <div style={{ height: 1, background: 'rgba(140,150,185,0.10)', marginBottom: 16 }} />

        <p style={{ fontSize: 12, color: 'var(--pt2)', lineHeight: 1.75, margin: '0 0 16px', fontWeight: 500 }}>
          {s.masteryDesc}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {s.masterySteps.map(({ step, desc, color }) => (
            <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color,
                background: `${color}12`,
                border: `1px solid ${color}28`,
                borderRadius: 6, padding: '2px 8px',
                flexShrink: 0, marginTop: 1,
              }}>{step}</span>
              <span style={{ fontSize: 11, color: 'var(--pt2)', lineHeight: 1.55 }}>{desc}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: 'rgba(140,150,185,0.10)', margin: '16px 0 12px' }} />
        <p style={{ fontSize: 10, color: 'var(--pm2)', lineHeight: 1.6, margin: 0 }}>
          {s.masteryFooter}
        </p>
      </div>
    </>
  )
}

// ── Day detail bottom sheet ───────────────────────────────────────────────────

function DayDetailSheet({ detail, onClose }: { detail: EnhancedDayDetail | null; onClose: () => void }) {
  const open = !!detail
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isEmpty = detail &&
    detail.completed.length === 0 &&
    detail.due.length === 0 &&
    detail.upcoming.length === 0

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.36)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.22s',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
        background: 'rgba(252,250,255,0.96)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRadius: '24px 24px 0 0',
        border: '1px solid rgba(255,255,255,0.92)',
        boxShadow: '0 -6px 32px rgba(0,0,0,0.08)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.30s cubic-bezier(0.4,0,0.2,1)',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '72dvh', overflowY: 'auto',
      }}>
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ width: 32, height: 3, background: 'rgba(140,150,185,0.22)', borderRadius: 99, margin: '0 auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 0' }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em' }}>
            {detail ? fmtDate(detail.date) : ''}
          </p>
          <button type="button" onClick={onClose} style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(140,150,185,0.10)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X style={{ width: 12, height: 12, color: 'var(--pm2)' }} strokeWidth={2} />
          </button>
        </div>
        {detail && (
          <div style={{ padding: '16px 24px' }}>
            {isEmpty && (
              <p style={{ fontSize: 13, color: 'var(--pm2)', textAlign: 'center', paddingTop: 8 }}>
                이 날은 학습 기록이 없어요.
              </p>
            )}
            {detail.completed.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: '#27AE60', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  Completed
                </p>
                {detail.completed.map(item => (
                  <div key={item.storyId} style={{ padding: '10px 0', borderBottom: '1px solid rgba(140,150,185,0.10)', fontSize: 13, color: 'var(--pt)', fontWeight: 500 }}>
                    Story {String(item.storyId).padStart(2, '0')} · {item.storyTitle}
                  </div>
                ))}
              </div>
            )}
            {detail.due.length > 0 && (
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  Due
                </p>
                {detail.due.map(item => (
                  <div key={item.storyId} style={{ padding: '10px 0', borderBottom: '1px solid rgba(140,150,185,0.10)', fontSize: 13, color: 'var(--pt2)', fontWeight: 500 }}>
                    Story {String(item.storyId).padStart(2, '0')} · {item.storyTitle}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ── Page 1: Memory Score ──────────────────────────────────────────────────────

function PageScore({ score, learnedStories, learnedPatterns, mastery }: {
  score: number
  learnedStories: number
  learnedPatterns: number
  mastery: number[]
}) {
  const { prefs } = usePreferences()
  const s = getScoreI18n(prefs.language)
  const storyPct   = Math.min(Math.round((learnedStories  / 100)  * 100), 100)
  const patternPct = Math.min(Math.round((learnedPatterns / 500) * 100), 100)
  const { grade, comment, color } = getScoreGrade(score, s.scoreGrades)
  const [showInfo, setShowInfo] = useState(false)
  const [showMasteryInfo, setShowMasteryInfo] = useState(false)

  return (
    <>
      <div style={{ padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── Memory Score hero ── */}
        <div style={{ ...glassCard, padding: '24px 24px 22px' }}>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: '#3A3A4A', margin: 0, textTransform: 'uppercase', flex: 1 }}>
              Score
            </p>
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Info style={{ width: 14, height: 14, color: 'rgba(140,150,185,0.55)' }} strokeWidth={1.8} />
            </button>
          </div>

          {/* Ring + grade row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 24 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <RingProgress pct={score} size={80} stroke={5} color={color} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 1,
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--pt)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {score}
                </span>
                <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--pm2)' }}>%</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color, margin: '0 0 5px', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {grade}
              </p>
              <p style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--pm2)', margin: 0, lineHeight: 1.55 }}>
                {comment}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(140,150,185,0.10)', marginBottom: 20 }} />

          {/* Story Progress */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen style={{ width: 13, height: 13, color: '#4A7AC8', flexShrink: 0 }} strokeWidth={2.2} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2A2A3A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Story Progress
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
                {learnedStories}
                <span style={{ fontWeight: 400, color: 'var(--pm2)', fontSize: 11 }}> / 100</span>
              </span>
            </div>
            <SlimBar pct={storyPct} color="#4A7AC8" />
          </div>

          {/* Pattern Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers style={{ width: 13, height: 13, color: '#7A6AC8', flexShrink: 0 }} strokeWidth={2.2} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2A2A3A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Pattern Progress
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', fontVariantNumeric: 'tabular-nums' }}>
                {learnedPatterns}
                <span style={{ fontWeight: 400, color: 'var(--pm2)', fontSize: 11 }}> / 500</span>
              </span>
            </div>
            <SlimBar pct={patternPct} color="#7A6AC8" />
          </div>
        </div>

        {/* ── Review Mastery ── */}
        <div style={{ ...glassCard, padding: '22px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: '#3A3A4A', margin: 0, textTransform: 'uppercase' }}>
              Review Mastery
            </p>
            <button type="button" onClick={() => setShowMasteryInfo(true)} style={{
              background: 'none', border: 'none', padding: 2,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}>
              <Info style={{ width: 14, height: 14, color: 'rgba(140,150,185,0.55)' }} strokeWidth={1.8} />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {mastery.map((pct, i) => (
              <MasteryRing key={i} pct={pct} label={s.masteryRingLabel(i + 1)} />
            ))}
          </div>
          <p style={{ fontSize: 10, color: 'rgba(140,150,185,0.65)', margin: '16px 0 0', textAlign: 'center', fontWeight: 400 }}>
            {s.masteryCardBottom}
          </p>
        </div>
      </div>

      {showInfo && <ScoreInfoPopup score={score} onClose={() => setShowInfo(false)} />}
      {showMasteryInfo && <MasteryInfoPopup onClose={() => setShowMasteryInfo(false)} />}
    </>
  )
}

// ── Page 2: Memory Calendar ───────────────────────────────────────────────────

function PageCalendar({ futureSchedule, selectedIso, onDaySelect, streak }: {
  futureSchedule: Record<string, ScheduledDay>
  selectedIso: string | null
  onDaySelect: (iso: string) => void
  streak: number
}) {
  return (
    <div style={{ padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Calendar card ── */}
      <div style={{ ...glassCard, padding: '22px 18px 18px' }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: '#3A3A4A', margin: '0 0 16px', textTransform: 'uppercase' }}>
          Calendar
        </p>
        <LearningCalendar
          onDaySelect={onDaySelect}
          selectedIso={selectedIso}
          futureSchedule={futureSchedule}
          streak={streak}
        />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const railRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)

  const [dayDetail, setDayDetail]     = useState<EnhancedDayDetail | null>(null)
  const [selectedIso, setSelectedIso] = useState<string | null>(null)
  const [futureSchedule, setFutureSchedule] = useState<Record<string, ScheduledDay>>({})

  const [records, setRecords] = useState<LearningRecord[]>([])
  const [streak, setStreak]   = useState(0)

  useEffect(() => {
    const allRec = getAllRecords()
    setRecords(allRec)
    setFutureSchedule(getFutureSchedule())
    setStreak(getStreak())
  }, [])

  const learnedPatterns = records.filter(r => r.itemType === 'pattern').length
  const learnedStories  = records.filter(r => r.itemType === 'story').length
  const memoryScore     = useMemo(() => computeMemoryScore(records), [records])
  const mastery         = useMemo(() => computeReviewMastery(records), [records])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const onScroll = () =>
      setPage(Math.min(1, Math.max(0, Math.round(rail.scrollLeft / rail.clientWidth))))
    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => rail.removeEventListener('scroll', onScroll)
  }, [])

  function goToPage(idx: number) {
    railRef.current?.scrollTo({ left: idx * (railRef.current.clientWidth), behavior: 'smooth' })
  }

  function handleDaySelect(iso: string) {
    if (selectedIso === iso) { setSelectedIso(null); setDayDetail(null); return }
    setSelectedIso(iso)
    setDayDetail(getEnhancedDayDetail(iso))
  }

  return (
    <>
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopNav />

        {/* ── Page indicator ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '8px 0 14px', flexShrink: 0,
        }}>
          {[0, 1].map(i => (
            <button
              key={i} type="button" onClick={() => goToPage(i)}
              style={{
                width: page === i ? 20 : 5, height: 5, borderRadius: 99,
                background: page === i ? 'rgba(74,122,200,0.80)' : 'rgba(140,150,185,0.22)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.28s ease, background 0.28s ease',
              }}
            />
          ))}
        </div>

        {/* ── Scroll rail ── */}
        <div
          ref={railRef}
          style={{
            flex: 1, display: 'flex',
            overflowX: 'auto', overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
          } as React.CSSProperties}
        >
          {/* Page 0 — Calendar */}
          <div style={{
            flex: '0 0 100%', scrollSnapAlign: 'start',
            overflowY: 'auto', height: '100%',
            paddingBottom: TAB_BAR_HEIGHT + 24, boxSizing: 'border-box',
          }}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <PageCalendar
                futureSchedule={futureSchedule}
                selectedIso={selectedIso}
                onDaySelect={handleDaySelect}
                streak={streak}
              />
            </div>
          </div>

          {/* Page 1 — Score */}
          <div style={{
            flex: '0 0 100%', scrollSnapAlign: 'start',
            overflowY: 'auto', height: '100%',
            paddingBottom: TAB_BAR_HEIGHT + 24, boxSizing: 'border-box',
          }}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <PageScore
                score={memoryScore}
                learnedStories={learnedStories}
                learnedPatterns={learnedPatterns}
                mastery={mastery}
              />
            </div>
          </div>
        </div>
      </div>

      <DayDetailSheet
        detail={dayDetail}
        onClose={() => { setDayDetail(null); setSelectedIso(null) }}
      />

      <style>{`div::-webkit-scrollbar{display:none}`}</style>
    </>
  )
}
