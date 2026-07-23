'use client'

import { useEffect, useState } from 'react'
import { Volume2, Bookmark } from 'lucide-react'
import type { KPattoPattern, KPattoLanguage } from '@/data/kpatto/types'
import { isPatternSaved, savePattern, unsavePattern } from '@/lib/kpatto/savedPatterns'
import { useAuth } from '@/contexts/AuthContext'

const ACCENT = '#D4873A'
const T1     = '#111111'

const PATTERN_DESCS: Record<string, string> = {
  // EP01
  'kp-005': 'Use this to say what something IS',
  'kp-003': 'Use this to ask for something',
  'kp-004': 'Use this to ask what something is',
  'kp-006': 'Use this to ask if something exists',
  'kp-007': 'Use this to ask the price',
  // EP02
  'kp-ep-002-p001': 'Use this to ask where something is',
  'kp-ep-002-p002': 'Use this to say where you want to go',
  'kp-ep-002-p003': 'Use this to ask how to get somewhere',
  'kp-ep-002-p004': 'Use this to ask for a quantity of something',
  'kp-ep-002-p005': 'Use this to say you like something',
  // EP03
  'kp-ep-003-p001': 'Use this to say what you want to do',
  'kp-ep-003-p002': 'Use this to say what you can or cannot do',
  'kp-ep-003-p003': 'Use this to say what something is NOT',
  'kp-ep-003-p004': 'Use this to say you can\'t do something',
  'kp-ep-003-p005': 'Use this to check if something is correct',
  // EP04
  'kp-ep-004-p001': 'Use this to ask for permission',
  'kp-ep-004-p002': 'Use this to say something is not allowed',
  'kp-ep-004-p003': 'Use this to ask for an opinion or suggestion',
  'kp-ep-004-p004': 'Use this to say what you\'ll choose',
  'kp-ep-004-p005': 'Use this to ask how long something takes',
  // EP05
  'kp-ep-005-p001': 'Use this to make a polite request',
  'kp-ep-005-p002': 'Use this to ask for a recommendation',
  'kp-ep-005-p003': 'Use this to ask if someone has done something',
  'kp-ep-005-p004': 'Use this to ask where to buy something',
  'kp-ep-005-p005': 'Use this to express how food tastes',
  // EP06
  'kp-ep-006-p001': 'Use this to say what you like or dislike',
  'kp-ep-006-p002': 'Use this to ask if someone knows something',
  'kp-ep-006-p003': 'Use this to ask someone to teach you',
  'kp-ep-006-p004': 'Use this to ask if you can do something together',
  'kp-ep-006-p005': 'Use this to say you love something',
  // EP07
  'kp-ep-007-p001': 'Use this to ask for a little more',
  'kp-ep-007-p002': 'Use this to ask for a discount',
  'kp-ep-007-p003': 'Use this to suggest doing something together',
  'kp-ep-007-p004': 'Use this to express fascination',
  'kp-ep-007-p005': 'Use this to ask the total price',
  // EP08
  'kp-ep-008-p001': 'Use this to ask if something is good for skin',
  'kp-ep-008-p002': 'Use this to ask if someone has tried something',
  'kp-ep-008-p003': 'Use this to ask which option is better',
  'kp-ep-008-p004': 'Use this to say you\'re planning to gift something',
  'kp-ep-008-p005': 'Use this to ask for a skin-type recommendation',
  // EP09
  'kp-ep-009-p001': 'Use this to invite someone to do something together',
  'kp-ep-009-p002': 'Use this to comment on great weather',
  'kp-ep-009-p003': 'Use this to say something exceeded expectations',
  'kp-ep-009-p004': 'Use this to say it\'s your first time',
  'kp-ep-009-p005': 'Use this to say you love this kind of thing',
  // EP10
  'kp-ep-010-p001': 'Use this to introduce yourself',
  'kp-ep-010-p002': 'Use this to say where you\'re from',
  'kp-ep-010-p003': 'Use this to say what your major is',
  'kp-ep-010-p004': 'A polite phrase for new relationships',
  'kp-ep-010-p005': 'Use this to ask someone to speak Korean slowly',
}

