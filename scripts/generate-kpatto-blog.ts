/**
 * Generate 200 EN blog posts for k-patto (Korean learning)
 * Inserts into blog_posts with app='k-patto', locale='en', published_at=null
 *
 * Run: npx tsx scripts/generate-kpatto-blog.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 70)
}

// ── Category 1: Language Learning Theory (30 posts) ────────────────────────
const cat1Topics = [
  { title: 'Why Spaced Repetition Is the Secret to Korean Fluency', tags: ['spaced-repetition', 'korean-learning', 'memory'] },
  { title: 'Pattern-Based Learning: The Fastest Path to Korean', tags: ['patterns', 'korean-learning', 'method'] },
  { title: 'Does Korean Immersion Actually Work?', tags: ['immersion', 'korean-learning', 'input'] },
  { title: 'Input vs Output: What Korean Learners Get Wrong', tags: ['input', 'output', 'korean-learning'] },
  { title: 'How Long Does It Really Take to Learn Korean?', tags: ['fluency', 'timeline', 'korean-learning'] },
  { title: '5 Mistakes Western Learners Make When Studying Korean', tags: ['mistakes', 'tips', 'korean-learning'] },
  { title: 'Why Grammar-First Fails Korean Learners', tags: ['grammar', 'method', 'korean-learning'] },
  { title: 'Muscle Memory in Korean: How to Make Patterns Automatic', tags: ['muscle-memory', 'patterns', 'fluency'] },
  { title: 'The Role of Comprehensible Input in Korean Acquisition', tags: ['input', 'krashen', 'korean-learning'] },
  { title: 'Why Korean Is Easier Than You Think for English Speakers', tags: ['korean-learning', 'beginner', 'motivation'] },
  { title: 'How Context Beats Rote Memorization in Korean', tags: ['context', 'vocabulary', 'korean-learning'] },
  { title: 'The Output Hypothesis: Why Speaking Korean Matters', tags: ['speaking', 'output', 'fluency'] },
  { title: 'Building a Korean Study Routine That Actually Sticks', tags: ['habits', 'study-routine', 'korean-learning'] },
  { title: 'Why Korean Beginners Plateau — and How to Break Through', tags: ['plateau', 'korean-learning', 'progress'] },
  { title: 'The Science Behind Learning Korean Patterns', tags: ['science', 'patterns', 'korean-learning'] },
  { title: 'Interleaved Practice: The Korean Study Method You Are Missing', tags: ['study-method', 'korean-learning', 'memory'] },
  { title: 'Why Passive Listening Alone Will Not Make You Fluent in Korean', tags: ['listening', 'immersion', 'korean-learning'] },
  { title: 'How Sleep Helps You Remember Korean Vocabulary', tags: ['memory', 'sleep', 'korean-learning'] },
  { title: 'The Forgetting Curve and Korean Vocabulary Retention', tags: ['memory', 'spaced-repetition', 'vocabulary'] },
  { title: 'Why Motivation Alone Is Not Enough to Learn Korean', tags: ['motivation', 'habits', 'korean-learning'] },
  { title: 'How to Use Retrieval Practice for Korean Grammar', tags: ['retrieval-practice', 'grammar', 'korean-learning'] },
  { title: 'The Power of Minimal Pairs in Korean Pronunciation', tags: ['pronunciation', 'korean-learning', 'phonetics'] },
  { title: 'How Chunking Transforms Korean Speaking Speed', tags: ['chunking', 'speaking', 'fluency'] },
  { title: 'Why Korean Learners Should Focus on High-Frequency Patterns', tags: ['patterns', 'frequency', 'korean-learning'] },
  { title: 'The Importance of Noticing in Korean Language Acquisition', tags: ['noticing', 'input', 'korean-learning'] },
  { title: 'Active vs Passive Vocabulary in Korean: What You Need to Know', tags: ['vocabulary', 'korean-learning', 'speaking'] },
  { title: 'How to Create a Korean Immersion Environment at Home', tags: ['immersion', 'environment', 'korean-learning'] },
  { title: 'Why Korean Learners Should Embrace Making Mistakes', tags: ['mistakes', 'speaking', 'confidence'] },
  { title: 'The Neuroscience of Learning Korean as an Adult', tags: ['neuroscience', 'adult-learning', 'korean-learning'] },
  { title: 'How to Measure Your Korean Progress Accurately', tags: ['progress', 'assessment', 'korean-learning'] },
]

// ── Category 2: Korean Language Characteristics (50 posts) ─────────────────
const cat2Topics = [
  { title: 'Korean Sentence Structure (SOV): Why the Verb Goes Last', tags: ['grammar', 'sentence-structure', 'korean'] },
  { title: 'Korean Particles Explained: 은/는 vs 이/가', tags: ['particles', 'grammar', 'korean'] },
  { title: 'Object Markers 을/를: When and How to Use Them', tags: ['particles', 'grammar', 'korean'] },
  { title: 'Location Particles 에 vs 에서: The Key Difference', tags: ['particles', 'grammar', 'korean'] },
  { title: 'Korean Honorifics (존댓말): A Complete Beginner\'s Guide', tags: ['honorifics', 'politeness', 'korean'] },
  { title: 'The History of Hangul: Why Korea\'s Alphabet Is Genius', tags: ['hangul', 'history', 'korean'] },
  { title: 'Korean Consonant Clusters: How to Pronounce Them', tags: ['pronunciation', 'consonants', 'korean'] },
  { title: 'Vowel Harmony in Korean: Does It Still Matter?', tags: ['vowels', 'grammar', 'korean'] },
  { title: 'Korean vs Japanese: Similarities Learners Can Use', tags: ['comparison', 'japanese', 'korean'] },
  { title: 'Korean vs Chinese: What They Share and Where They Differ', tags: ['comparison', 'chinese', 'korean'] },
  { title: 'Why Korean Has No Articles (a, an, the)', tags: ['grammar', 'articles', 'korean'] },
  { title: 'Topic Markers vs Subject Markers in Korean: The Real Difference', tags: ['particles', 'topic', 'korean'] },
  { title: 'Korean Verb Conjugation for Beginners', tags: ['verbs', 'conjugation', 'korean'] },
  { title: 'Korean Adjectives That Act Like Verbs', tags: ['adjectives', 'grammar', 'korean'] },
  { title: 'Understanding Korean Tense: Past, Present, Future', tags: ['tense', 'grammar', 'korean'] },
  { title: 'The Korean Passive Voice: How It Really Works', tags: ['passive', 'grammar', 'korean'] },
  { title: 'Korean Numbers: Native vs Sino-Korean System', tags: ['numbers', 'vocabulary', 'korean'] },
  { title: 'Korean Counters (단위명사): The Guide You Need', tags: ['counters', 'grammar', 'korean'] },
  { title: 'How Korean Expresses Negation', tags: ['negation', 'grammar', 'korean'] },
  { title: 'Korean Questions: The Intonation Trick That Changes Everything', tags: ['questions', 'intonation', 'korean'] },
  { title: 'The Korean Connective -고: Linking Actions and Ideas', tags: ['connectives', 'grammar', 'korean'] },
  { title: 'Korean -아서/어서: Expressing Reason and Sequence', tags: ['connectives', 'grammar', 'korean'] },
  { title: 'Korean Conditionals: -면/으면 Explained', tags: ['conditionals', 'grammar', 'korean'] },
  { title: 'Korean Reported Speech: How to Say "They Said"', tags: ['reported-speech', 'grammar', 'korean'] },
  { title: 'Why Korean Verbs Come With So Many Endings', tags: ['verb-endings', 'grammar', 'korean'] },
  { title: 'Korean Double Negatives and What They Mean', tags: ['negation', 'grammar', 'korean'] },
  { title: 'Korean Postpositions vs English Prepositions', tags: ['postpositions', 'comparison', 'korean'] },
  { title: 'The Korean Sentence-Final Endings That Express Emotion', tags: ['sentence-endings', 'emotion', 'korean'] },
  { title: 'Korean Determiners and How They Work', tags: ['determiners', 'grammar', 'korean'] },
  { title: 'How Korean Expresses Time and Duration', tags: ['time', 'grammar', 'korean'] },
  { title: 'Korean Sound Changes (연음): Why Words Sound Different', tags: ['pronunciation', 'sound-change', 'korean'] },
  { title: 'Tensed Consonants (경음) in Korean: ㄲ, ㄸ, ㅃ, ㅆ, ㅉ', tags: ['pronunciation', 'consonants', 'korean'] },
  { title: 'Aspirated Consonants in Korean: ㅋ, ㅌ, ㅍ, ㅊ', tags: ['pronunciation', 'consonants', 'korean'] },
  { title: 'Korean Syllable Structure: Why Every Block Matters', tags: ['hangul', 'syllables', 'korean'] },
  { title: 'Korean Loan Words from English: More Than You Think', tags: ['loanwords', 'vocabulary', 'korean'] },
  { title: 'Sino-Korean vs Native Korean: Which Words Are Which?', tags: ['vocabulary', 'etymology', 'korean'] },
  { title: 'Korean Reduplication: When Words Double Up', tags: ['reduplication', 'vocabulary', 'korean'] },
  { title: 'How Korean Expresses Ability and Possibility', tags: ['modality', 'grammar', 'korean'] },
  { title: 'Korean Politeness Levels Explained Simply', tags: ['politeness', 'honorifics', 'korean'] },
  { title: 'Korean Informal Speech (반말): When to Use It', tags: ['informal', 'politeness', 'korean'] },
  { title: 'How Korean Expresses Want and Desire', tags: ['desire', 'grammar', 'korean'] },
  { title: 'Korean Onomatopoeia: Sound Words That Paint a Picture', tags: ['onomatopoeia', 'vocabulary', 'korean'] },
  { title: 'Korean Idiomatic Expressions and Their Origins', tags: ['idioms', 'vocabulary', 'korean'] },
  { title: 'How Word Order Flexibility Works in Korean', tags: ['word-order', 'grammar', 'korean'] },
  { title: 'The Korean Copula 이다: More Than Just "To Be"', tags: ['copula', 'grammar', 'korean'] },
  { title: 'Korean Existential Verbs: 있다 and 없다', tags: ['verbs', 'grammar', 'korean'] },
  { title: 'Korean Spatial Vocabulary: Directions and Positions', tags: ['vocabulary', 'spatial', 'korean'] },
  { title: 'Korean Body Language and What It Communicates', tags: ['culture', 'body-language', 'korean'] },
  { title: 'How Context Determines Formality in Korean', tags: ['formality', 'context', 'korean'] },
  { title: 'Korean Color Terms and Their Cultural Meaning', tags: ['vocabulary', 'culture', 'korean'] },
]

// ── Category 3: Korean Learning Tips & Tricks (40 posts) ───────────────────
const cat3Topics = [
  { title: 'How to Learn Korean Through K-Dramas Effectively', tags: ['k-drama', 'listening', 'korean-learning'] },
  { title: 'K-Pop Lyrics as Korean Study Material: A Full Guide', tags: ['k-pop', 'listening', 'korean-learning'] },
  { title: 'How to Practice Korean Speaking Alone at Home', tags: ['speaking', 'self-study', 'korean-learning'] },
  { title: 'The Best Way to Use Anki for Korean Vocabulary', tags: ['anki', 'vocabulary', 'korean-learning'] },
  { title: 'Korean Typing Practice: How to Get Fast on a Korean Keyboard', tags: ['typing', 'practice', 'korean-learning'] },
  { title: 'Common Pronunciation Mistakes Korean Learners Make', tags: ['pronunciation', 'mistakes', 'korean-learning'] },
  { title: 'How to Remember Korean Vocabulary Without Flashcards', tags: ['vocabulary', 'memory', 'korean-learning'] },
  { title: 'The Shadowing Method for Korean: Step by Step', tags: ['shadowing', 'pronunciation', 'korean-learning'] },
  { title: 'How to Find a Korean Language Exchange Partner', tags: ['language-exchange', 'speaking', 'korean-learning'] },
  { title: 'Using Korean Webtoons to Improve Reading Speed', tags: ['reading', 'webtoon', 'korean-learning'] },
  { title: 'How to Watch Korean TV Without Subtitles', tags: ['listening', 'immersion', 'korean-learning'] },
  { title: 'The 10-Minute Daily Korean Practice That Actually Works', tags: ['daily-practice', 'habits', 'korean-learning'] },
  { title: 'How to Study Korean Grammar Without Getting Bored', tags: ['grammar', 'motivation', 'korean-learning'] },
  { title: 'Korean Dictation Practice: The Underrated Skill Builder', tags: ['dictation', 'listening', 'korean-learning'] },
  { title: 'How to Read Korean News as a Beginner', tags: ['reading', 'news', 'korean-learning'] },
  { title: 'Korean Journaling: Write Your Way to Fluency', tags: ['writing', 'journaling', 'korean-learning'] },
  { title: 'How to Use Naver Dictionary for Korean Learning', tags: ['tools', 'dictionary', 'korean-learning'] },
  { title: 'Korean Pronunciation Drills You Can Do in the Car', tags: ['pronunciation', 'practice', 'korean-learning'] },
  { title: 'How to Set Up a Korean Learning Schedule That Works', tags: ['schedule', 'habits', 'korean-learning'] },
  { title: 'The Role of Korean Music in Accent Reduction', tags: ['accent', 'music', 'korean-learning'] },
  { title: 'How to Use Korean YouTube Channels to Learn Naturally', tags: ['youtube', 'listening', 'korean-learning'] },
  { title: 'Korean Tongue Twisters for Pronunciation Practice', tags: ['pronunciation', 'practice', 'korean-learning'] },
  { title: 'How to Learn Korean Particles Through Stories', tags: ['particles', 'stories', 'korean-learning'] },
  { title: 'Korean Listening Strategies for Intermediate Learners', tags: ['listening', 'strategy', 'korean-learning'] },
  { title: 'How to Build Korean Vocabulary Through Reading', tags: ['reading', 'vocabulary', 'korean-learning'] },
  { title: 'The Best Korean Podcasts for Language Learners', tags: ['podcasts', 'listening', 'korean-learning'] },
  { title: 'How to Self-Correct Your Korean Without a Teacher', tags: ['self-study', 'correction', 'korean-learning'] },
  { title: 'Korean Learning Apps Compared: What Actually Works', tags: ['apps', 'tools', 'korean-learning'] },
  { title: 'How to Track Korean Vocabulary Growth Over Time', tags: ['vocabulary', 'tracking', 'korean-learning'] },
  { title: 'Korean Conversation Starters You Can Use Today', tags: ['speaking', 'conversation', 'korean-learning'] },
  { title: 'How to Use Korean Social Media to Improve Naturally', tags: ['social-media', 'immersion', 'korean-learning'] },
  { title: 'Making Korean Sticky: Connecting Words to Memories', tags: ['memory', 'vocabulary', 'korean-learning'] },
  { title: 'How to Overcome Fear of Speaking Korean', tags: ['speaking', 'confidence', 'korean-learning'] },
  { title: 'Korean Learning Through Cooking: Food Vocabulary Guide', tags: ['vocabulary', 'food', 'korean-learning'] },
  { title: 'How to Get Korean Feedback Without a Tutor', tags: ['feedback', 'self-study', 'korean-learning'] },
  { title: 'The Best Korean Textbooks Ranked for Self-Learners', tags: ['textbooks', 'resources', 'korean-learning'] },
  { title: 'How to Stay Consistent With Korean When Life Gets Busy', tags: ['consistency', 'habits', 'korean-learning'] },
  { title: 'Korean Conversation Practice With AI: Does It Work?', tags: ['ai', 'speaking', 'korean-learning'] },
  { title: 'How to Learn Korean Through Travel in Korea', tags: ['travel', 'immersion', 'korean-learning'] },
  { title: 'What to Do When You Hit a Korean Learning Slump', tags: ['motivation', 'slump', 'korean-learning'] },
]

// ── Category 4: Patterns Work Series (50 posts) ────────────────────────────
const cat4Topics = [
  { title: '~는 것 같아: How to Express "I Think" in Korean Naturally', pattern: '~는 것 같아', tags: ['korean-patterns', 'speaking', 'korean'] },
  { title: '~잖아: The Pattern That Says "You Know" in Korean', pattern: '~잖아', tags: ['korean-patterns', 'speaking', 'korean'] },
  { title: '~거든: How Koreans Explain Themselves Naturally', pattern: '~거든', tags: ['korean-patterns', 'speaking', 'korean'] },
  { title: '~던데: How to Share What You Noticed in Korean', pattern: '~던데', tags: ['korean-patterns', 'speaking', 'korean'] },
  { title: '~ㄹ/을 것 같다: Making Predictions in Korean', pattern: '~ㄹ/을 것 같다', tags: ['korean-patterns', 'prediction', 'korean'] },
  { title: '~아/어 보다: How to Say "Try Doing" in Korean', pattern: '~아/어 보다', tags: ['korean-patterns', 'speaking', 'korean'] },
  { title: '~고 싶다: Expressing What You Want in Korean', pattern: '~고 싶다', tags: ['korean-patterns', 'desire', 'korean'] },
  { title: '~(으)ㄹ 수 있다: Expressing Ability in Korean', pattern: '~(으)ㄹ 수 있다', tags: ['korean-patterns', 'ability', 'korean'] },
  { title: '~아/어야 하다: The "Have To" Pattern in Korean', pattern: '~아/어야 하다', tags: ['korean-patterns', 'obligation', 'korean'] },
  { title: '~지 않다: The Clean Negation Pattern in Korean', pattern: '~지 않다', tags: ['korean-patterns', 'negation', 'korean'] },
  { title: '~는데: How to Use This Essential Connector', pattern: '~는데', tags: ['korean-patterns', 'connector', 'korean'] },
  { title: '~(으)면: Making Conditionals Feel Natural in Korean', pattern: '~(으)면', tags: ['korean-patterns', 'conditional', 'korean'] },
  { title: '~기 때문에: Giving Reasons Like a Native Speaker', pattern: '~기 때문에', tags: ['korean-patterns', 'reason', 'korean'] },
  { title: '~(으)니까: Why Koreans Use This Instead of 때문에', pattern: '~(으)니까', tags: ['korean-patterns', 'reason', 'korean'] },
  { title: '~(으)면서: Doing Two Things at Once in Korean', pattern: '~(으)면서', tags: ['korean-patterns', 'simultaneous', 'korean'] },
  { title: '~자마자: "As Soon As" in Korean — The Natural Way', pattern: '~자마자', tags: ['korean-patterns', 'time', 'korean'] },
  { title: '~기 전에: Talking About "Before" in Korean', pattern: '~기 전에', tags: ['korean-patterns', 'time', 'korean'] },
  { title: '~(으)ㄴ 후에: How to Say "After" in Korean', pattern: '~(으)ㄴ 후에', tags: ['korean-patterns', 'time', 'korean'] },
  { title: '~는 동안: Expressing Duration in Korean Naturally', pattern: '~는 동안', tags: ['korean-patterns', 'time', 'korean'] },
  { title: '~(으)ㄹ 때: Setting the Scene With "When" in Korean', pattern: '~(으)ㄹ 때', tags: ['korean-patterns', 'time', 'korean'] },
  { title: '~아/어서: The Cause-and-Effect Pattern in Korean', pattern: '~아/어서', tags: ['korean-patterns', 'cause-effect', 'korean'] },
  { title: '~고 나서: "After Doing" — A Step-by-Step Pattern', pattern: '~고 나서', tags: ['korean-patterns', 'sequence', 'korean'] },
  { title: '~(으)ㄹ게요: Making Promises and Offers in Korean', pattern: '~(으)ㄹ게요', tags: ['korean-patterns', 'promise', 'korean'] },
  { title: '~(으)ㄹ까요?: Suggesting Things in Korean', pattern: '~(으)ㄹ까요?', tags: ['korean-patterns', 'suggestion', 'korean'] },
  { title: '~(으)ㄹ래요?: Asking Preferences in Korean', pattern: '~(으)ㄹ래요?', tags: ['korean-patterns', 'preference', 'korean'] },
  { title: '~(으)세요: Making Polite Requests in Korean', pattern: '~(으)세요', tags: ['korean-patterns', 'request', 'korean'] },
  { title: '~지 마세요: How to Say "Don\'t" Politely in Korean', pattern: '~지 마세요', tags: ['korean-patterns', 'prohibition', 'korean'] },
  { title: '~(으)ㄴ/는 것 같다: Softening Opinions in Korean', pattern: '~(으)ㄴ/는 것 같다', tags: ['korean-patterns', 'opinion', 'korean'] },
  { title: '~아/어 보이다: How to Say "It Looks Like" in Korean', pattern: '~아/어 보이다', tags: ['korean-patterns', 'appearance', 'korean'] },
  { title: '~(으)ㄴ 적이 있다: Talking About Past Experiences', pattern: '~(으)ㄴ 적이 있다', tags: ['korean-patterns', 'experience', 'korean'] },
  { title: '~아/어 본 적이 있다: Have You Ever Tried in Korean?', pattern: '~아/어 본 적이 있다', tags: ['korean-patterns', 'experience', 'korean'] },
  { title: '~(으)ㄹ 것이다: Expressing Future Plans in Korean', pattern: '~(으)ㄹ 것이다', tags: ['korean-patterns', 'future', 'korean'] },
  { title: '~고 있다: The Korean Present Progressive', pattern: '~고 있다', tags: ['korean-patterns', 'progressive', 'korean'] },
  { title: '~아/어 있다: Describing a Resulting State in Korean', pattern: '~아/어 있다', tags: ['korean-patterns', 'state', 'korean'] },
  { title: '~게 되다: How to Describe How Things Came to Be', pattern: '~게 되다', tags: ['korean-patterns', 'change', 'korean'] },
  { title: '~아/어 버리다: Expressing Completion or Regret in Korean', pattern: '~아/어 버리다', tags: ['korean-patterns', 'completion', 'korean'] },
  { title: '~(으)ㄹ 뻔하다: The "Almost" Pattern in Korean', pattern: '~(으)ㄹ 뻔하다', tags: ['korean-patterns', 'near-miss', 'korean'] },
  { title: '~는 바람에: Unexpected Consequences in Korean', pattern: '~는 바람에', tags: ['korean-patterns', 'consequence', 'korean'] },
  { title: '~(으)ㄹ수록: The More... The More in Korean', pattern: '~(으)ㄹ수록', tags: ['korean-patterns', 'comparison', 'korean'] },
  { title: '~는 반면에: Contrasting Ideas in Korean', pattern: '~는 반면에', tags: ['korean-patterns', 'contrast', 'korean'] },
  { title: '~도 불구하고: "Despite" and "Although" in Korean', pattern: '~도 불구하고', tags: ['korean-patterns', 'concession', 'korean'] },
  { title: '~(으)ㄹ 텐데: Speculating About the Present or Future', pattern: '~(으)ㄹ 텐데', tags: ['korean-patterns', 'speculation', 'korean'] },
  { title: '~았/었으면 좋겠다: Expressing Wishes in Korean', pattern: '~았/었으면 좋겠다', tags: ['korean-patterns', 'wish', 'korean'] },
  { title: '~(으)ㄴ/는 편이다: Tendencies and Generalizations in Korean', pattern: '~(으)ㄴ/는 편이다', tags: ['korean-patterns', 'tendency', 'korean'] },
  { title: '~에 비해: Comparing Things Naturally in Korean', pattern: '~에 비해', tags: ['korean-patterns', 'comparison', 'korean'] },
  { title: '~에 따라: "Depending On" in Korean', pattern: '~에 따라', tags: ['korean-patterns', 'condition', 'korean'] },
  { title: '~에 대해: Talking About Topics in Korean', pattern: '~에 대해', tags: ['korean-patterns', 'topic', 'korean'] },
  { title: '~(이)라도: "At Least" and "Even If" in Korean', pattern: '~(이)라도', tags: ['korean-patterns', 'concession', 'korean'] },
  { title: '~밖에: The "Nothing But" Pattern in Korean', pattern: '~밖에', tags: ['korean-patterns', 'limitation', 'korean'] },
  { title: '~만큼: Expressing Degree and Proportion in Korean', pattern: '~만큼', tags: ['korean-patterns', 'degree', 'korean'] },
]

// ── Category 5: K-Culture & Language (30 posts) ────────────────────────────
const cat5Topics = [
  { title: 'Korean Slang from Social Media You Need to Know', tags: ['slang', 'social-media', 'korean-culture'] },
  { title: 'Konglish Words: When English Becomes Korean', tags: ['konglish', 'loanwords', 'korean-culture'] },
  { title: 'Korean Internet Culture Expressions Explained', tags: ['internet', 'slang', 'korean-culture'] },
  { title: 'How BTS Lyrics Teach You Real Korean', tags: ['bts', 'k-pop', 'korean-culture'] },
  { title: 'Korean Food Vocabulary: Beyond Kimchi and Bibimbap', tags: ['food', 'vocabulary', 'korean-culture'] },
  { title: 'K-Drama Vocabulary Guide: 50 Phrases You Will Hear Constantly', tags: ['k-drama', 'vocabulary', 'korean-culture'] },
  { title: 'How Korean Age Works and Why It Matters', tags: ['culture', 'age', 'korean-culture'] },
  { title: 'Korean Drinking Culture Vocabulary Explained', tags: ['culture', 'vocabulary', 'korean-culture'] },
  { title: 'Korean Wedding Expressions and Vocabulary', tags: ['culture', 'vocabulary', 'korean-culture'] },
  { title: 'Aegyo (애교): Korean Cute Speech and How It Works', tags: ['aegyo', 'speech', 'korean-culture'] },
  { title: 'Korean Workplace Language: Formality at the Office', tags: ['workplace', 'formality', 'korean-culture'] },
  { title: 'How Koreans Use Silence in Conversation', tags: ['culture', 'communication', 'korean-culture'] },
  { title: 'Korean Fan Culture Language: How Fandoms Talk', tags: ['fandom', 'vocabulary', 'korean-culture'] },
  { title: 'Korean Military Slang That Entered Everyday Speech', tags: ['slang', 'military', 'korean-culture'] },
  { title: 'Busan Dialect vs Seoul Korean: Key Differences', tags: ['dialect', 'regional', 'korean-culture'] },
  { title: 'Korean Texting Abbreviations You Should Know', tags: ['texting', 'abbreviations', 'korean-culture'] },
  { title: 'How Korean Expresses Emotion Differently From English', tags: ['emotion', 'culture', 'korean-culture'] },
  { title: 'Korean Proverbs and What They Reveal About Culture', tags: ['proverbs', 'culture', 'korean-culture'] },
  { title: 'K-Beauty Vocabulary: Skincare Terms in Korean', tags: ['beauty', 'vocabulary', 'korean-culture'] },
  { title: 'How Korean Variety Shows Teach Informal Language', tags: ['variety-show', 'informal', 'korean-culture'] },
  { title: 'Korean Gaming Vocabulary and Streaming Slang', tags: ['gaming', 'slang', 'korean-culture'] },
  { title: 'Korean School Culture and Education Vocabulary', tags: ['education', 'culture', 'korean-culture'] },
  { title: 'How Korean Celebrity Culture Shapes Everyday Speech', tags: ['celebrity', 'language', 'korean-culture'] },
  { title: 'Korean New Year Expressions and Holiday Phrases', tags: ['holidays', 'culture', 'korean-culture'] },
  { title: 'Understanding Han (한): The Korean Emotional Concept', tags: ['han', 'emotion', 'korean-culture'] },
  { title: 'Korean Coffee Shop Culture and Café Vocabulary', tags: ['café', 'vocabulary', 'korean-culture'] },
  { title: 'How K-Drama Titles Teach You Korean Grammar', tags: ['k-drama', 'grammar', 'korean-culture'] },
  { title: 'Korean Sports Vocabulary: Watching the Game in Korean', tags: ['sports', 'vocabulary', 'korean-culture'] },
  { title: 'Seasonal Korean: How Language Changes With the Weather', tags: ['seasons', 'vocabulary', 'korean-culture'] },
  { title: 'Korean Travel Phrases That Go Beyond the Phrasebook', tags: ['travel', 'phrases', 'korean-culture'] },
]

// ── Content generators ──────────────────────────────────────────────────────

function generateCat1Content(title: string): { description: string; content: string } {
  const description = `${title} — a deep dive into the theory and science behind effective Korean language learning.`
  const content = `## ${title}

Every Korean learner hits a moment where they wonder: am I doing this right? This post addresses one of the most important concepts in language acquisition — one that can make or break your progress with Korean.

---

## Why This Matters More Than You Think

Most people approach Korean the way they were taught to study in school: memorize, test, repeat. But language acquisition doesn't work like test prep. Your brain needs to build **automatic, pattern-based recognition** — and that requires a different approach entirely.

The research is clear: learners who understand *how* the brain acquires language learn faster, retain more, and speak more naturally. The ones who grind through textbooks alone plateau quickly.

---

## The Core Insight

${title} isn't just theory — it's a practical framework that changes how you spend every study session.

When you internalize this principle, you stop wasting time on low-return activities and start investing in what actually moves the needle. For Korean specifically, this means spending more time on high-frequency patterns in real contexts, and less time on isolated grammar drills.

The key insight: **your brain learns Korean by encountering patterns repeatedly in meaningful situations**, not by analyzing rules in isolation. Every time you hear or see a Korean pattern in context, a neural pathway gets slightly stronger. Enough repetitions, and the pattern becomes automatic.

---

## How to Apply This to Korean Learning

Here's what this looks like in practice:

- **Choose comprehensible input** — material you understand 80-90% of. Korean that's too hard doesn't build pathways; it just creates noise.
- **Prioritize patterns over rules** — instead of memorizing grammar tables, learn how the 50 most common Korean sentence patterns *feel* in real sentences.
- **Review at the right intervals** — your memory follows a predictable forgetting curve. Space your reviews to hit just before you forget.
- **Produce, don't just consume** — speaking and writing activate different neural pathways than listening and reading. You need both.

---

## The Pattern-Based Shortcut

K-Patto is built on exactly this insight. Instead of drilling rules, you absorb Korean through stories that use the same patterns repeatedly — letting your brain build the connections naturally.

> **The fastest path to Korean fluency isn't studying harder. It's studying the right things, the right way.**

---

Learn Korean patterns naturally with K-Patto. [Coming soon → atlaslabstudios.com]`
  return { description, content }
}

function generateCat2Content(title: string): { description: string; content: string } {
  const description = `${title} — understand how Korean grammar and structure really work, with clear examples and explanations.`
  const content = `## ${title}

One of the most rewarding parts of learning Korean is discovering how its grammar system actually works. What looks complex at first reveals elegant logic once you understand the underlying patterns.

---

## Why Korean Grammar Is Logical (Once You See It)

Korean isn't random. Every grammatical feature — particles, verb endings, politeness levels — serves a clear communicative purpose. English speakers often struggle at first because Korean's logic is *different*, not harder.

The learner who treats Korean grammar as a puzzle to decode, rather than rules to memorize, will always advance faster.

---

## The Core Concept

${title} is one of those features that Korean learners need to truly internalize — not just understand intellectually, but recognize automatically in conversation.

Here's what makes this particular aspect of Korean interesting: it solves a communication problem that every language has to handle. Korean just handles it differently from English. Once you understand the *why* behind it, everything clicks.

**The key to making this automatic**: expose yourself to it through real sentences and stories, not through isolated grammar tables. Your brain is wired to learn patterns in context.

---

## Real Examples

Learning grammar without examples is like learning to swim without water. Here are patterns you'll encounter immediately in Korean conversations and media:

- In everyday speech, this feature appears constantly — often in ways textbooks don't capture well.
- Native speakers use it automatically; they don't think about the rule. That's your goal too.
- Context shapes meaning more than structure in most cases.

---

## Common Mistakes Learners Make

The most common mistake: treating this feature as a direct translation of the English equivalent. Korean doesn't have a one-to-one match for most grammatical features. Instead, look for the *function* it serves in communication.

---

## Building Automatic Recognition

The best way to master this: encounter it hundreds of times in real Korean content. K-Patto's story-based approach builds this naturally — each story is engineered to reinforce core patterns through repetition and context.

> **Understanding Korean grammar is the first step. Making it automatic is the real goal.**

---

Learn Korean patterns naturally with K-Patto. [Coming soon → atlaslabstudios.com]`
  return { description, content }
}

function generateCat3Content(title: string): { description: string; content: string } {
  const description = `${title} — practical, actionable advice for Korean learners who want real results from their study time.`
  const content = `## ${title}

The difference between Korean learners who make rapid progress and those who plateau for years often comes down to *how* they practice — not *how much*.

---

## The Problem With Most Korean Study Advice

Most advice tells you what to study — vocabulary lists, grammar rules, textbook chapters. Very little tells you *how* to study in a way that actually sticks.

This post is about a specific technique that consistently produces better results for Korean learners. It's not flashy or expensive. It's just effective.

---

## Why This Works for Korean

Korean has some features that make certain study methods more effective than others:

1. **Pattern density** — Korean conversation relies on a relatively small set of high-frequency sentence patterns. Once you own those, you can say almost anything.
2. **Sound system** — Korean's phonology is learnable but requires deliberate practice. Passive listening only takes you so far.
3. **Script** — Hangul is phonetically consistent, which means reading and listening reinforce each other powerfully.

${title} takes advantage of one or more of these features directly.

---

## How to Apply It Today

You don't need special equipment, a language partner, or hours of free time. Here's a minimal version you can start immediately:

**Step 1:** Choose one piece of Korean content at your level — a YouTube video, a webtoon panel, a K-drama scene with subtitles off.

**Step 2:** Apply the technique described in this post's title directly to that content.

**Step 3:** Repeat three times across the week. Your brain needs spaced exposure, not marathon sessions.

The compound effect kicks in after 2-3 weeks. Most learners quit before then — don't be one of them.

---

## The Pattern Shortcut

Every technique works better when your underlying Korean pattern knowledge is solid. If you're struggling with a method, it may be because your pattern base isn't strong enough yet.

K-Patto builds that foundation systematically — so every other technique you try works better.

> **One effective technique applied consistently beats ten techniques tried once.**

---

Learn Korean patterns naturally with K-Patto. [Coming soon → atlaslabstudios.com]`
  return { description, content }
}

function generateCat4Content(title: string, pattern: string): { description: string; content: string } {
  const description = `Learn how to use the Korean pattern "${pattern}" naturally — with real examples, common mistakes, and speaking tips.`
  const content = `## ${title}

If you've spent any time watching Korean dramas or listening to Korean conversations, you've heard **${pattern}** dozens of times. It's one of those patterns that native speakers use constantly — but textbooks often fail to teach *how* to use it naturally.

---

## What Does ${pattern} Actually Mean?

This pattern isn't just a grammar rule. It's a communication tool — a way of framing ideas that feels natural to Korean speakers. Understanding the feeling behind it is more important than memorizing the conjugation table.

At its core, **${pattern}** expresses a specific communicative intention. Native speakers reach for it automatically when they want to convey that particular nuance. Once you internalize when that nuance is needed, using the pattern correctly becomes instinctive.

---

## Real Examples in Context

The best way to learn any Korean pattern is through examples in real situations:

**Example 1 — Casual conversation:**
Korean speakers use ${pattern} in everyday speech to express their thoughts naturally. The key is that it sounds spontaneous, not studied.

**Example 2 — Expressing nuance:**
This pattern carries emotional or logical information that Korean speakers pack into a single ending. In English, you'd need an extra clause to express the same thing.

**Example 3 — Responding to someone:**
In dialogue, ${pattern} often appears as a response marker — a way of acknowledging context before adding your own perspective.

---

## Common Mistakes

**Mistake 1: Overusing it.** Native speakers use this pattern in specific contexts. Using it everywhere makes you sound unnatural.

**Mistake 2: Wrong formality level.** The form of ${pattern} changes depending on whether you're speaking formally or casually. Learn both.

**Mistake 3: Translating literally.** There's no perfect English equivalent. Focus on the *feeling* the pattern conveys, not a word-for-word translation.

---

## How to Make This Pattern Automatic

The only way to truly own a Korean pattern is to encounter it hundreds of times in context. Reading about it helps you understand it — exposure makes it automatic.

K-Patto's stories are built around exactly this: each story reinforces core patterns through natural repetition, so your brain builds the pathways without conscious effort.

> **You don't "know" a pattern until you use it without thinking. That's the real goal.**

---

Learn Korean patterns naturally with K-Patto. [Coming soon → atlaslabstudios.com]`
  return { description, content }
}

function generateCat5Content(title: string): { description: string; content: string } {
  const description = `${title} — explore the intersection of Korean language and culture, with vocabulary and context you won't find in textbooks.`
  const content = `## ${title}

Language and culture are inseparable — and nowhere is this truer than in Korean. The way Koreans speak reflects centuries of cultural values, social dynamics, and creative energy. Understanding the culture makes the language click in a way that no grammar textbook can replicate.

---

## Why Culture Is the Missing Piece

Most Korean learners focus entirely on structure: grammar, vocabulary, pronunciation. These are essential — but they're not enough. When you finally sit down with a Korean speaker or turn on a K-drama without subtitles, you'll encounter language that textbooks never prepared you for.

That's because real Korean is embedded in cultural context. Expressions, slang, and registers that sound strange in isolation make perfect sense once you understand the situation they come from.

---

## The Cultural Layer of Korean

${title} represents one of the most interesting intersections of Korean language and daily life. It's the kind of thing native speakers absorb growing up — and that language learners often miss entirely because it's not in any curriculum.

Understanding this cultural layer doesn't just make you sound more natural. It makes you a more interesting conversation partner. Koreans light up when they realize a foreign learner actually understands the cultural context behind what they're saying.

---

## Vocabulary and Expressions

Real-world Korean vocabulary from this cultural domain includes:

- Expressions that appear constantly in informal speech and media
- Phrases that signal cultural awareness and insider knowledge
- Words that have evolved through social media, entertainment, and everyday life

The best way to encounter these naturally: consume Korean content across multiple formats. Variety shows, social media, K-dramas, and music each carry their own vocabulary ecosystems.

---

## Making Cultural Knowledge Stick

Cultural knowledge compounds. Once you understand one layer of Korean cultural context, related vocabulary starts making sense. It's not about memorizing individual words — it's about building a mental model of how Korean speakers see the world.

K-Patto builds this through stories set in real Korean contexts — not just classroom dialogues, but situations you'll actually encounter.

> **The fastest way to sound natural in Korean is to understand why Koreans say what they say.**

---

Learn Korean patterns naturally with K-Patto. [Coming soon → atlaslabstudios.com]`
  return { description, content }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══ Generate K-Patto Blog Posts (200 EN) ═══\n')

  type PostRow = {
    app: string; locale: string; slug: string; title: string
    description: string; content: string; tags: string[]
    pattern_id: null; published_at: null
  }

  const allPosts: PostRow[] = []

  // Build all posts
  for (const t of cat1Topics) {
    const { description, content } = generateCat1Content(t.title)
    allPosts.push({ app: 'k-patto', locale: 'en', slug: slugify(t.title), title: t.title, description, content, tags: t.tags, pattern_id: null, published_at: null })
  }
  for (const t of cat2Topics) {
    const { description, content } = generateCat2Content(t.title)
    allPosts.push({ app: 'k-patto', locale: 'en', slug: slugify(t.title), title: t.title, description, content, tags: t.tags, pattern_id: null, published_at: null })
  }
  for (const t of cat3Topics) {
    const { description, content } = generateCat3Content(t.title)
    allPosts.push({ app: 'k-patto', locale: 'en', slug: slugify(t.title), title: t.title, description, content, tags: t.tags, pattern_id: null, published_at: null })
  }
  for (const t of cat4Topics) {
    const { description, content } = generateCat4Content(t.title, t.pattern)
    allPosts.push({ app: 'k-patto', locale: 'en', slug: slugify(t.title), title: t.title, description, content, tags: t.tags, pattern_id: null, published_at: null })
  }
  for (const t of cat5Topics) {
    const { description, content } = generateCat5Content(t.title)
    allPosts.push({ app: 'k-patto', locale: 'en', slug: slugify(t.title), title: t.title, description, content, tags: t.tags, pattern_id: null, published_at: null })
  }

  console.log(`Total posts to insert: ${allPosts.length}`)

  // Insert in batches of 20
  const BATCH = 20
  let successCount = 0
  const failures: string[] = []

  for (let i = 0; i < allPosts.length; i += BATCH) {
    const batch = allPosts.slice(i, i + BATCH)
    const { error } = await supabase
      .from('blog_posts')
      .upsert(batch, { onConflict: 'slug,locale' })

    if (error) {
      failures.push(`Batch ${Math.floor(i / BATCH) + 1}: ${error.message}`)
      console.error(`  ✗ Batch ${Math.floor(i / BATCH) + 1} failed: ${error.message}`)
    } else {
      successCount += batch.length
      console.log(`  ✓ Batch ${Math.floor(i / BATCH) + 1} (${i + 1}–${Math.min(i + BATCH, allPosts.length)}) inserted`)
    }
  }

  console.log(`\n═══ Done ═══════════════════════════════════`)
  console.log(`✓ Inserted: ${successCount} / ${allPosts.length} posts`)
  if (failures.length) {
    console.log(`\nFailures:`)
    failures.forEach(f => console.log('  -', f))
  }

  // ── Schedule: 5 per day, random KST 09:00~20:00 ──────────────────────────
  if (successCount === 0) return

  console.log('\n─── Scheduling posts ───')
  const { data: inserted } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('app', 'k-patto')
    .eq('locale', 'en')
    .order('id')

  if (!inserted || inserted.length === 0) {
    console.log('No posts found to schedule.')
    return
  }

  const startDate = new Date()
  startDate.setUTCHours(0, 0, 0, 0)

  for (let i = 0; i < inserted.length; i++) {
    const dayOffset = Math.floor(i / 5)
    const date = new Date(startDate)
    date.setUTCDate(date.getUTCDate() + dayOffset)
    date.setUTCHours(0, Math.floor(Math.random() * 660), 0, 0)

    await supabase
      .from('blog_posts')
      .update({ published_at: date.toISOString() })
      .eq('id', inserted[i].id)
  }

  const endDate = new Date(startDate)
  endDate.setUTCDate(endDate.getUTCDate() + Math.ceil(inserted.length / 5) - 1)

  console.log(`✓ Scheduled ${inserted.length} posts`)
  console.log(`  Start: ${startDate.toISOString().slice(0, 10)}`)
  console.log(`  End  : ${endDate.toISOString().slice(0, 10)}`)
  console.log(`  Days : ${Math.ceil(inserted.length / 5)}`)
}

main().catch(e => { console.error(e); process.exit(1) })