// Pattern explanation texts (accordion content)
const PATTERN_EXPLANATIONS: Record<string, string> = {
  // EP01 — 카페에서
  'kp-005': `💡 How to use\nUse this to say what something IS.\n\n[noun] + 이에요 (ends in consonant)\n[noun] + 예요 (ends in vowel)\n\n김치 + 예요 → 김치예요. (This is kimchi.)\n학생 + 이에요 → 학생이에요. (I'm a student.)`,
  'kp-003': `💡 How to use\nPut what you want BEFORE 주세요.\n\n[what you want] + 주세요\n\n물 + 주세요 → 물 주세요. (Water, please.)\nAny noun works — just swap it in!`,
  'kp-004': `💡 How to use\nPoint at something and ask what it is.\n\n[this/that] + 뭐예요?\n\n이거 = this / 저거 = that\n이거 뭐예요? (What is this?)`,
  'kp-006': `💡 How to use\nAsk if something exists or is available.\n\n[noun] + 있어요? → Does ~ exist? / Do you have ~?\n[noun] + 없어요. → There is no ~ / I don't have ~\n\n와이파이 있어요? (Is there Wi-Fi?)\n자리 없어요. (There are no seats.)`,
  'kp-007': `💡 How to use\nAsk the price of anything.\n\n[noun] + 얼마예요?\n\n이거 얼마예요? (How much is this?)\nJust point and ask — works everywhere!`,
  // EP02 — 지하철에서
  'kp-ep-002-p001': `💡 How to use\nAsk where something is.\n\n[place/thing] + 어디예요?\n\n화장실 어디예요? (Where is the bathroom?)\nSwap the noun to ask about anything!`,
  'kp-ep-002-p002': `💡 How to use\nSay where you want to go.\n\n[place] + 에 가고 싶어요\n\n홍대에 가고 싶어요. (I want to go to Hongdae.)\n~에 = "to" a place / 가고 싶어요 = want to go`,
  'kp-ep-002-p003': `💡 How to use\nAsk for directions to any place.\n\n[place] + 어떻게 가요?\n\n홍대 어떻게 가요? (How do I get to Hongdae?)\nNo particle needed — just place + 어떻게 가요?`,
  'kp-ep-002-p004': `💡 How to use\nOrder or request a specific quantity.\n\n[item] + [number + counter] + 주세요\n\n표 두 장 주세요. (Two tickets, please.)\n물 한 병 주세요. (One bottle of water, please.)`,
  'kp-ep-002-p005': `💡 How to use\nSay you like something or it's good.\n\n[noun] + 좋아요\n\n서울 좋아요. (I like Seoul.)\nWorks for both "I like ~" and "~ is good!"`,
  // EP03 — 떡볶이 가게에서
  'kp-ep-003-p001': `💡 How to use\nSay what you WANT to do.\n\n[verb stem] + 고 싶어요\n\n먹고 싶어요. (I want to eat.)\n해보고 싶어요. (I want to try it.)\nDrop 다 from the verb, add 고 싶어요!`,
  'kp-ep-003-p002': `💡 How to use\nSay what you CAN or CANNOT do.\n\n[verb stem] + ㄹ/을 수 있어요 → can\n[verb stem] + ㄹ/을 수 없어요 → can't\n\n매운 거 먹을 수 있어요? (Can you eat spicy food?)\n젓가락 쓸 수 있어요. (I can use chopsticks.)`,
  'kp-ep-003-p003': `💡 How to use\nSay what something is NOT.\n\n[noun] + 이 아니에요 (ends in consonant)\n[noun] + 가 아니에요 (ends in vowel)\n\n이거 제 거 아니에요. (This isn't mine.)\n저 학생 아니에요. (I'm not a student.)`,
  'kp-ep-003-p004': `💡 How to use\nSay you CAN'T do something (casual speech).\n\n못 + [verb]\n\n매운 거 못 먹어요. (I can't eat spicy food.)\nShorter and more natural than ~할 수 없어요!`,
  'kp-ep-003-p005': `💡 How to use\nCheck if something is correct.\n\n[noun/place] + 맞아요?\n\n이게 떡볶이 맞아요? (Is this tteokbokki?)\n여기 홍대 맞아요? (Is this Hongdae?)\nGreat for double-checking directions or orders!`,
  // EP04 — 편의점에서
  'kp-ep-004-p001': `💡 How to use\nAsk for permission to do something.\n\n[verb stem] + 아/어도 돼요?\n\n사진 찍어도 돼요? (May I take a photo?)\n여기서 먹어도 돼요? (Is it okay to eat here?)\nPolite and safe to use anywhere!`,
  'kp-ep-004-p002': `💡 How to use\nSay something is NOT allowed.\n\n[verb stem] + 으면/면 안 돼요\n\n여기서 피우면 안 돼요. (You can't smoke here.)\n뛰면 안 돼요. (You can't run.)\nUsed for rules and prohibitions.`,
  'kp-ep-004-p003': `💡 How to use\nAsk for an opinion or make a suggestion.\n\n[noun] + 은/는 어때요?\n\n이거는 어때요? (How about this one?)\n이 맛은 어때요? (What do you think of this flavor?)\n은 after consonant / 는 after vowel.`,
  'kp-ep-004-p004': `💡 How to use\nSay what you'll choose or go with.\n\n[noun] + 로/으로 할게요\n\n카드로 할게요. (I'll pay by card.)\n이걸로 할게요. (I'll go with this one.)\n로 after vowel / 으로 after consonant.`,
  'kp-ep-004-p005': `💡 How to use\nAsk how long something takes.\n\n[noun/action] + 얼마나 걸려요?\n\n거기까지 얼마나 걸려요? (How long does it take to get there?)\n배달 얼마나 걸려요? (How long does delivery take?)`,
  // EP05 — 식당에서
  'kp-ep-005-p001': `💡 How to use\nMake a polite request — more formal than 주세요.\n\n[action] + 주실 수 있어요?\n\n천천히 말해주실 수 있어요? (Could you speak slowly?)\n물 더 주실 수 있어요? (Could you bring more water?)\nUse this when you want to be extra polite!`,
  'kp-ep-005-p002': `💡 How to use\nAsk for a recommendation.\n\n[category] + 추천해 주세요\n\n메뉴 추천해 주세요. (Please recommend a menu item.)\n맛있는 거 추천해 주세요. (Please recommend something delicious.)\nWorks at restaurants, shops, anywhere!`,
  'kp-ep-005-p003': `💡 How to use\nAsk if someone has ever done something.\n\n[verb stem] + 아/어 본 적 있어요?\n\n삼겹살 먹어 본 적 있어요? (Have you ever had samgyeopsal?)\n한국 와 본 적 있어요? (Have you ever been to Korea?)`,
  'kp-ep-005-p004': `💡 How to use\nAsk where you can buy something.\n\n[noun] + 어디서 살 수 있어요?\n\n이거 어디서 살 수 있어요? (Where can I buy this?)\n김치 어디서 살 수 있어요? (Where can I buy kimchi?)`,
  'kp-ep-005-p005': `💡 How to use\nExpress how food tastes.\n\n[food] + 맛있어요 → delicious\n[food] + 맛없어요 → not good\n\n진짜 맛있어요! (It's really delicious!)\n생각보다 맛없어요. (It's not as good as I expected.)`,
  // EP06 — 노래방에서
  'kp-ep-006-p001': `💡 How to use\nSay what you like or dislike (ongoing preference).\n\n[noun] + 좋아해요 → I like ~\n[noun] + 싫어해요 → I don't like ~\n\n케이팝 좋아해요. (I like K-pop.)\n매운 거 싫어해요. (I don't like spicy food.)\nDifferent from 좋아요 — 좋아해요 = ongoing habit!`,
  'kp-ep-006-p002': `💡 How to use\nAsk if someone knows something.\n\n[noun] + 알아요?\n\n이 노래 알아요? (Do you know this song?)\nBTS 알아요? (Do you know BTS?)\nSimple and super useful in conversation!`,
  'kp-ep-006-p003': `💡 How to use\nAsk someone to teach you something.\n\n[subject] + 가르쳐 주세요\n\n이 노래 가르쳐 주세요. (Please teach me this song.)\n한국어 가르쳐 주세요. (Please teach me Korean.)`,
  'kp-ep-006-p004': `💡 How to use\nAsk if you can do something TOGETHER.\n\n같이 + [verb] + 해도 돼요?\n\n같이 불러도 돼요? (Can we sing together?)\n같이 가도 돼요? (Can I come with you?)\n같이 = together — adds a friendly nuance!`,
  'kp-ep-006-p005': `💡 How to use\nSay you LOVE something (stronger than 좋아요).\n\n[noun] + 너무 좋아요!\n\n이 노래 너무 좋아요! (I love this song so much!)\n너무 = so much / very — amplifies the feeling!`,
  // EP07 — 시장에서
  'kp-ep-007-p001': `💡 How to use\nAsk for a little more of something.\n\n조금만 더 + [noun] + 주세요\nOr just: 조금만 더 주세요!\n\n조금만 더 주세요. (A little more, please.)\n조금만 = just a little / 더 = more\nGreat at markets and restaurants!`,
  'kp-ep-007-p002': `💡 How to use\nAsk for a discount — essential at markets!\n\n좀 깎아 주세요. (Please give me a discount.)\n조금만 깎아 주세요. (Just a little discount, please.)\n깎다 = to cut/reduce. Works best at traditional markets!`,
  'kp-ep-007-p003': `💡 How to use\nSuggest doing something together.\n\n같이 + [verb] + 해요 / [verb ending]\n\n같이 먹어요. (Let's eat together.)\n같이 가요. (Let's go together.)\n같이 = together — friendly and casual!`,
  'kp-ep-007-p004': `💡 How to use\nExpress that something is interesting or unique.\n\n[noun] + 신기해요!\n\n이거 신기해요! (This is so interesting!)\n한국 시장 신기해요! (Korean markets are so unique!)\n신기하다 = to find something fascinating/novel.`,
  'kp-ep-007-p005': `💡 How to use\nAsk the total price for everything.\n\n다 해서 얼마예요?\n\n다 해서 얼마예요? (How much is it all together?)\n다 = all / 해서 = adding up to\nUse when buying multiple items!`,
  // EP08 — 뷰티숍에서
  'kp-ep-008-p001': `💡 How to use\nAsk if something is good for your skin.\n\n[product] + 피부에 좋아요?\n\n이거 피부에 좋아요? (Is this good for skin?)\n민감한 피부에 좋아요? (Is it good for sensitive skin?)\n피부 = skin / 에 좋아요 = is good for ~`,
  'kp-ep-008-p002': `💡 How to use\nAsk if someone has tried using something.\n\n[product] + 써봤어요?\n\n이 크림 써봤어요? (Have you tried this cream?)\n마스크팩 써봤어요? (Have you tried sheet masks?)\n써보다 = to try using something.`,
  'kp-ep-008-p003': `💡 How to use\nAsk which option is better or recommended.\n\n어떤 게 좋아요? (Which one is good?)\n제 피부엔 어떤 게 좋아요? (Which is good for my skin?)\n어떤 = which / 게 = thing (casual for 것이)`,
  'kp-ep-008-p004': `💡 How to use\nSay you're planning to give something as a gift.\n\n[person] + 한테 선물하려고요\n\n친구한테 선물하려고요. (I'm planning to give it to my friend.)\n엄마한테 선물하려고요. (I'm planning to give it to my mom.)\n~하려고요 = planning to / intending to.`,
  'kp-ep-008-p005': `💡 How to use\nAsk for a recommendation suited to your skin type.\n\n제 피부 타입에 맞는 거 추천해 주세요.\n(Please recommend something for my skin type.)\n\n맞는 거 = something that suits/fits\nThis full sentence works perfectly as-is!`,
  // EP09 — 한강에서
  'kp-ep-009-p001': `💡 How to use\nInvite someone to do something together.\n\n같이 + [verb]해요!\n\n같이 먹어요! (Let's eat together!)\n같이 앉아요! (Let's sit together!)\n같이 = together — warm and friendly tone!`,
  'kp-ep-009-p002': `💡 How to use\nComment on great weather (casual expression).\n\n날씨 좋다! (The weather is great!)\n오늘 날씨 너무 좋다! (Today's weather is so nice!)\n좋다 = casual form of 좋아요 — used with friends!`,
  'kp-ep-009-p003': `💡 How to use\nSay something is better/different than expected.\n\n생각보다 + [adjective/description]\n\n생각보다 맛있어요. (It's more delicious than I expected.)\n생각보다 넓어요. (It's bigger than I expected.)\n생각보다 = more than I thought / better than expected.`,
  'kp-ep-009-p004': `💡 How to use\nSay it's your first time doing something.\n\n[noun/experience] + 처음이에요\n\n한강 피크닉 처음이에요. (It's my first Han River picnic.)\n한국 치킨 처음이에요. (It's my first Korean fried chicken.)\n처음 = first time — great for sharing new experiences!`,
  'kp-ep-009-p005': `💡 How to use\nSay you love this kind of thing or moment.\n\n이런 거 너무 좋아요. (I love this kind of thing.)\n이런 순간 너무 좋아요. (I love moments like this.)\n이런 거 = this kind of thing — expresses genuine feeling!`,
  // EP10 — 학교에서
  'kp-ep-010-p001': `💡 How to use\nIntroduce yourself — say who you ARE.\n\n저는 + [name/identity] + 이에요/예요\n\n저는 에마예요. (I'm Emma.)\n저는 미국 사람이에요. (I'm American.)\n저는 = I (polite) — always use in formal intro!`,
  'kp-ep-010-p002': `💡 How to use\nSay where you're from.\n\n[country/city] + 에서 왔어요\n\n미국에서 왔어요. (I'm from America.)\n서울에서 왔어요? (Are you from Seoul?)\n에서 = from / 왔어요 = came (past tense of 오다)`,
  'kp-ep-010-p003': `💡 How to use\nSay what your major is.\n\n[major] + 전공이에요\n\n경영학 전공이에요. (My major is business.)\n뭐 전공이에요? (What's your major?)\n전공 = major — essential for university life!`,
  'kp-ep-010-p004': `💡 How to use\nA polite phrase for new relationships — hard to translate directly!\n\n잘 부탁드려요. (Please take care of me. / Nice to meet you.)\n앞으로 잘 부탁드려요. (I look forward to working with you.)\nAlways said at introductions — shows respect and humility!`,
  'kp-ep-010-p005': `💡 How to use\nAsk someone to speak Korean slowly for you.\n\n한국어로 천천히 말해줄 수 있어요?\n(Can you speak Korean slowly?)\n\n천천히 = slowly / 말해줄 수 있어요 = can you speak?\nThis sentence will save you so many times!`,
}

function speakAll(sentences: string[], onDone: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  let idx = 0
  const next = () => {
    if (idx >= sentences.length) { onDone(); return }
    const utt = new SpeechSynthesisUtterance(sentences[idx++])
    utt.lang = 'ko-KR'
    utt.rate = 0.9
    utt.onend = next
    window.speechSynthesis.speak(utt)
  }
  next()
}

function SpeakAllBtn({ sentences, size, color, activeColor }: { sentences: string[]; size: number; color: string; activeColor: string }) {
  const [playing, setPlaying] = useState(false)
  const handle = () => {
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); return }
    setPlaying(true)
    speakAll(sentences, () => setPlaying(false))
  }
  return (
    <button
      onClick={handle}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}
    >
      <Volume2 size={size} color={playing ? activeColor : color} strokeWidth={1.8} />
    </button>
  )
}

function BookmarkBtn({ pattern, episodeId }: { pattern: KPattoPattern; episodeId: string }) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { setSaved(false); return }
    isPatternSaved(pattern.id).then(setSaved)
  }, [user, pattern.id])

  const handle = async () => {
    if (!user || loading) return
    setLoading(true)
    if (saved) {
      await unsavePattern(pattern.id)
      setSaved(false)
    } else {
      await savePattern(pattern.id, episodeId)
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <button onClick={handle} style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'default', padding: 0, flexShrink: 0 }}>
      <Bookmark size={15} color={saved ? ACCENT : '#CCCCCC'} fill={saved ? ACCENT : 'none'} strokeWidth={1.8} />
    </button>
  )
}

export function PatternSection({
  tags,
  patternMap,
  lang,
  storyId,
  episodeId,
}: {
  tags: string[]
  patternMap: Record<string, KPattoPattern>
  lang: KPattoLanguage
  storyId: number
  episodeId: string
}) {
  const patterns = tags.map(id => patternMap[id]).filter(Boolean)
  const [openExplain, setOpenExplain] = useState<string | null>(null)
  if (patterns.length === 0) return null

  return (
    <div style={{ margin: '32px 0 0', padding: '0 16px' }}>
      {/* Section title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#999999', textTransform: 'uppercase' }}>
          Patterns in this episode
        </div>
      </div>

      {/* Single combined card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8E4DF',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {patterns.map((p, i) => {
          const desc = PATTERN_DESCS[p.id] ?? p.structure
          const explanation = PATTERN_EXPLANATIONS[p.id]
          const isOpen = openExplain === p.id
          return (
            <div key={p.id}>
            {i > 0 && <div style={{ height: 1, background: '#F0EDE8', margin: '0 20px' }} />}
            <div style={{ padding: '20px 20px' }}>
              {/* Header chip */}
              <div style={{
                background: '#EEF8EC', border: '1px solid #C9EAC4', borderRadius: 12,
                padding: '12px 14px', marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', letterSpacing: '0.5px', marginBottom: 6 }}>
                      PATTERN {String(i + 1).padStart(3, '0')}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 6 }}>
                      {p.korean}
                    </div>
                    <div style={{ fontSize: 13, color: '#666666' }}>{desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {explanation && (
                      <button
                        onClick={() => setOpenExplain(isOpen ? null : p.id)}
                        title="How to use"
                        style={{
                          background: isOpen ? '#16A34A' : 'transparent',
                          border: `1.5px solid ${isOpen ? '#16A34A' : '#A7D9A2'}`,
                          borderRadius: 6, width: 24, height: 24,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', fontSize: 13, lineHeight: 1,
                          color: isOpen ? '#fff' : '#16A34A',
                          transition: 'all 0.15s',
                        }}
                      >
                        ❗
                      </button>
                    )}
                    <BookmarkBtn pattern={p} episodeId={episodeId} />
                  </div>
                </div>
              </div>

              {/* Explanation accordion */}
              {explanation && isOpen && (
                <div style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 10,
                  padding: '12px 14px',
                  marginBottom: 14,
                  fontSize: 12.5,
                  color: '#166534',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-line',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                }}>
                  {explanation.split('\n').map((line, li) => {
                    // Bold lines that contain slot formula brackets [ ]
                    const isSlot = line.includes('[') && line.includes(']')
                    const isHeading = line.startsWith('💡')
                    return (
                      <div key={li} style={{
                        fontWeight: isSlot || isHeading ? 700 : 400,
                        color: isHeading ? '#15803D' : '#166534',
                        fontFamily: isSlot ? 'ui-monospace, SFMono-Regular, monospace' : 'inherit',
                      }}>
                        {line || ' '}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Examples */}
              <div>
                {p.examples.map((ex, j) => {
                  const translation = (ex.translations as Record<string, string>)[lang] ?? ex.translations.en
                  return (
                    <div key={j} style={{ paddingLeft: 8, marginBottom: j < p.examples.length - 1 ? 12 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', paddingLeft: 6 }}>
                          {ex.korean}
                        </div>
                        {j === 0 && <span style={{ marginRight: 12 }}><SpeakAllBtn sentences={p.examples.map(e => e.korean)} size={14} color="#CCCCCC" activeColor={ACCENT} /></span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#999999', marginTop: 2, paddingLeft: 14 }}>
                        {translation}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
