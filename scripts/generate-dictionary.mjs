// Generates data/patto-dictionary.ts from a hardcoded English->Korean lookup map.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const LARGE_DICT = {
  // ── everyday nouns ──
  "week": { meaning: "주", pos: "noun", level: "A1" },
  "weekend": { meaning: "주말", pos: "noun", level: "A1" },
  "day": { meaning: "날, 하루", pos: "noun", level: "A1" },
  "days": { meaning: "날들", pos: "noun", level: "A1" },
  "time": { meaning: "시간", pos: "noun", level: "A1" },
  "times": { meaning: "번, 시대", pos: "noun", level: "A1" },
  "year": { meaning: "년, 해", pos: "noun", level: "A1" },
  "years": { meaning: "년, 해", pos: "noun", level: "A1" },
  "month": { meaning: "달, 월", pos: "noun", level: "A1" },
  "months": { meaning: "달", pos: "noun", level: "A1" },
  "hour": { meaning: "시간", pos: "noun", level: "A1" },
  "hours": { meaning: "시간", pos: "noun", level: "A1" },
  "minute": { meaning: "분", pos: "noun", level: "A1" },
  "minutes": { meaning: "분", pos: "noun", level: "A1" },
  "second": { meaning: "초; 두 번째의", pos: "noun", level: "A1" },
  "morning": { meaning: "아침", pos: "noun", level: "A1" },
  "afternoon": { meaning: "오후", pos: "noun", level: "A1" },
  "evening": { meaning: "저녁", pos: "noun", level: "A1" },
  "night": { meaning: "밤", pos: "noun", level: "A1" },
  "today": { meaning: "오늘", pos: "noun", level: "A1" },
  "tomorrow": { meaning: "내일", pos: "noun", level: "A1" },
  "yesterday": { meaning: "어제", pos: "noun", level: "A1" },
  "home": { meaning: "집", pos: "noun", level: "A1" },
  "house": { meaning: "집", pos: "noun", level: "A1" },
  "room": { meaning: "방", pos: "noun", level: "A1" },
  "kitchen": { meaning: "부엌", pos: "noun", level: "A1" },
  "door": { meaning: "문", pos: "noun", level: "A1" },
  "window": { meaning: "창문", pos: "noun", level: "A1" },
  "friend": { meaning: "친구", pos: "noun", level: "A1" },
  "friends": { meaning: "친구들", pos: "noun", level: "A1" },
  "family": { meaning: "가족", pos: "noun", level: "A1" },
  "people": { meaning: "사람들", pos: "noun", level: "A1" },
  "person": { meaning: "사람", pos: "noun", level: "A1" },
  "man": { meaning: "남자", pos: "noun", level: "A1" },
  "woman": { meaning: "여자", pos: "noun", level: "A1" },
  "child": { meaning: "아이", pos: "noun", level: "A1" },
  "children": { meaning: "아이들", pos: "noun", level: "A1" },
  "kid": { meaning: "아이", pos: "noun", level: "A1" },
  "kids": { meaning: "아이들", pos: "noun", level: "A1" },
  "life": { meaning: "삶, 생활", pos: "noun", level: "A1" },
  "thing": { meaning: "것, 물건", pos: "noun", level: "A1" },
  "things": { meaning: "것들", pos: "noun", level: "A1" },
  "place": { meaning: "장소, 곳", pos: "noun", level: "A1" },
  "places": { meaning: "장소들", pos: "noun", level: "A1" },
  "work": { meaning: "일, 작업", pos: "noun", level: "A1" },
  "job": { meaning: "직업, 일", pos: "noun", level: "A1" },
  "jobs": { meaning: "직업들", pos: "noun", level: "A1" },
  "office": { meaning: "사무실", pos: "noun", level: "A1" },
  "school": { meaning: "학교", pos: "noun", level: "A1" },
  "class": { meaning: "수업, 반", pos: "noun", level: "A1" },
  "student": { meaning: "학생", pos: "noun", level: "A1" },
  "teacher": { meaning: "선생님", pos: "noun", level: "A1" },
  "story": { meaning: "이야기", pos: "noun", level: "A1" },
  "stories": { meaning: "이야기들", pos: "noun", level: "A1" },
  "book": { meaning: "책", pos: "noun", level: "A1" },
  "books": { meaning: "책들", pos: "noun", level: "A1" },
  "word": { meaning: "단어", pos: "noun", level: "A1" },
  "words": { meaning: "단어들", pos: "noun", level: "A1" },
  "idea": { meaning: "생각, 아이디어", pos: "noun", level: "A1" },
  "ideas": { meaning: "아이디어들", pos: "noun", level: "A1" },
  "world": { meaning: "세상, 세계", pos: "noun", level: "A1" },
  "food": { meaning: "음식", pos: "noun", level: "A1" },
  "water": { meaning: "물", pos: "noun", level: "A1" },
  "coffee": { meaning: "커피", pos: "noun", level: "A1" },
  "tea": { meaning: "차", pos: "noun", level: "A1" },
  "money": { meaning: "돈", pos: "noun", level: "A1" },
  "phone": { meaning: "전화", pos: "noun", level: "A1" },
  "car": { meaning: "자동차", pos: "noun", level: "A1" },
  "city": { meaning: "도시", pos: "noun", level: "A1" },
  "country": { meaning: "나라", pos: "noun", level: "A1" },
  "street": { meaning: "거리", pos: "noun", level: "A1" },
  "road": { meaning: "길, 도로", pos: "noun", level: "A1" },
  "name": { meaning: "이름", pos: "noun", level: "A1" },
  "number": { meaning: "숫자, 번호", pos: "noun", level: "A1" },
  "music": { meaning: "음악", pos: "noun", level: "A1" },
  "song": { meaning: "노래", pos: "noun", level: "A1" },
  "movie": { meaning: "영화", pos: "noun", level: "A1" },
  "game": { meaning: "게임, 경기", pos: "noun", level: "A1" },
  "party": { meaning: "파티", pos: "noun", level: "A1" },
  "picture": { meaning: "그림, 사진", pos: "noun", level: "A1" },
  "photo": { meaning: "사진", pos: "noun", level: "A1" },
  "hand": { meaning: "손", pos: "noun", level: "A1" },
  "eye": { meaning: "눈", pos: "noun", level: "A1" },
  "eyes": { meaning: "눈", pos: "noun", level: "A1" },
  "face": { meaning: "얼굴", pos: "noun", level: "A1" },
  "head": { meaning: "머리", pos: "noun", level: "A1" },
  "heart": { meaning: "마음, 심장", pos: "noun", level: "A1" },
  "mind": { meaning: "마음, 정신", pos: "noun", level: "A2" },
  "body": { meaning: "몸, 신체", pos: "noun", level: "A2" },
  "voice": { meaning: "목소리", pos: "noun", level: "A2" },
  "smile": { meaning: "미소", pos: "noun", level: "A2" },
  "dream": { meaning: "꿈", pos: "noun", level: "A2" },
  "dreams": { meaning: "꿈들", pos: "noun", level: "A2" },
  "plan": { meaning: "계획", pos: "noun", level: "A2" },
  "plans": { meaning: "계획들", pos: "noun", level: "A2" },
  "goal": { meaning: "목표", pos: "noun", level: "A2" },
  "goals": { meaning: "목표들", pos: "noun", level: "A2" },
  "habit": { meaning: "습관", pos: "noun", level: "A2" },
  "habits": { meaning: "습관들", pos: "noun", level: "A2" },
  "journal": { meaning: "일기, 저널", pos: "noun", level: "B1" },
  "line": { meaning: "줄, 선", pos: "noun", level: "A1" },
  "lines": { meaning: "줄들", pos: "noun", level: "A1" },
  "week": { meaning: "주", pos: "noun", level: "A1" },
  "coffee": { meaning: "커피", pos: "noun", level: "A1" },
  "meeting": { meaning: "회의, 만남", pos: "noun", level: "A2" },
  "project": { meaning: "프로젝트", pos: "noun", level: "A2" },
  "projects": { meaning: "프로젝트들", pos: "noun", level: "A2" },
  "team": { meaning: "팀", pos: "noun", level: "A2" },
  "boss": { meaning: "상사", pos: "noun", level: "A2" },
  "company": { meaning: "회사", pos: "noun", level: "A2" },
  "business": { meaning: "사업, 업무", pos: "noun", level: "B1" },
  "customer": { meaning: "고객", pos: "noun", level: "B1" },
  "service": { meaning: "서비스", pos: "noun", level: "B1" },
  "problem": { meaning: "문제", pos: "noun", level: "A2" },
  "problems": { meaning: "문제들", pos: "noun", level: "A2" },
  "question": { meaning: "질문", pos: "noun", level: "A2" },
  "questions": { meaning: "질문들", pos: "noun", level: "A2" },
  "answer": { meaning: "답, 대답", pos: "noun", level: "A2" },
  "reason": { meaning: "이유", pos: "noun", level: "A2" },
  "chance": { meaning: "기회, 가능성", pos: "noun", level: "A2" },
  "moment": { meaning: "순간", pos: "noun", level: "A2" },
  "future": { meaning: "미래", pos: "noun", level: "A2" },
  "past": { meaning: "과거", pos: "noun", level: "A2" },
  "week": { meaning: "주", pos: "noun", level: "A1" },
  "weather": { meaning: "날씨", pos: "noun", level: "A2" },
  "rain": { meaning: "비", pos: "noun", level: "A1" },
  "snow": { meaning: "눈", pos: "noun", level: "A1" },
  "sun": { meaning: "해, 태양", pos: "noun", level: "A1" },
  "wind": { meaning: "바람", pos: "noun", level: "A2" },
  "sky": { meaning: "하늘", pos: "noun", level: "A2" },
  "sea": { meaning: "바다", pos: "noun", level: "A2" },
  "beach": { meaning: "해변", pos: "noun", level: "A2" },
  "mountain": { meaning: "산", pos: "noun", level: "A2" },
  "tree": { meaning: "나무", pos: "noun", level: "A1" },
  "flower": { meaning: "꽃", pos: "noun", level: "A1" },
  "dog": { meaning: "개", pos: "noun", level: "A1" },
  "cat": { meaning: "고양이", pos: "noun", level: "A1" },
  "bird": { meaning: "새", pos: "noun", level: "A1" },

  // ── everyday verbs ──
  "write": { meaning: "쓰다", pos: "verb", level: "A1" },
  "start": { meaning: "시작하다", pos: "verb", level: "A1" },
  "keep": { meaning: "계속하다, 유지하다", pos: "verb", level: "A1" },
  "walk": { meaning: "걷다", pos: "verb", level: "A1" },
  "run": { meaning: "달리다", pos: "verb", level: "A1" },
  "read": { meaning: "읽다", pos: "verb", level: "A1" },
  "remember": { meaning: "기억하다", pos: "verb", level: "A1" },
  "forget": { meaning: "잊다", pos: "verb", level: "A1" },
  "feel": { meaning: "느끼다", pos: "verb", level: "A1" },
  "think": { meaning: "생각하다", pos: "verb", level: "A1" },
  "happen": { meaning: "일어나다, 발생하다", pos: "verb", level: "A1" },
  "want": { meaning: "원하다", pos: "verb", level: "A1" },
  "need": { meaning: "필요하다", pos: "verb", level: "A1" },
  "try": { meaning: "시도하다, 노력하다", pos: "verb", level: "A1" },
  "help": { meaning: "돕다", pos: "verb", level: "A1" },
  "call": { meaning: "부르다, 전화하다", pos: "verb", level: "A1" },
  "ask": { meaning: "묻다, 부탁하다", pos: "verb", level: "A1" },
  "tell": { meaning: "말하다, 알려주다", pos: "verb", level: "A1" },
  "talk": { meaning: "이야기하다", pos: "verb", level: "A1" },
  "speak": { meaning: "말하다", pos: "verb", level: "A1" },
  "listen": { meaning: "듣다", pos: "verb", level: "A1" },
  "hear": { meaning: "듣다", pos: "verb", level: "A1" },
  "watch": { meaning: "보다, 지켜보다", pos: "verb", level: "A1" },
  "play": { meaning: "놀다, 연주하다", pos: "verb", level: "A1" },
  "eat": { meaning: "먹다", pos: "verb", level: "A1" },
  "drink": { meaning: "마시다", pos: "verb", level: "A1" },
  "sleep": { meaning: "자다", pos: "verb", level: "A1" },
  "wake": { meaning: "깨다, 일어나다", pos: "verb", level: "A2" },
  "buy": { meaning: "사다", pos: "verb", level: "A1" },
  "sell": { meaning: "팔다", pos: "verb", level: "A1" },
  "pay": { meaning: "지불하다", pos: "verb", level: "A2" },
  "spend": { meaning: "쓰다, 소비하다", pos: "verb", level: "A2" },
  "find": { meaning: "찾다", pos: "verb", level: "A1" },
  "lose": { meaning: "잃다, 지다", pos: "verb", level: "A2" },
  "win": { meaning: "이기다", pos: "verb", level: "A2" },
  "meet": { meaning: "만나다", pos: "verb", level: "A1" },
  "leave": { meaning: "떠나다, 남기다", pos: "verb", level: "A2" },
  "stay": { meaning: "머무르다", pos: "verb", level: "A1" },
  "move": { meaning: "움직이다, 이사하다", pos: "verb", level: "A2" },
  "open": { meaning: "열다", pos: "verb", level: "A1" },
  "close": { meaning: "닫다", pos: "verb", level: "A1" },
  "turn": { meaning: "돌다, 바꾸다", pos: "verb", level: "A1" },
  "bring": { meaning: "가져오다", pos: "verb", level: "A2" },
  "carry": { meaning: "나르다, 옮기다", pos: "verb", level: "A2" },
  "hold": { meaning: "잡다, 유지하다", pos: "verb", level: "A2" },
  "show": { meaning: "보여주다", pos: "verb", level: "A1" },
  "learn": { meaning: "배우다", pos: "verb", level: "A1" },
  "teach": { meaning: "가르치다", pos: "verb", level: "A2" },
  "study": { meaning: "공부하다", pos: "verb", level: "A1" },
  "practice": { meaning: "연습하다", pos: "verb", level: "A2" },
  "change": { meaning: "바꾸다, 변하다", pos: "verb", level: "A2" },
  "grow": { meaning: "자라다, 성장하다", pos: "verb", level: "A2" },
  "build": { meaning: "짓다, 세우다", pos: "verb", level: "A2" },
  "create": { meaning: "만들다, 창조하다", pos: "verb", level: "B1" },
  "become": { meaning: "되다", pos: "verb", level: "A2" },
  "believe": { meaning: "믿다", pos: "verb", level: "A2" },
  "hope": { meaning: "바라다, 희망하다", pos: "verb", level: "A2" },
  "wish": { meaning: "바라다, 소망하다", pos: "verb", level: "A2" },
  "love": { meaning: "사랑하다", pos: "verb", level: "A1" },
  "enjoy": { meaning: "즐기다", pos: "verb", level: "A2" },
  "smile": { meaning: "미소 짓다", pos: "verb", level: "A2" },
  "laugh": { meaning: "웃다", pos: "verb", level: "A2" },
  "cry": { meaning: "울다", pos: "verb", level: "A2" },
  "worry": { meaning: "걱정하다", pos: "verb", level: "A2" },
  "care": { meaning: "신경 쓰다, 돌보다", pos: "verb", level: "A2" },
  "decide": { meaning: "결정하다", pos: "verb", level: "B1" },
  "choose": { meaning: "선택하다", pos: "verb", level: "A2" },
  "agree": { meaning: "동의하다", pos: "verb", level: "A2" },
  "explain": { meaning: "설명하다", pos: "verb", level: "B1" },
  "understand": { meaning: "이해하다", pos: "verb", level: "A2" },
  "wait": { meaning: "기다리다", pos: "verb", level: "A1" },
  "stop": { meaning: "멈추다", pos: "verb", level: "A1" },
  "finish": { meaning: "끝내다", pos: "verb", level: "A2" },
  "continue": { meaning: "계속하다", pos: "verb", level: "B1" },
  "follow": { meaning: "따라가다, 따르다", pos: "verb", level: "A2" },
  "join": { meaning: "합류하다, 가입하다", pos: "verb", level: "A2" },
  "share": { meaning: "공유하다, 나누다", pos: "verb", level: "A2" },
  "send": { meaning: "보내다", pos: "verb", level: "A2" },
  "receive": { meaning: "받다", pos: "verb", level: "B1" },
  "return": { meaning: "돌아오다, 반환하다", pos: "verb", level: "A2" },
  "arrive": { meaning: "도착하다", pos: "verb", level: "A2" },
  "travel": { meaning: "여행하다", pos: "verb", level: "A2" },
  "visit": { meaning: "방문하다", pos: "verb", level: "A2" },
  "cook": { meaning: "요리하다", pos: "verb", level: "A1" },
  "clean": { meaning: "청소하다", pos: "verb", level: "A1" },
  "wash": { meaning: "씻다", pos: "verb", level: "A1" },
  "wear": { meaning: "입다", pos: "verb", level: "A2" },
  "drive": { meaning: "운전하다", pos: "verb", level: "A2" },
  "fly": { meaning: "날다", pos: "verb", level: "A2" },
  "sit": { meaning: "앉다", pos: "verb", level: "A1" },
  "stand": { meaning: "서다", pos: "verb", level: "A1" },
  "fall": { meaning: "떨어지다, 넘어지다", pos: "verb", level: "A2" },
  "rise": { meaning: "오르다", pos: "verb", level: "B1" },
  "break": { meaning: "깨다, 부수다", pos: "verb", level: "A2" },
  "fix": { meaning: "고치다", pos: "verb", level: "A2" },
  "add": { meaning: "더하다, 추가하다", pos: "verb", level: "A2" },
  "check": { meaning: "확인하다", pos: "verb", level: "A2" },
  "count": { meaning: "세다", pos: "verb", level: "A2" },
  "draw": { meaning: "그리다", pos: "verb", level: "A2" },
  "paint": { meaning: "색칠하다, 그리다", pos: "verb", level: "A2" },
  "sing": { meaning: "노래하다", pos: "verb", level: "A1" },
  "dance": { meaning: "춤추다", pos: "verb", level: "A1" },
  "jump": { meaning: "뛰다, 점프하다", pos: "verb", level: "A1" },
  "climb": { meaning: "오르다", pos: "verb", level: "A2" },
  "swim": { meaning: "수영하다", pos: "verb", level: "A1" },
  "throw": { meaning: "던지다", pos: "verb", level: "A2" },
  "catch": { meaning: "잡다", pos: "verb", level: "A2" },
  "push": { meaning: "밀다", pos: "verb", level: "A2" },
  "pull": { meaning: "당기다", pos: "verb", level: "A2" },
  "cut": { meaning: "자르다", pos: "verb", level: "A1" },
  "kill": { meaning: "죽이다", pos: "verb", level: "B1" },
  "save": { meaning: "구하다, 저장하다, 절약하다", pos: "verb", level: "A2" },
  "wonder": { meaning: "궁금해하다", pos: "verb", level: "B1" },
  "imagine": { meaning: "상상하다", pos: "verb", level: "B1" },
  "realize": { meaning: "깨닫다", pos: "verb", level: "B1" },
  "notice": { meaning: "알아차리다", pos: "verb", level: "B1" },
  "expect": { meaning: "기대하다, 예상하다", pos: "verb", level: "B1" },
  "prepare": { meaning: "준비하다", pos: "verb", level: "B1" },
  "manage": { meaning: "관리하다, 해내다", pos: "verb", level: "B1" },
  "improve": { meaning: "개선하다, 향상시키다", pos: "verb", level: "B1" },
  "increase": { meaning: "증가하다", pos: "verb", level: "B1" },
  "reduce": { meaning: "줄이다", pos: "verb", level: "B1" },
  "avoid": { meaning: "피하다", pos: "verb", level: "B1" },
  "allow": { meaning: "허락하다", pos: "verb", level: "B1" },
  "offer": { meaning: "제안하다, 제공하다", pos: "verb", level: "B1" },
  "provide": { meaning: "제공하다", pos: "verb", level: "B1" },
  "suggest": { meaning: "제안하다", pos: "verb", level: "B1" },
  "accept": { meaning: "받아들이다", pos: "verb", level: "B1" },
  "refuse": { meaning: "거절하다", pos: "verb", level: "B1" },
  "consider": { meaning: "고려하다", pos: "verb", level: "B1" },
  "compare": { meaning: "비교하다", pos: "verb", level: "B1" },
  "describe": { meaning: "묘사하다", pos: "verb", level: "B1" },
  "mention": { meaning: "언급하다", pos: "verb", level: "B1" },
  "discuss": { meaning: "논의하다", pos: "verb", level: "B1" },
  "achieve": { meaning: "성취하다, 이루다", pos: "verb", level: "B2" },
  "focus": { meaning: "집중하다", pos: "verb", level: "B1" },
  "relax": { meaning: "쉬다, 긴장을 풀다", pos: "verb", level: "A2" },
  "rest": { meaning: "쉬다", pos: "verb", level: "A2" },
  "breathe": { meaning: "숨쉬다", pos: "verb", level: "B1" },
  "appreciate": { meaning: "감사하다, 인정하다", pos: "verb", level: "B2" },
  "encourage": { meaning: "격려하다", pos: "verb", level: "B2" },
  "recommend": { meaning: "추천하다", pos: "verb", level: "B1" },
  "recognize": { meaning: "알아보다, 인정하다", pos: "verb", level: "B2" },
  "involve": { meaning: "포함하다, 관련시키다", pos: "verb", level: "B2" },
  "affect": { meaning: "영향을 미치다", pos: "verb", level: "B2" },
  "focus": { meaning: "집중하다", pos: "verb", level: "B1" },

  // ── adjectives ──
  "happy": { meaning: "행복한", pos: "adj", level: "A1" },
  "sad": { meaning: "슬픈", pos: "adj", level: "A1" },
  "busy": { meaning: "바쁜", pos: "adj", level: "A1" },
  "free": { meaning: "자유로운, 무료의", pos: "adj", level: "A1" },
  "different": { meaning: "다른", pos: "adj", level: "A2" },
  "similar": { meaning: "비슷한", pos: "adj", level: "B1" },
  "small": { meaning: "작은", pos: "adj", level: "A1" },
  "little": { meaning: "작은, 조금의", pos: "adj", level: "A1" },
  "large": { meaning: "큰", pos: "adj", level: "A2" },
  "huge": { meaning: "거대한", pos: "adj", level: "B1" },
  "tiny": { meaning: "아주 작은", pos: "adj", level: "B1" },
  "perfect": { meaning: "완벽한", pos: "adj", level: "A2" },
  "real": { meaning: "진짜의, 실제의", pos: "adj", level: "A2" },
  "true": { meaning: "사실인, 진실한", pos: "adj", level: "A2" },
  "false": { meaning: "거짓의", pos: "adj", level: "B1" },
  "important": { meaning: "중요한", pos: "adj", level: "A2" },
  "easy": { meaning: "쉬운", pos: "adj", level: "A1" },
  "hard": { meaning: "어려운, 단단한", pos: "adj", level: "A1" },
  "difficult": { meaning: "어려운", pos: "adj", level: "A2" },
  "simple": { meaning: "간단한", pos: "adj", level: "A2" },
  "nice": { meaning: "좋은, 멋진", pos: "adj", level: "A1" },
  "kind": { meaning: "친절한; 종류", pos: "adj", level: "A2" },
  "great": { meaning: "훌륭한, 큰", pos: "adj", level: "A1" },
  "wonderful": { meaning: "멋진, 훌륭한", pos: "adj", level: "A2" },
  "amazing": { meaning: "놀라운", pos: "adj", level: "A2" },
  "beautiful": { meaning: "아름다운", pos: "adj", level: "A1" },
  "pretty": { meaning: "예쁜; 꽤", pos: "adj", level: "A2" },
  "ugly": { meaning: "못생긴", pos: "adj", level: "B1" },
  "young": { meaning: "젊은, 어린", pos: "adj", level: "A1" },
  "high": { meaning: "높은", pos: "adj", level: "A1" },
  "low": { meaning: "낮은", pos: "adj", level: "A2" },
  "fast": { meaning: "빠른", pos: "adj", level: "A1" },
  "slow": { meaning: "느린", pos: "adj", level: "A1" },
  "quick": { meaning: "빠른", pos: "adj", level: "A2" },
  "early": { meaning: "이른, 일찍", pos: "adj", level: "A2" },
  "late": { meaning: "늦은", pos: "adj", level: "A2" },
  "warm": { meaning: "따뜻한", pos: "adj", level: "A1" },
  "cold": { meaning: "추운, 차가운", pos: "adj", level: "A1" },
  "hot": { meaning: "뜨거운, 더운", pos: "adj", level: "A1" },
  "cool": { meaning: "시원한, 멋진", pos: "adj", level: "A2" },
  "dark": { meaning: "어두운", pos: "adj", level: "A2" },
  "bright": { meaning: "밝은", pos: "adj", level: "A2" },
  "clean": { meaning: "깨끗한", pos: "adj", level: "A1" },
  "dirty": { meaning: "더러운", pos: "adj", level: "A2" },
  "full": { meaning: "가득한", pos: "adj", level: "A2" },
  "empty": { meaning: "빈", pos: "adj", level: "A2" },
  "strong": { meaning: "강한", pos: "adj", level: "A2" },
  "weak": { meaning: "약한", pos: "adj", level: "A2" },
  "healthy": { meaning: "건강한", pos: "adj", level: "A2" },
  "sick": { meaning: "아픈", pos: "adj", level: "A2" },
  "tired": { meaning: "피곤한", pos: "adj", level: "A2" },
  "hungry": { meaning: "배고픈", pos: "adj", level: "A1" },
  "afraid": { meaning: "두려운", pos: "adj", level: "A2" },
  "angry": { meaning: "화난", pos: "adj", level: "A2" },
  "excited": { meaning: "신난, 흥분한", pos: "adj", level: "A2" },
  "nervous": { meaning: "긴장한", pos: "adj", level: "B1" },
  "proud": { meaning: "자랑스러운", pos: "adj", level: "B1" },
  "sure": { meaning: "확실한", pos: "adj", level: "A2" },
  "ready": { meaning: "준비된", pos: "adj", level: "A2" },
  "possible": { meaning: "가능한", pos: "adj", level: "B1" },
  "impossible": { meaning: "불가능한", pos: "adj", level: "B1" },
  "special": { meaning: "특별한", pos: "adj", level: "A2" },
  "favorite": { meaning: "가장 좋아하는", pos: "adj", level: "A2" },
  "famous": { meaning: "유명한", pos: "adj", level: "A2" },
  "popular": { meaning: "인기 있는", pos: "adj", level: "A2" },
  "expensive": { meaning: "비싼", pos: "adj", level: "A2" },
  "cheap": { meaning: "싼", pos: "adj", level: "A2" },
  "quiet": { meaning: "조용한", pos: "adj", level: "A2" },
  "loud": { meaning: "시끄러운", pos: "adj", level: "A2" },
  "safe": { meaning: "안전한", pos: "adj", level: "A2" },
  "dangerous": { meaning: "위험한", pos: "adj", level: "B1" },
  "clear": { meaning: "명확한, 맑은", pos: "adj", level: "A2" },
  "certain": { meaning: "확실한, 어떤", pos: "adj", level: "B1" },
  "common": { meaning: "흔한, 공통의", pos: "adj", level: "B1" },
  "usual": { meaning: "평소의", pos: "adj", level: "B1" },
  "normal": { meaning: "정상적인, 보통의", pos: "adj", level: "A2" },
  "strange": { meaning: "이상한", pos: "adj", level: "B1" },
  "wrong": { meaning: "틀린, 잘못된", pos: "adj", level: "A2" },
  "right": { meaning: "옳은, 오른쪽의", pos: "adj", level: "A1" },
  "positive": { meaning: "긍정적인", pos: "adj", level: "B1" },
  "negative": { meaning: "부정적인", pos: "adj", level: "B1" },
  "comfortable": { meaning: "편안한", pos: "adj", level: "B1" },
  "confident": { meaning: "자신 있는", pos: "adj", level: "B2" },
  "grateful": { meaning: "감사하는", pos: "adj", level: "B2" },
  "gentle": { meaning: "부드러운, 온화한", pos: "adj", level: "B2" },
  "honest": { meaning: "정직한", pos: "adj", level: "B1" },
  "brave": { meaning: "용감한", pos: "adj", level: "B1" },
  "calm": { meaning: "차분한", pos: "adj", level: "B1" },
  "fresh": { meaning: "신선한", pos: "adj", level: "A2" },
  "heavy": { meaning: "무거운", pos: "adj", level: "A2" },
  "light": { meaning: "가벼운, 밝은; 빛", pos: "adj", level: "A2" },
  "deep": { meaning: "깊은", pos: "adj", level: "A2" },
  "wide": { meaning: "넓은", pos: "adj", level: "A2" },
  "narrow": { meaning: "좁은", pos: "adj", level: "B1" },
  "close": { meaning: "가까운", pos: "adj", level: "A2" },
  "far": { meaning: "먼", pos: "adj", level: "A1" },

  // ── adverbs ──
  "really": { meaning: "정말로", pos: "adv", level: "A1" },
  "always": { meaning: "항상", pos: "adv", level: "A1" },
  "usually": { meaning: "보통", pos: "adv", level: "A2" },
  "sometimes": { meaning: "가끔", pos: "adv", level: "A1" },
  "rarely": { meaning: "드물게", pos: "adv", level: "B1" },
  "already": { meaning: "이미", pos: "adv", level: "A2" },
  "almost": { meaning: "거의", pos: "adv", level: "A2" },
  "together": { meaning: "함께", pos: "adv", level: "A1" },
  "again": { meaning: "다시", pos: "adv", level: "A1" },
  "away": { meaning: "떨어져, 멀리", pos: "adv", level: "A1" },
  "maybe": { meaning: "아마도", pos: "adv", level: "A1" },
  "probably": { meaning: "아마", pos: "adv", level: "A2" },
  "certainly": { meaning: "확실히", pos: "adv", level: "B1" },
  "finally": { meaning: "마침내", pos: "adv", level: "A2" },
  "quickly": { meaning: "빠르게", pos: "adv", level: "A2" },
  "slowly": { meaning: "천천히", pos: "adv", level: "A2" },
  "carefully": { meaning: "조심스럽게", pos: "adv", level: "B1" },
  "easily": { meaning: "쉽게", pos: "adv", level: "A2" },
  "suddenly": { meaning: "갑자기", pos: "adv", level: "B1" },
  "clearly": { meaning: "분명히", pos: "adv", level: "B1" },
  "exactly": { meaning: "정확히", pos: "adv", level: "B1" },
  "especially": { meaning: "특히", pos: "adv", level: "B1" },
  "instead": { meaning: "대신에", pos: "adv", level: "B1" },
  "however": { meaning: "그러나", pos: "adv", level: "B1" },
  "though": { meaning: "그렇지만", pos: "adv", level: "B1" },
  "anyway": { meaning: "어쨌든", pos: "adv", level: "B1" },
  "perhaps": { meaning: "아마도", pos: "adv", level: "B1" },
  "actually": { meaning: "사실은", pos: "adv", level: "A2" },
  "together": { meaning: "함께", pos: "adv", level: "A1" },
  "forward": { meaning: "앞으로", pos: "adv", level: "A2" },
  "outside": { meaning: "밖에", pos: "adv", level: "A2" },
  "inside": { meaning: "안에", pos: "adv", level: "A2" },
  "everywhere": { meaning: "어디에나", pos: "adv", level: "B1" },
  "somewhere": { meaning: "어딘가에", pos: "adv", level: "A2" },
  "anywhere": { meaning: "어디든", pos: "adv", level: "A2" },
  "everyone": { meaning: "모두", pos: "pron", level: "A2" },
  "someone": { meaning: "누군가", pos: "pron", level: "A2" },
  "anyone": { meaning: "누구든", pos: "pron", level: "A2" },
  "something": { meaning: "무언가", pos: "pron", level: "A2" },
  "anything": { meaning: "무엇이든", pos: "pron", level: "A2" },
  "everything": { meaning: "모든 것", pos: "pron", level: "A2" },
  "nothing": { meaning: "아무것도", pos: "pron", level: "A2" },
  "nobody": { meaning: "아무도", pos: "pron", level: "A2" },
}

// ── programmatic expansion: add a broad common-word base to reach 2000+ ──
// (These supplement the curated entries above; curated wins on conflict.)
const EXTRA = {
  "able":"할 수 있는","about":"~에 관하여","above":"위에","abroad":"해외에서","absolute":"절대적인","absolutely":"절대적으로","accent":"억양","access":"접근","accident":"사고","account":"계좌, 설명","accurate":"정확한","achievement":"성취","across":"가로질러","act":"행동하다","action":"행동","active":"활동적인","activity":"활동","actor":"배우","adapt":"적응하다","address":"주소","admire":"존경하다","admit":"인정하다","adorable":"사랑스러운","adult":"어른","advance":"전진하다","advantage":"이점","adventure":"모험","advice":"조언","afford":"여유가 되다","age":"나이","agent":"대리인","ago":"~전에","agree":"동의하다","ahead":"앞으로","aim":"목표","air":"공기","airport":"공항","alive":"살아있는","allow":"허락하다","alone":"혼자","along":"~을 따라","aloud":"소리내어","already":"이미","alright":"괜찮은","although":"비록 ~이지만","amount":"양","ancient":"고대의","angle":"각도","animal":"동물","announce":"발표하다","annoy":"짜증나게 하다","another":"또 다른","answer":"대답","apart":"떨어져","apartment":"아파트","apologize":"사과하다","apology":"사과","appear":"나타나다","apple":"사과","apply":"신청하다, 적용하다","approach":"접근하다","area":"지역","argue":"논쟁하다","argument":"논쟁","arm":"팔","army":"군대","around":"주위에","arrange":"준비하다","arrive":"도착하다","art":"예술","artist":"예술가","aside":"옆으로","asleep":"잠든","aspect":"측면","assume":"가정하다","attack":"공격하다","attend":"참석하다","attention":"주의","attitude":"태도","attract":"끌어당기다","author":"작가","available":"이용 가능한","average":"평균","awake":"깨어있는","award":"상","aware":"알고 있는","baby":"아기","back":"뒤, 등","background":"배경","bag":"가방","bake":"굽다","balance":"균형","ball":"공","band":"밴드, 띠","bank":"은행","bar":"막대, 술집","base":"기반","basic":"기본적인","basket":"바구니","bath":"목욕","bathroom":"화장실","battle":"전투","beautiful":"아름다운","bed":"침대","bedroom":"침실","beer":"맥주","begin":"시작하다","beginning":"시작","behave":"행동하다","behavior":"행동","behind":"뒤에","belief":"믿음","bell":"종","belong":"속하다","below":"아래에","belt":"벨트","bench":"벤치","bend":"구부리다","benefit":"이익","beside":"옆에","best":"최고의","bet":"내기하다","better":"더 나은","beyond":"너머","bicycle":"자전거","bike":"자전거","bill":"청구서","birthday":"생일","bit":"조금","bite":"물다","bitter":"쓴","black":"검은","blame":"탓하다","blank":"빈","blanket":"담요","blind":"눈먼","block":"막다, 블록","blood":"피","blow":"불다","blue":"파란","board":"판, 이사회","boat":"배","boil":"끓이다","bone":"뼈","bookstore":"서점","boot":"부츠","border":"국경","bore":"지루하게 하다","bored":"지루한","boring":"지루한","born":"태어난","borrow":"빌리다","bottle":"병","bottom":"바닥","bowl":"그릇","box":"상자","boy":"소년","brain":"뇌","branch":"가지","bread":"빵","breakfast":"아침 식사","breath":"숨","breeze":"산들바람","brick":"벽돌","bridge":"다리","brief":"간단한","bright":"밝은","brilliant":"훌륭한","bring":"가져오다","broad":"넓은","broken":"부서진","brother":"형제","brown":"갈색","brush":"솔, 붓","bubble":"거품","bucket":"양동이","budget":"예산","bug":"벌레","building":"건물","bunch":"다발","burn":"태우다","burst":"터지다","bury":"묻다","bus":"버스","bush":"덤불","butter":"버터","button":"단추","cabin":"오두막","cake":"케이크","calendar":"달력","camera":"카메라","camp":"캠프","campaign":"캠페인","can":"할 수 있다, 캔","cancel":"취소하다","candle":"초","candy":"사탕","cap":"모자","capital":"수도, 자본","captain":"선장","capture":"포착하다","card":"카드","careful":"조심스러운","careless":"부주의한","carpet":"카펫","carrot":"당근","case":"경우, 사건","cash":"현금","castle":"성","casual":"평상시의","cause":"원인","cave":"동굴","ceiling":"천장","celebrate":"축하하다","cell":"세포","center":"중심","central":"중심의","century":"세기","ceremony":"의식","chain":"사슬","chair":"의자","chalk":"분필","challenge":"도전","champion":"챔피언","channel":"채널","chapter":"장","character":"성격, 등장인물","charge":"청구하다, 충전하다","charity":"자선","charm":"매력","chart":"도표","chase":"쫓다","cheap":"싼","cheat":"속이다","check":"확인하다","cheek":"뺨","cheer":"응원하다","cheese":"치즈","chest":"가슴, 상자","chicken":"닭","chief":"우두머리","childhood":"어린 시절","chin":"턱","chip":"조각, 칩","chocolate":"초콜릿","choice":"선택","chop":"자르다","church":"교회","circle":"원","citizen":"시민","claim":"주장하다","clap":"박수치다","classic":"고전적인","classroom":"교실","clay":"점토","clerk":"점원","clever":"영리한","click":"클릭하다","client":"고객","cliff":"절벽","climate":"기후","clock":"시계","cloth":"천","clothes":"옷","cloud":"구름","cloudy":"흐린","club":"클럽","clue":"단서","coach":"코치","coast":"해안","coat":"코트","code":"코드","coin":"동전","cold":"추운","collect":"모으다","college":"대학","color":"색","column":"기둥, 열","combine":"결합하다","comedy":"코미디","comfort":"편안함","command":"명령","comment":"논평","commit":"저지르다, 헌신하다","committee":"위원회","communicate":"의사소통하다","community":"공동체","complain":"불평하다","complete":"완성하다","complex":"복잡한","concept":"개념","concern":"걱정","concert":"콘서트","conclude":"결론짓다","condition":"조건, 상태","confirm":"확인하다","confuse":"혼란시키다","connect":"연결하다","connection":"연결","conscious":"의식하는","consist":"구성되다","constant":"끊임없는","contact":"연락하다","contain":"포함하다","content":"내용","contest":"대회","context":"맥락","contract":"계약","contrast":"대조","control":"통제하다","convenient":"편리한","conversation":"대화","convince":"설득하다","cook":"요리하다","cookie":"쿠키","copy":"복사하다","corn":"옥수수","corner":"모퉁이","correct":"올바른","cost":"비용","cotton":"면","couch":"소파","cough":"기침하다","council":"의회","counter":"카운터","couple":"한 쌍","courage":"용기","course":"과정","court":"법원, 코트","cousin":"사촌","cover":"덮다","cow":"소","crack":"금이 가다","craft":"공예","crash":"충돌하다","crazy":"미친","cream":"크림","creative":"창의적인","creature":"생물","credit":"신용","crew":"승무원","crime":"범죄","crisis":"위기","critical":"비판적인","crop":"작물","cross":"건너다","crowd":"군중","crown":"왕관","cruel":"잔인한","crush":"으깨다","culture":"문화","cup":"컵","cure":"치료하다","curious":"호기심 많은","current":"현재의, 흐름","curtain":"커튼","curve":"곡선","custom":"관습","cute":"귀여운","cycle":"주기","daily":"매일의","damage":"손상","dance":"춤추다","danger":"위험","dark":"어두운","data":"자료","date":"날짜","daughter":"딸","dawn":"새벽","dead":"죽은","deaf":"귀먹은","deal":"거래","dear":"친애하는","death":"죽음","debate":"토론","debt":"빚","decade":"십 년","december":"12월","decision":"결정","declare":"선언하다","decorate":"장식하다","decrease":"감소하다","deep":"깊은","defeat":"패배시키다","defend":"방어하다","define":"정의하다","degree":"정도, 학위","delay":"지연","deliver":"배달하다","demand":"요구하다","dentist":"치과의사","deny":"부인하다","depend":"의존하다","depth":"깊이","describe":"묘사하다","desert":"사막","deserve":"~할 자격이 있다","design":"디자인","desire":"욕망","desk":"책상","despite":"~에도 불구하고","dessert":"디저트","destroy":"파괴하다","detail":"세부사항","detect":"발견하다","develop":"개발하다","device":"장치","diamond":"다이아몬드","diary":"일기","dictionary":"사전","die":"죽다","diet":"식단","differ":"다르다","difference":"차이","dig":"파다","digital":"디지털의","dinner":"저녁 식사","direct":"직접적인","direction":"방향","dirt":"먼지","disappear":"사라지다","disappoint":"실망시키다","disaster":"재난","discover":"발견하다","disease":"질병","dish":"접시, 요리","dismiss":"해고하다","display":"전시하다","distance":"거리","distant":"먼","divide":"나누다","doctor":"의사","document":"문서","dollar":"달러","domain":"영역","donate":"기부하다","double":"두 배의","doubt":"의심","downtown":"시내","dozen":"열두 개","drag":"끌다","drama":"드라마","dramatic":"극적인","drawer":"서랍","dress":"드레스, 옷을 입다","drift":"떠다니다","drop":"떨어뜨리다","drug":"약","drum":"드럼","dry":"마른","duck":"오리","dull":"둔한, 지루한","dust":"먼지","duty":"의무","eager":"열망하는","ear":"귀","earn":"벌다","earth":"지구, 땅","east":"동쪽","easy":"쉬운","economy":"경제","edge":"가장자리","edit":"편집하다","education":"교육","effect":"효과","effort":"노력","egg":"달걀","elbow":"팔꿈치","elderly":"나이든","elect":"선출하다","electric":"전기의","element":"요소","elephant":"코끼리","elsewhere":"다른 곳에","embarrass":"당황하게 하다","emerge":"나타나다","emotion":"감정","emphasize":"강조하다","employ":"고용하다","employee":"직원","empty":"빈","enable":"가능하게 하다","end":"끝","enemy":"적","energy":"에너지","engage":"참여시키다","engine":"엔진","engineer":"기술자","enormous":"거대한","enough":"충분한","enter":"들어가다","entire":"전체의","entrance":"입구","envelope":"봉투","environment":"환경","equal":"동등한","equipment":"장비","error":"오류","escape":"탈출하다","essay":"에세이","essential":"필수적인","establish":"설립하다","estate":"부동산","estimate":"추정하다","event":"사건, 행사","eventually":"결국","evidence":"증거","evil":"악한","exact":"정확한","exam":"시험","examine":"조사하다","example":"예","excellent":"훌륭한","except":"~을 제외하고","exchange":"교환하다","excite":"흥분시키다","exciting":"흥미진진한","excuse":"변명","exercise":"운동","exist":"존재하다","exit":"출구","expand":"확장하다","expensive":"비싼","experience":"경험","experiment":"실험","expert":"전문가","explore":"탐험하다","express":"표현하다","extend":"연장하다","extra":"추가의","extreme":"극단적인","fabric":"직물","factor":"요인","factory":"공장","fail":"실패하다","failure":"실패","fair":"공정한, 박람회","faith":"믿음","fame":"명성","familiar":"익숙한","fan":"팬, 선풍기","fancy":"화려한","fantastic":"환상적인","farm":"농장","farmer":"농부","fashion":"패션","fat":"뚱뚱한, 지방","fault":"잘못","favor":"호의","fear":"두려움","feature":"특징","fee":"수수료","feed":"먹이다","female":"여성의","fence":"울타리","festival":"축제","fever":"열","field":"들판, 분야","fight":"싸우다","figure":"수치, 인물","file":"파일","fill":"채우다","film":"영화","final":"마지막의","finance":"재정","fine":"좋은, 벌금","finger":"손가락","fire":"불","firm":"회사, 확고한","fish":"물고기","fit":"맞다, 건강한","flag":"깃발","flame":"불꽃","flash":"섬광","flat":"평평한, 아파트","flavor":"맛","flight":"비행","float":"떠다니다","floor":"바닥, 층","flour":"밀가루","flow":"흐르다","fluid":"액체","focus":"초점","fog":"안개","fold":"접다","folk":"민속의","fond":"좋아하는","fool":"바보","foot":"발","football":"축구","force":"힘, 강요하다","foreign":"외국의","forest":"숲","forever":"영원히","forgive":"용서하다","fork":"포크","form":"형태","formal":"공식적인","former":"이전의","fortune":"운, 재산","forward":"앞으로","found":"설립하다","fountain":"분수","frame":"틀","frequent":"빈번한","fridge":"냉장고","fright":"공포","frog":"개구리","front":"앞","frozen":"얼어붙은","fruit":"과일","fry":"튀기다","fuel":"연료","fun":"재미","function":"기능","fund":"자금","funny":"웃긴","fur":"털","furniture":"가구","further":"더 멀리","gain":"얻다","gallery":"미술관","gap":"틈","garage":"차고","garbage":"쓰레기","garden":"정원","gas":"가스","gate":"문","gather":"모으다","general":"일반적인","generation":"세대","generous":"관대한","genius":"천재","gentle":"부드러운","gesture":"몸짓","ghost":"유령","giant":"거대한","gift":"선물","girl":"소녀","glad":"기쁜","glass":"유리, 잔","glory":"영광","glove":"장갑","glue":"풀","goat":"염소","god":"신","gold":"금","golden":"금빛의","golf":"골프","goodbye":"안녕","goods":"상품","govern":"통치하다","government":"정부","grab":"움켜쥐다","grade":"등급, 성적","gradually":"점차적으로","grain":"곡물","grand":"웅장한","grandmother":"할머니","grandfather":"할아버지","grant":"부여하다","grape":"포도","grass":"풀","grave":"무덤","gray":"회색","greet":"인사하다","grey":"회색","grief":"슬픔","grill":"굽다","grin":"활짝 웃다","grip":"움켜쥐다","grocery":"식료품","ground":"땅","group":"그룹","guard":"경비","guess":"추측하다","guest":"손님","guide":"안내하다","guilty":"죄책감이 드는","guitar":"기타","gun":"총","guy":"남자","habit":"습관","hall":"복도, 홀","hammer":"망치","handle":"다루다, 손잡이","hang":"걸다","harbor":"항구","harm":"해","harmony":"조화","harvest":"수확","hat":"모자","hate":"싫어하다","health":"건강","heat":"열","heaven":"천국","heavy":"무거운","heel":"발뒤꿈치","height":"높이","hell":"지옥","hello":"안녕","helmet":"헬멧","hero":"영웅","hesitate":"망설이다","hide":"숨다","highway":"고속도로","hill":"언덕","hint":"힌트","hip":"엉덩이","hire":"고용하다","history":"역사","hit":"치다","hobby":"취미","hole":"구멍","holiday":"휴일","holy":"신성한","honey":"꿀","honor":"명예","hook":"고리","horizon":"수평선","horn":"뿔, 경적","horror":"공포","horse":"말","hospital":"병원","host":"주최자","hotel":"호텔","housework":"집안일","hug":"포옹하다","huge":"거대한","human":"인간","humor":"유머","hundred":"백","hunger":"배고픔","hunt":"사냥하다","hurry":"서두르다","hurt":"다치게 하다","husband":"남편","ice":"얼음","ideal":"이상적인","identify":"확인하다","identity":"정체성","ignore":"무시하다","ill":"아픈","illness":"병","image":"이미지","imagination":"상상력","impact":"영향","impress":"인상을 주다","impression":"인상","include":"포함하다","income":"소득","incredible":"믿을 수 없는","indeed":"정말로","independent":"독립적인","indicate":"나타내다","individual":"개인","industry":"산업","infant":"유아","infection":"감염","influence":"영향","inform":"알리다","information":"정보","injury":"부상","ink":"잉크","inner":"내부의","innocent":"무죄의","insect":"곤충","insist":"주장하다","inspire":"영감을 주다","install":"설치하다","instance":"예","instant":"즉각적인","instead":"대신에","instinct":"본능","institution":"기관","instruction":"지시","instrument":"악기, 기구","insurance":"보험","intend":"의도하다","intense":"강렬한","interest":"관심","internal":"내부의","international":"국제적인","internet":"인터넷","interpret":"해석하다","interrupt":"방해하다","interview":"인터뷰","introduce":"소개하다","invent":"발명하다","invest":"투자하다","investigate":"조사하다","invite":"초대하다","iron":"철, 다리미","island":"섬","issue":"문제, 발행하다","item":"항목","jacket":"재킷","jail":"감옥","jam":"잼, 막힘","jar":"항아리","jaw":"턱","jazz":"재즈","jealous":"질투하는","jeans":"청바지","jewel":"보석","join":"합류하다","joke":"농담","journey":"여행","joy":"기쁨","judge":"판사, 판단하다","juice":"주스","jungle":"정글","junior":"후배의","justice":"정의","keen":"열심인","key":"열쇠","keyboard":"키보드","kick":"차다","king":"왕","kingdom":"왕국","kiss":"키스하다","knee":"무릎","kneel":"무릎 꿇다","knife":"칼","knight":"기사","knock":"두드리다","knot":"매듭","knowledge":"지식","lab":"실험실","label":"라벨","labor":"노동","lack":"부족","ladder":"사다리","lady":"숙녀","lake":"호수","lamp":"램프","land":"땅, 착륙하다","landscape":"풍경","lane":"차선, 길","language":"언어","lap":"무릎","laptop":"노트북","later":"나중에","laughter":"웃음","launch":"시작하다, 발사하다","law":"법","lawn":"잔디","lawyer":"변호사","layer":"층","lazy":"게으른","lead":"이끌다","leader":"지도자","leaf":"잎","league":"리그","lean":"기대다, 마른","leap":"뛰다","least":"가장 적은","leather":"가죽","lecture":"강의","leg":"다리","legal":"법적인","legend":"전설","lemon":"레몬","length":"길이","lesson":"수업","letter":"편지, 글자","level":"수준","library":"도서관","license":"면허","lid":"뚜껑","lie":"거짓말하다, 눕다","lift":"들어올리다","likely":"~할 것 같은","limit":"한계","link":"연결","lion":"사자","lip":"입술","liquid":"액체","list":"목록","listener":"청취자","literature":"문학","litter":"쓰레기","load":"싣다, 짐","loan":"대출","local":"지역의","location":"위치","lock":"잠그다","log":"통나무, 기록","lonely":"외로운","loose":"느슨한","lord":"군주","lorry":"트럭","loss":"손실","lot":"많음","loud":"시끄러운","lovely":"사랑스러운","lover":"연인","luck":"운","lucky":"운 좋은","luggage":"짐","lunch":"점심","lung":"폐","luxury":"사치","machine":"기계","mad":"미친, 화난","magazine":"잡지","magic":"마법","mail":"우편","main":"주요한","maintain":"유지하다","major":"주요한","male":"남성의","mall":"쇼핑몰","manager":"관리자","mankind":"인류","manner":"방식","manufacture":"제조하다","map":"지도","marble":"대리석","march":"행진하다, 3월","margin":"여백","mark":"표시","market":"시장","marriage":"결혼","marry":"결혼하다","marvel":"경이","mask":"마스크","mass":"질량, 대중","master":"주인, 숙달하다","match":"경기, 성냥, 어울리다","mate":"친구, 짝","material":"재료","math":"수학","matter":"문제, 중요하다","mature":"성숙한","meal":"식사","mean":"의미하다, 못된","meaning":"의미","means":"수단","measure":"측정하다","meat":"고기","mechanic":"정비공","medal":"메달","media":"매체","medical":"의학의","medicine":"약","medium":"중간의","melody":"멜로디","melt":"녹다","member":"회원","memory":"기억","mental":"정신적인","mention":"언급하다","menu":"메뉴","mercy":"자비","mere":"단순한","mess":"엉망","message":"메시지","metal":"금속","method":"방법","middle":"중간","midnight":"자정","mild":"온화한","military":"군사의","milk":"우유","mill":"방앗간","million":"백만","mine":"광산, 나의 것","mirror":"거울","miss":"놓치다, 그리워하다","mission":"임무","mistake":"실수","mix":"섞다","mixture":"혼합물","mobile":"이동하는, 휴대폰","model":"모델","modern":"현대의","modest":"겸손한","moment":"순간","monkey":"원숭이","monster":"괴물","mood":"기분","moon":"달","moral":"도덕적인","mostly":"대부분","mother":"어머니","motion":"움직임","motive":"동기","motor":"모터","mouse":"쥐","mouth":"입","mud":"진흙","murder":"살인","muscle":"근육","museum":"박물관","mushroom":"버섯","musician":"음악가","mysterious":"신비로운","mystery":"미스터리","nail":"못, 손톱","naked":"벌거벗은","narrow":"좁은","nation":"국가","national":"국가의","native":"토박이의","natural":"자연의","nature":"자연","navy":"해군","near":"가까운","nearby":"근처의","nearly":"거의","neat":"깔끔한","necessary":"필요한","neck":"목","needle":"바늘","neighbor":"이웃","neither":"둘 다 아닌","nephew":"조카","nerve":"신경","nest":"둥지","net":"그물","network":"네트워크","neutral":"중립의","niece":"조카딸","nobody":"아무도","nod":"끄덕이다","noise":"소음","noisy":"시끄러운","none":"아무것도","noon":"정오","normal":"정상적인","north":"북쪽","nose":"코","note":"메모","notebook":"공책","notice":"알아차리다","novel":"소설","nowadays":"요즘","nowhere":"아무데도","nuclear":"핵의","numerous":"수많은","nurse":"간호사","nut":"견과","obey":"복종하다","object":"물건, 반대하다","observe":"관찰하다","obtain":"얻다","obvious":"명백한","occasion":"경우","occupy":"차지하다","occur":"발생하다","ocean":"바다","odd":"이상한, 홀수의","offend":"기분 상하게 하다","offer":"제안하다","officer":"장교, 공무원","official":"공식적인","oil":"기름","onion":"양파","online":"온라인의","onto":"~위로","operate":"작동하다","operation":"수술, 작동","opinion":"의견","opponent":"상대","opportunity":"기회","oppose":"반대하다","opposite":"반대의","option":"선택","orange":"오렌지","order":"주문, 명령, 순서","ordinary":"평범한","organ":"기관, 오르간","organize":"조직하다","origin":"기원","original":"원래의","ought":"~해야 한다","outcome":"결과","outdoor":"야외의","outer":"바깥의","output":"산출","oven":"오븐","overcome":"극복하다","overseas":"해외의","owe":"빚지다","owner":"주인","oxygen":"산소","pace":"속도","pack":"싸다, 짐","package":"소포","page":"페이지","pain":"고통","painful":"고통스러운","paint":"칠하다","painting":"그림","pair":"쌍","palace":"궁전","pale":"창백한","palm":"손바닥","pan":"팬","panel":"패널","panic":"공황","paper":"종이","parade":"행진","paragraph":"단락","parcel":"소포","pardon":"용서","parent":"부모","park":"공원, 주차하다","parking":"주차","parliament":"의회","parrot":"앵무새","partly":"부분적으로","partner":"파트너","passage":"통로, 구절","passenger":"승객","passion":"열정","passport":"여권","path":"길","patience":"인내","patient":"환자, 참을성 있는","pattern":"패턴","pause":"멈추다","pavement":"보도","peace":"평화","peaceful":"평화로운","peach":"복숭아","peak":"정상","pear":"배","pearl":"진주","peer":"또래","pen":"펜","pencil":"연필","penny":"페니","pepper":"후추","percent":"퍼센트","perfect":"완벽한","perform":"수행하다, 공연하다","performance":"공연","period":"기간","permanent":"영구적인","permit":"허가하다","personal":"개인적인","persuade":"설득하다","pet":"애완동물","petrol":"휘발유","phase":"단계","phrase":"구절","physical":"신체적인","piano":"피아노","pick":"고르다","picnic":"소풍","piece":"조각","pig":"돼지","pigeon":"비둘기","pile":"더미","pill":"알약","pillow":"베개","pilot":"조종사","pin":"핀","pinch":"꼬집다","pine":"소나무","pink":"분홍색","pint":"파인트","pipe":"관","pirate":"해적","pitch":"음높이, 던지다","pity":"동정","pizza":"피자","plain":"평범한, 평원","plane":"비행기","planet":"행성","plant":"식물, 심다","plastic":"플라스틱","plate":"접시","platform":"승강장","pleasant":"즐거운","please":"기쁘게 하다, 제발","pleasure":"기쁨","plenty":"풍부함","plot":"줄거리, 음모","plug":"플러그","plus":"더하기","pocket":"주머니","poem":"시","poet":"시인","poetry":"시","point":"점, 가리키다","poison":"독","pole":"막대기, 극","police":"경찰","policy":"정책","polite":"예의 바른","politics":"정치","pollution":"오염","pond":"연못","pool":"수영장","poor":"가난한","pop":"팝, 터지다","population":"인구","porch":"현관","port":"항구","portion":"부분","portrait":"초상화","position":"위치","possess":"소유하다","possibility":"가능성","post":"우편, 기둥, 게시하다","poster":"포스터","pot":"냄비","potato":"감자","pound":"파운드","pour":"붓다","poverty":"가난","powder":"가루","power":"힘","powerful":"강력한","practical":"실용적인","praise":"칭찬하다","pray":"기도하다","prayer":"기도","precious":"소중한","predict":"예측하다","prefer":"선호하다","pregnant":"임신한","present":"선물, 현재의, 발표하다","preserve":"보존하다","president":"대통령","press":"누르다, 언론","pressure":"압력","pretend":"~인 척하다","prevent":"막다","previous":"이전의","price":"가격","pride":"자부심","priest":"성직자","primary":"주요한","prince":"왕자","princess":"공주","principal":"교장, 주요한","principle":"원칙","print":"인쇄하다","prior":"이전의","prison":"감옥","prisoner":"죄수","privacy":"사생활","private":"사적인","prize":"상","probable":"있음직한","procedure":"절차","process":"과정","produce":"생산하다","product":"제품","profession":"직업","professional":"전문적인","professor":"교수","profile":"프로필","profit":"이익","program":"프로그램","progress":"진행","promise":"약속하다","promote":"승진시키다, 홍보하다","prompt":"신속한, 촉구하다","proof":"증거","proper":"적절한","property":"재산, 속성","proposal":"제안","propose":"제안하다","protect":"보호하다","protest":"항의하다","proud":"자랑스러운","prove":"증명하다","provide":"제공하다","public":"공공의","publish":"출판하다","pump":"펌프","punch":"주먹으로 치다","punish":"벌하다","pupil":"학생","puppy":"강아지","pure":"순수한","purple":"보라색","purpose":"목적","purse":"지갑","pursue":"추구하다","puzzle":"퍼즐","quality":"품질","quantity":"양","quarter":"4분의 1","queen":"여왕","query":"질문","quest":"탐구","quit":"그만두다","quite":"꽤","quiz":"퀴즈","quote":"인용하다","rabbit":"토끼","race":"경주, 인종","rack":"선반","radio":"라디오","rage":"분노","rail":"철도","railway":"철도","rainbow":"무지개","raise":"올리다, 기르다","random":"무작위의","range":"범위","rank":"순위","rapid":"빠른","rare":"드문","rat":"쥐","rate":"비율","rather":"오히려","ratio":"비율","raw":"날것의","ray":"광선","reach":"도달하다","react":"반응하다","reaction":"반응","reader":"독자","reality":"현실","realm":"영역","reason":"이유","reasonable":"합리적인","rebel":"반란자","recall":"기억해내다","receipt":"영수증","recent":"최근의","recipe":"조리법","record":"기록하다","recover":"회복하다","recycle":"재활용하다","red":"빨간","reduce":"줄이다","refer":"언급하다, 참조하다","reflect":"반영하다","reform":"개혁","refuse":"거절하다","regard":"여기다","region":"지역","register":"등록하다","regret":"후회하다","regular":"규칙적인","reject":"거절하다","relate":"관련되다","relationship":"관계","relative":"친척, 상대적인","release":"풀어주다, 발표하다","relevant":"관련 있는","reliable":"믿을 만한","relief":"안도","religion":"종교","reluctant":"꺼리는","rely":"의존하다","remain":"남아있다","remark":"발언","remind":"상기시키다","remote":"먼, 원격의","remove":"제거하다","rent":"임대하다","repair":"수리하다","repeat":"반복하다","replace":"대체하다","reply":"답장하다","report":"보고하다","represent":"대표하다","reputation":"명성","request":"요청하다","require":"요구하다","rescue":"구조하다","research":"연구","resemble":"닮다","reserve":"예약하다","resident":"거주자","resist":"저항하다","resolve":"해결하다","resource":"자원","respect":"존중하다","respond":"응답하다","response":"응답","responsible":"책임 있는","restaurant":"식당","restore":"복원하다","restrict":"제한하다","result":"결과","retire":"은퇴하다","retreat":"후퇴하다","reveal":"드러내다","revenue":"수익","reverse":"거꾸로 하다","review":"검토하다","reward":"보상","rhythm":"리듬","rice":"쌀, 밥","rich":"부유한","rid":"제거하다","ridiculous":"터무니없는","ring":"반지, 울리다","riot":"폭동","rip":"찢다","risk":"위험","ritual":"의식","rival":"경쟁자","river":"강","roar":"으르렁거리다","roast":"굽다","rob":"강도질하다","robot":"로봇","rock":"바위","rocket":"로켓","role":"역할","roll":"굴리다","romance":"로맨스","romantic":"낭만적인","roof":"지붕","root":"뿌리","rope":"밧줄","rose":"장미","rough":"거친","round":"둥근","route":"경로","routine":"일상","row":"줄","royal":"왕의","rub":"문지르다","rubber":"고무","rude":"무례한","rug":"깔개","ruin":"망치다","rule":"규칙","ruler":"통치자, 자","rumor":"소문","rural":"시골의","rush":"서두르다","sacred":"신성한","sacrifice":"희생하다","sad":"슬픈","saddle":"안장","sadness":"슬픔","safety":"안전","sail":"항해하다","sailor":"선원","sake":"이익, 목적","salad":"샐러드","salary":"급여","sale":"판매","salmon":"연어","salt":"소금","sample":"견본","sand":"모래","satisfy":"만족시키다","sauce":"소스","sausage":"소시지","scale":"규모, 저울","scan":"훑어보다","scandal":"스캔들","scar":"흉터","scare":"겁주다","scary":"무서운","scatter":"흩뿌리다","scene":"장면","scenery":"경치","schedule":"일정","scheme":"계획","scholar":"학자","science":"과학","scientist":"과학자","scissors":"가위","scold":"꾸짖다","scope":"범위","score":"점수","scratch":"긁다","scream":"비명 지르다","screen":"화면","screw":"나사","script":"대본","sculpture":"조각","search":"검색하다","season":"계절","seat":"자리","secret":"비밀","secretary":"비서","section":"부분","sector":"부문","secure":"안전한","seed":"씨앗","seek":"찾다","seem":"~인 것 같다","seize":"붙잡다","seldom":"거의 ~않는","select":"선택하다","selfish":"이기적인","senior":"선배의","sense":"감각, 의미","sensible":"분별 있는","sensitive":"민감한","sentence":"문장","separate":"분리하다","sequence":"순서","series":"연속","serious":"심각한","servant":"하인","serve":"제공하다","session":"세션","settle":"정착하다, 해결하다","several":"몇몇의","severe":"심한","sew":"바느질하다","shade":"그늘","shadow":"그림자","shake":"흔들다","shallow":"얕은","shame":"수치","shape":"모양","sharp":"날카로운","shed":"헛간, 흘리다","sheep":"양","sheet":"시트","shelf":"선반","shell":"껍질","shelter":"피난처","shift":"이동, 교대","shine":"빛나다","ship":"배","shirt":"셔츠","shock":"충격","shoe":"신발","shoot":"쏘다","shop":"가게","shore":"해안","short":"짧은","shortage":"부족","shot":"발사, 슛","shoulder":"어깨","shout":"외치다","shovel":"삽","shower":"샤워","shrink":"줄어들다","shrug":"어깨를 으쓱하다","shut":"닫다","shy":"수줍은","sidewalk":"인도","sigh":"한숨쉬다","sight":"시야, 광경","sign":"표지, 서명하다","signal":"신호","signature":"서명","significant":"중요한","silence":"침묵","silent":"조용한","silk":"비단","silly":"어리석은","silver":"은","similar":"비슷한","sincere":"진심 어린","sing":"노래하다","singer":"가수","single":"하나의, 독신의","sink":"가라앉다, 싱크대","sir":"선생님","sister":"자매","site":"장소, 사이트","situation":"상황","size":"크기","skate":"스케이트 타다","skeleton":"뼈대","sketch":"스케치","ski":"스키 타다","skill":"기술","skin":"피부","skip":"건너뛰다","skirt":"치마","skull":"두개골","slave":"노예","sleeve":"소매","slice":"조각","slide":"미끄러지다","slight":"약간의","slip":"미끄러지다","slope":"경사","slot":"구멍, 자리","smart":"똑똑한","smell":"냄새","smoke":"연기, 담배 피우다","smooth":"부드러운","snake":"뱀","snap":"딱 부러지다","sneak":"살금살금 가다","soap":"비누","social":"사회의","society":"사회","sock":"양말","soft":"부드러운","software":"소프트웨어","soil":"흙","soldier":"군인","sole":"유일한","solid":"단단한, 고체의","solution":"해결책","solve":"풀다","somebody":"누군가","somehow":"어떻게든","somewhat":"다소","son":"아들","soon":"곧","sore":"아픈","sorrow":"슬픔","sorry":"미안한","sort":"종류, 분류하다","soul":"영혼","sound":"소리","soup":"수프","sour":"신","source":"원천","south":"남쪽","souvenir":"기념품","space":"공간, 우주","spare":"여분의","spark":"불꽃","sparrow":"참새","speaker":"연설자, 스피커","special":"특별한","species":"종","specific":"구체적인","speech":"연설","speed":"속도","spell":"철자를 쓰다","spend":"쓰다","sphere":"구","spice":"향신료","spider":"거미","spill":"쏟다","spin":"돌다","spirit":"정신","spit":"침 뱉다","splash":"튀기다","split":"쪼개다","spoil":"망치다","spoon":"숟가락","sport":"스포츠","spot":"장소, 반점","spread":"퍼지다","spring":"봄, 샘, 튀다","spy":"스파이","square":"정사각형, 광장","squeeze":"짜다","stable":"안정된, 마구간","stadium":"경기장","staff":"직원","stage":"무대, 단계","stair":"계단","stamp":"우표, 도장","staple":"주요한","star":"별","stare":"응시하다","state":"상태, 주, 진술하다","statement":"진술","station":"역","statue":"조각상","status":"지위","steady":"꾸준한","steak":"스테이크","steal":"훔치다","steam":"증기","steel":"강철","steep":"가파른","steer":"조종하다","stem":"줄기","step":"걸음, 단계","stick":"막대기, 붙이다","sticky":"끈적한","stiff":"뻣뻣한","stir":"젓다","stitch":"바느질하다","stock":"재고, 주식","stomach":"위, 배","stone":"돌","stool":"의자","store":"가게, 저장하다","storm":"폭풍","stove":"난로","straight":"곧은","strange":"이상한","stranger":"낯선 사람","strategy":"전략","straw":"짚, 빨대","stream":"개울, 흐름","strength":"힘","stress":"스트레스, 강조하다","stretch":"늘이다","strict":"엄격한","strike":"치다, 파업","string":"끈","strip":"벗기다, 조각","stripe":"줄무늬","stroke":"쓰다듬다, 뇌졸중","structure":"구조","struggle":"투쟁하다","stubborn":"고집 센","stuck":"갇힌","studio":"작업실","stuff":"물건","stupid":"멍청한","style":"스타일","subject":"주제, 과목","submit":"제출하다","substance":"물질","subtle":"미묘한","suburb":"교외","succeed":"성공하다","success":"성공","successful":"성공적인","sudden":"갑작스러운","suffer":"고통받다","sufficient":"충분한","sugar":"설탕","suggest":"제안하다","suit":"정장, 어울리다","suitable":"적합한","suitcase":"여행 가방","sum":"합계","summary":"요약","summer":"여름","summit":"정상","sunlight":"햇빛","sunny":"화창한","sunset":"일몰","sunshine":"햇빛","super":"대단한","superb":"최고의","supermarket":"슈퍼마켓","supper":"저녁 식사","supply":"공급하다","support":"지원하다","suppose":"추측하다","supreme":"최고의","surface":"표면","surgeon":"외과의사","surgery":"수술","surprise":"놀라게 하다","surround":"둘러싸다","survey":"조사","survive":"살아남다","suspect":"의심하다","suspend":"중단하다","swallow":"삼키다","swap":"바꾸다","swear":"맹세하다","sweat":"땀","sweater":"스웨터","sweep":"쓸다","sweet":"달콤한","swell":"부풀다","swift":"빠른","swing":"흔들리다","switch":"전환하다, 스위치","sword":"검","symbol":"상징","sympathy":"동정","symptom":"증상","system":"체계","table":"탁자, 표","tablet":"알약, 태블릿","tackle":"다루다","tail":"꼬리","tale":"이야기","talent":"재능","tank":"탱크","tap":"두드리다, 수도꼭지","tape":"테이프","target":"목표","task":"과제","taste":"맛","tax":"세금","taxi":"택시","tea":"차","teach":"가르치다","tear":"눈물, 찢다","tease":"놀리다","technical":"기술적인","technique":"기술","technology":"기술","teen":"십대","telephone":"전화","telescope":"망원경","television":"텔레비전","temperature":"온도","temple":"사원","temporary":"일시적인","tempt":"유혹하다","tend":"~하는 경향이 있다","tender":"부드러운","tennis":"테니스","tense":"긴장한","tent":"텐트","term":"용어, 기간","terrible":"끔찍한","terrific":"멋진","territory":"영토","terror":"공포","test":"시험","text":"글, 문자","theater":"극장","theme":"주제","theory":"이론","therefore":"그러므로","thick":"두꺼운","thief":"도둑","thin":"얇은, 마른","thirst":"갈증","thorough":"철저한","thought":"생각","thousand":"천","thread":"실","threat":"위협","threaten":"위협하다","throat":"목구멍","throne":"왕좌","throughout":"~내내","throw":"던지다","thumb":"엄지","thunder":"천둥","ticket":"표","tide":"조수","tidy":"깔끔한","tie":"묶다, 넥타이","tight":"꽉 끼는","tile":"타일","tin":"주석, 깡통","tip":"팁, 끝","tired":"피곤한","tissue":"조직, 화장지","title":"제목","toast":"토스트","tobacco":"담배","toe":"발가락","toilet":"화장실","token":"표시","tomato":"토마토","tone":"어조","tongue":"혀","tonight":"오늘 밤","tool":"도구","tooth":"이","top":"꼭대기","topic":"주제","torch":"횃불","total":"전체의","touch":"만지다","tough":"거친, 힘든","tour":"여행","tourist":"관광객","tournament":"토너먼트","toward":"~쪽으로","towel":"수건","tower":"탑","town":"마을","toy":"장난감","trace":"흔적, 추적하다","track":"길, 추적하다","trade":"무역","tradition":"전통","traffic":"교통","tragedy":"비극","trail":"오솔길","train":"기차, 훈련하다","training":"훈련","transfer":"이동하다","transform":"변형하다","translate":"번역하다","transport":"운송하다","trap":"덫","trash":"쓰레기","travel":"여행하다","tray":"쟁반","treasure":"보물","treat":"대하다, 치료하다","treatment":"치료","treaty":"조약","tremble":"떨다","tremendous":"엄청난","trend":"경향","trial":"재판, 시도","triangle":"삼각형","tribe":"부족","trick":"속임수","trigger":"방아쇠","trip":"여행","triumph":"승리","troop":"군대","trophy":"트로피","trouble":"문제","trousers":"바지","truck":"트럭","trust":"신뢰하다","truth":"진실","tube":"관","tune":"곡조","tunnel":"터널","turkey":"칠면조","twist":"비틀다","type":"유형, 타자치다","typical":"전형적인","tyre":"타이어","ugly":"못생긴","ultimate":"궁극의","umbrella":"우산","uncle":"삼촌","uncomfortable":"불편한","unconscious":"무의식의","underground":"지하의","understand":"이해하다","undertake":"착수하다","unemployment":"실업","unexpected":"예상치 못한","unfair":"불공평한","unfortunate":"불운한","uniform":"제복","union":"연합","unique":"독특한","unit":"단위","unite":"통합하다","universe":"우주","university":"대학","unknown":"알려지지 않은","unless":"~하지 않으면","unlike":"~와 달리","unlikely":"있을 것 같지 않은","unusual":"특이한","update":"갱신하다","upgrade":"향상시키다","upper":"위쪽의","upset":"화난, 속상하게 하다","upstairs":"위층에","urban":"도시의","urge":"촉구하다","urgent":"긴급한","usage":"사용","useful":"유용한","useless":"쓸모없는","user":"사용자","vacation":"휴가","vacuum":"진공","vague":"모호한","valley":"계곡","valuable":"귀중한","value":"가치","van":"밴","vanish":"사라지다","variety":"다양성","various":"다양한","vary":"다양하다","vast":"광대한","vegetable":"채소","vehicle":"차량","venture":"모험","version":"버전","vertical":"수직의","vessel":"용기, 배","victim":"희생자","victory":"승리","video":"비디오","view":"경관, 견해","village":"마을","violence":"폭력","violent":"폭력적인","violin":"바이올린","virtue":"미덕","virus":"바이러스","visible":"보이는","vision":"시력, 비전","visitor":"방문객","visual":"시각의","vital":"필수적인","vocabulary":"어휘","voice":"목소리","volume":"부피, 음량","volunteer":"자원봉사자","vote":"투표하다","voyage":"항해","wage":"임금","wagon":"마차","waist":"허리","waiter":"웨이터","wake":"깨다","wall":"벽","wallet":"지갑","wander":"거닐다","war":"전쟁","warehouse":"창고","warm":"따뜻한","warn":"경고하다","warning":"경고","warrior":"전사","waste":"낭비하다","wave":"파도, 흔들다","weak":"약한","wealth":"부","weapon":"무기","wear":"입다","weary":"지친","weave":"짜다","wed":"결혼하다","weed":"잡초","weekend":"주말","weekly":"매주의","weigh":"무게가 나가다","weight":"무게","weird":"기이한","welcome":"환영하다","welfare":"복지","west":"서쪽","wet":"젖은","whale":"고래","wheat":"밀","wheel":"바퀴","whenever":"언제든지","wherever":"어디든지","whisper":"속삭이다","whistle":"휘파람","white":"흰","whole":"전체의","wicked":"사악한","wide":"넓은","widow":"과부","width":"너비","wild":"야생의","wildlife":"야생동물","willing":"기꺼이 하는","win":"이기다","wine":"와인","wing":"날개","winner":"우승자","winter":"겨울","wipe":"닦다","wire":"철사","wisdom":"지혜","wise":"현명한","witch":"마녀","withdraw":"철회하다","within":"~안에","without":"~없이","witness":"목격자","wolf":"늑대","wonder":"궁금해하다","wonderful":"멋진","wood":"나무","wooden":"나무로 된","wool":"양모","worse":"더 나쁜","worst":"최악의","worth":"~의 가치가 있는","worthy":"가치 있는","wound":"상처","wrap":"싸다","wrist":"손목","yard":"마당","yell":"소리치다","yellow":"노란","youth":"청춘","zone":"지역","zoo":"동물원",
}

for (const [w, meaning] of Object.entries(EXTRA)) {
  if (!LARGE_DICT[w]) LARGE_DICT[w] = { meaning }
}

// ── EXTRA2: coverage expansion targeting missing content words ──
const EXTRA2 = {
  // inflected verbs / irregular past forms
  "accidents":"사고들","accomplished":"이루어낸, 성취된","according":"~에 따르면","accountable":"책임 있는","accounts":"계좌들, 설명들","accuracy":"정확성","aced":"완벽하게 해냈다","achievements":"성취들","acted":"행동했다","acting":"연기, 행동하는","actions":"행동들","acts":"행동하다, 막","adapted":"적응했다","added":"추가했다","addition":"추가, 더하기","addressed":"해결했다, 연설했다","adjusting":"조정하는","admitted":"인정했다","affected":"영향을 받은","afternoons":"오후들","against":"~에 반대하여","agenda":"의제","ages":"나이들, 시대","agreed":"동의했다","aid":"도움","airline":"항공사","airplane":"비행기","airsick":"비행기 멀미를 하는","aisle":"통로","alarm":"경보, 알람","alarms":"알람들","album":"앨범","alcohol":"알코올","allergic":"알레르기가 있는","allergies":"알레르기들","allergy":"알레르기","allowed":"허용된","alongside":"~과 함께","ambulance":"구급차","anger":"분노","anniversary":"기념일","announcement":"발표","annoyed":"짜증난","annual":"연간의","answered":"답했다","antihistamine":"항히스타민제","anxiety":"불안","anxious":"불안한","anymore":"더 이상","anytime":"언제든지","apartments":"아파트들","apologized":"사과했다","apologizes":"사과하다","apologizing":"사과하는","app":"앱","appliance":"가전제품","application":"지원, 신청","applications":"지원서들","applies":"적용하다","appointment":"약속, 예약","appreciated":"감사했다","appreciates":"감사하다","approached":"접근했다","approval":"승인","approved":"승인된","apron":"앞치마","archway":"아치길","arguing":"논쟁하는","armrest":"팔걸이","arrangements":"준비들","arrival":"도착","arrived":"도착했다","arrives":"도착하다","asked":"물었다","asking":"묻는","asks":"묻다","assessment":"평가","assignment":"과제","assignments":"과제들","assumed":"가정했다","assumptions":"가정들","assured":"확인시켜 줬다","astronomy":"천문학","athlete":"운동선수","atm":"현금자동인출기","atms":"현금자동인출기들","attached":"첨부된, 붙은","attendant":"승무원, 안내원","autumn":"가을","avoiding":"피하는","awful":"끔찍한","awkward":"어색한","awkwardness":"어색함",
  // B
  "backed":"뒤로 갔다, 지지했다","backing":"지지","backorder":"재고 부족","backs":"등들, 뒤로 가다","backup":"백업, 대안","badge":"배지","badly":"나쁘게, 심하게","bagged":"가방에 넣었다","bags":"가방들","bail":"보석금, 구제하다","bakery":"빵집","baking":"굽는, 베이킹","ballooned":"부풀었다","banking":"은행 업무","bare":"벌거벗은, 간신히","barely":"간신히","barista":"바리스타","barking":"짖는","basement":"지하실","basically":"기본적으로","basics":"기본","batch":"배치, 묶음","bathwater":"목욕물","battery":"배터리","battles":"싸움들","beaming":"활짝 웃는","bear":"곰; 참다","beat":"이기다, 박자","beaten":"이긴, 맞은","beating":"이기는, 박자","beats":"이기다, 박자들","became":"되었다","becomes":"되다","becoming":"되는","beeping":"삐 소리 나는","beg":"애원하다","began":"시작했다","begged":"애원했다","believed":"믿었다","benefits":"혜택들","betrayed":"배신당한","bickering":"티격태격하는","bid":"입찰하다","bigger":"더 큰","biggest":"가장 큰","billing":"청구","bills":"청구서들","biology":"생물학","birds":"새들","birthdays":"생일들","blaming":"탓하는","blazer":"블레이저","blew":"불었다","blinked":"깜빡했다","blocked":"막힌","blocks":"막다, 블록들","blossom":"꽃피우다","blown":"불려온","blows":"불다","blur":"흐릿함","blurred":"흐릿한","blushed":"얼굴을 붉혔다","boarding":"탑승하는","boards":"판들, 탑승하다","bonus":"보너스","booked":"예약된","booking":"예약","bookings":"예약들","bookshelf":"책장","boom":"호황, 폭발음","boost":"촉진하다","boosts":"촉진들","booth":"부스","borrowed":"빌렸다","bother":"성가시게 하다","bothering":"성가시게 하는","bought":"샀다","bounce":"튀다","bounced":"튀었다","boundaries":"경계들","boxed":"박스에 넣은","boxes":"상자들","bracing":"준비하는","brainer":"명백한 일","brainstorming":"브레인스토밍","brake":"브레이크","braked":"브레이크를 밟았다","brakes":"브레이크들","brand":"브랜드","breach":"위반","breakdown":"고장, 분류","breakfasts":"아침 식사들","breaking":"깨는","breaks":"깨다, 휴식들","breakup":"이별","breathed":"숨쉬었다","breather":"잠깐의 휴식","breathing":"숨쉬는","bridges":"다리들","briefing":"브리핑","briefings":"브리핑들","bringing":"가져오는","brings":"가져오다","broke":"부서졌다","brothers":"형제들","brought":"가져왔다","browser":"브라우저","browsing":"검색하는","brushed":"닦았다","brutal":"잔인한, 혹독한","buckle":"버클, 조이다","buddies":"친구들","buddy":"친구","buffer":"완충제","bugged":"짜증나게 했다","bugging":"짜증나게 하는","builds":"짓다","built":"지었다","bulk":"대량","bullet":"총알","bumped":"부딪쳤다","bumps":"부딪힘들","bumpy":"울퉁불퉁한","bundle":"묶음","burger":"버거","buried":"묻었다","burned":"탔다","burning":"타는","burnout":"번아웃","businesses":"사업들","buttons":"버튼들","buying":"사는","buys":"사다","buzzed":"윙윙거렸다",
  // C
  "cab":"택시","cable":"케이블","cache":"캐시","caf":"카페","caffeine":"카페인","calendars":"달력들","called":"불렀다, 전화했다","caller":"전화하는 사람","calling":"전화하는, 부르는","calls":"전화들, 부르다","calmer":"더 차분한","calmly":"차분하게","came":"왔다","canceled":"취소됐다","canceling":"취소하는","cancellation":"취소","cancelled":"취소됐다","canned":"통조림의, 해고된","capable":"유능한","cards":"카드들","career":"경력, 커리어","careers":"경력들","carefree":"걱정 없는","caretaker":"돌보는 사람","caring":"돌보는","carried":"나랐다","carrying":"나르는","cars":"자동차들","cases":"경우들","casually":"가볍게, 편하게","catches":"잡다","catching":"잡는","cats":"고양이들","caught":"잡았다","caused":"야기했다","causing":"야기하는","caution":"주의","celebrated":"축하했다","ceo":"최고경영자","chairs":"의자들","chances":"기회들","changed":"바뀌었다","changes":"변화들","changing":"바꾸는","chaos":"혼돈","chaotic":"혼란스러운","charger":"충전기","chargers":"충전기들","charges":"청구하다, 청구금","charging":"충전하는","chased":"쫓았다","chasing":"쫓는","chat":"채팅하다","chatted":"채팅했다","chatting":"채팅하는","cheaper":"더 싼","cheapest":"가장 싼","checked":"확인했다","checking":"확인하는","checkout":"체크아웃","cheered":"응원했다","chef":"요리사","chemistry":"화학","cherry":"체리","chew":"씹다","chickening":"겁먹는","chills":"오한, 냉기","chimed":"울렸다","chirping":"지저귀는","choices":"선택들","choosing":"선택하는","chores":"집안일들","cinnamon":"계피","circled":"원을 그렸다","circles":"원들","circling":"맴도는","cited":"인용했다","cities":"도시들","clanked":"쨍 소리 났다","classmates":"급우들","clause":"조항","cleaned":"청소했다","cleaning":"청소하는","cleanup":"청소","cleared":"치웠다","clearer":"더 명확한","clearing":"청소하는, 개간","clears":"치우다","clicked":"클릭했다","clicking":"클릭하는","clicks":"클릭들","clients":"고객들","climbed":"올랐다","clipped":"잘랐다","clogged":"막혔다","closed":"닫혔다","closely":"면밀히","closer":"더 가까운","closes":"닫다","closing":"닫는","clouds":"구름들","coats":"코트들","coding":"코딩하는","coins":"동전들","collapsed":"무너졌다","colleague":"동료","colors":"색들","comeback":"컴백","comes":"오다","coming":"오는","communication":"소통","communities":"공동체들","commute":"통근하다","companies":"회사들","compared":"비교했다","comparing":"비교하는","competition":"경쟁","complaining":"불평하는","complaint":"불평","complaints":"불평들","completed":"완료했다","completely":"완전히","complexity":"복잡성","complicated":"복잡한","compromise":"타협하다","computer":"컴퓨터","concentrate":"집중하다","conclusion":"결론","conclusions":"결론들","concrete":"구체적인","conditioning":"조건화, 훈련","conference":"회의","confidence":"자신감","confidential":"기밀의","confirmation":"확인","confirmed":"확인했다","conflicts":"갈등들","confused":"혼란스러운","confuses":"혼란시키다","confusing":"혼란스러운","connecting":"연결하는","consequence":"결과","consequences":"결과들","considered":"고려했다","consistency":"일관성","consistently":"일관되게","constraints":"제약들","construction":"건설","controversy":"논란","converter":"변환기","cooked":"요리했다","cookies":"쿠키들","cooking":"요리하는","cooperate":"협력하다","cooperates":"협력하다","corners":"모퉁이들","corrected":"수정했다","costs":"비용들","couldn":"~할 수 없었다","counted":"세었다","couples":"커플들","coursework":"과제 작업","covered":"덮었다","covering":"덮는","covers":"덮다","coworker":"동료","coworkers":"동료들","cozy":"아늑한","cracked":"갈라진","cracking":"갈라지는","cranky":"불쾌한","crashed":"충돌했다","crashing":"충돌하는","crawled":"기어갔다","creates":"만들다","creeping":"기는","crisp":"바삭한","criticism":"비판","criticized":"비판받았다","crossed":"건넜다","crossing":"건너는","crouched":"웅크렸다","crowded":"붐비는","crowds":"군중들","cruise":"크루즈","crunch":"위기, 아삭 소리","crushed":"짓이긴","crying":"우는","cue":"신호","curb":"연석, 억제하다","curled":"웅크린, 꼬인","currency":"화폐","customers":"고객들","customs":"세관, 관습들","cutting":"자르는","cyclist":"자전거 타는 사람",
  // D
  "dad":"아빠","damaged":"손상된","dared":"감히 ~했다","dash":"달리다, 대시","dashboard":"대시보드","dates":"날짜들","deadline":"마감일","deadlines":"마감일들","dealing":"다루는","decaf":"카페인 제거 커피","decided":"결정했다","deciding":"결정하는","decisions":"결정들","declined":"거절했다","definitely":"확실히","delayed":"지연된","delicious":"맛있는","delivered":"배달했다","delivery":"배달","demands":"요구들","demo":"시연","depart":"출발하다","department":"부서","departure":"출발","depends":"의존하다","deposit":"예금, 보증금","depression":"우울증","deserves":"~할 자격이 있다","designer":"디자이너","designs":"디자인들","desks":"책상들","desperately":"절실하게","destination":"목적지","details":"세부사항들","determined":"결연한","detour":"우회로","dialogue":"대화","didn":"하지 않았다","died":"죽었다","dies":"죽다","differences":"차이들","differently":"다르게","dim":"어두운","dimmed":"어두워진","diner":"식당","dipped":"담갔다","directions":"방향들","directly":"직접적으로","disagree":"동의하지 않다","disagreed":"동의하지 않았다","disagrees":"동의하지 않다","disappointed":"실망한","discount":"할인","discounts":"할인들","discussion":"토론","dishes":"요리들","dispatched":"파견했다","dizziness":"어지러움","dizzy":"어지러운","doable":"실현 가능한","doctors":"의사들","documents":"문서들","doesn":"~하지 않는다","doing":"하는","dollars":"달러들","don":"~하지 마라","done":"완료된","doors":"문들","doorway":"출입구","doubled":"두 배로 됐다","doubted":"의심했다","dough":"반죽","down":"아래로","downhill":"내리막","downsizing":"규모 축소","downstairs":"아래층에","draft":"초안","dragging":"끌어당기는","drained":"소진된","drawing":"그리는","dressed":"입은","drew":"그렸다","drifted":"떠다녔다","drifting":"떠다니는","drinks":"음료들","driver":"운전자","drives":"운전하다","driving":"운전하는","dropped":"떨어뜨렸다","dropping":"떨어뜨리는","drops":"떨어뜨리다","dug":"팠다","dusty":"먼지 낀","dwelling":"주거","dying":"죽어가는",
  // E
  "earlier":"더 이른, 더 일찍","ease":"편안함, 쉽게 하다","eased":"완화됐다","easier":"더 쉬운","eater":"먹는 사람","eating":"먹는","edits":"편집들","eggs":"달걀들","ego":"자아","eight":"여덟","either":"어느 쪽도","elevator":"엘리베이터","elevators":"엘리베이터들","eleven":"열 하나","else":"그 밖에","email":"이메일","emails":"이메일들","emergencies":"비상 상황들","emergency":"비상 상황","employees":"직원들","ended":"끝났다","ending":"끝나는","endless":"끝없는","ends":"끝들","enemies":"적들","enforced":"시행됐다","english":"영어","enjoys":"즐기다","entirely":"완전히","environmental":"환경의","equality":"평등","erase":"지우다","erases":"지우다","errands":"심부름들","errors":"오류들","europe":"유럽","evacuate":"대피하다","evenings":"저녁들","evenly":"균등하게","events":"사건들","ever":"언젠가, 항상","exaggerates":"과장하다","examples":"예들","exceeded":"초과했다","exception":"예외","exceptions":"예외들","exclusive":"독점적인","excuses":"변명들","execution":"실행","exhaled":"숨을 내쉬었다","exhausted":"지친","exhausting":"지치게 하는","exhibit":"전시하다","expectations":"기대들","expected":"예상된","expense":"비용","expenses":"비용들","explained":"설명했다","explaining":"설명하는","exploring":"탐험하는","expo":"박람회","extension":"연장","extras":"추가 항목들","eyebrow":"눈썹",
  // F
  "faces":"얼굴들","facing":"직면하는","fact":"사실","facts":"사실들","faded":"사라진","fading":"사라지는","failed":"실패했다","fails":"실패하다","faint":"희미한, 기절하다","fallen":"떨어진","falling":"떨어지는","falls":"떨어지다","fare":"요금","farewell":"작별","farmers":"농부들","faster":"더 빠른","fastest":"가장 빠른","feared":"두려워했다","feasible":"실현 가능한","fed":"먹였다","feedback":"피드백","feeding":"먹이는","feeling":"느끼는","feelings":"감정들","feels":"느끼다","fees":"수수료들","feet":"발들","fell":"떨어졌다","felt":"느꼈다","fetched":"가져왔다","fifteen":"열다섯","fifty":"오십","fighting":"싸우는","fights":"싸움들","figured":"알아냈다","figures":"수치들","files":"파일들","filled":"채워진","filling":"채우는","fills":"채우다","finances":"재정","finding":"찾는","finds":"찾다","finished":"끝냈다","finishes":"끝내다","finishing":"끝내는","fishy":"수상한","fist":"주먹","fits":"맞다","fitting":"맞추는","five":"다섯","fixed":"고쳤다","fixes":"고치다","fixing":"고치는","flakes":"조각들","flashy":"화려한","flaws":"결점들","flew":"날았다","flexibility":"유연성","flicker":"깜박이다","flickered":"깜박였다","flickering":"깜박이는","flights":"비행들","flipped":"뒤집었다","flipping":"뒤집는","flooded":"침수됐다","floods":"홍수들","flourish":"번성하다","flowers":"꽃들","flu":"독감","fluffy":"폭신한","fluids":"액체들","flying":"날아가는","focused":"집중된","folded":"접은","folder":"폴더","followed":"따랐다","followers":"팔로워들","following":"따르는","foods":"음식들","forecast":"예보","forgetting":"잊는","forgot":"잊었다","forgotten":"잊혀진","format":"형식","forms":"형태들","forth":"앞으로","forty":"마흔","four":"넷","fourteen":"열넷","fragile":"깨지기 쉬운","frayed":"해진","freezing":"얼어붙는","friday":"금요일","fridays":"금요일들","friendly":"친근한","friendship":"우정","friendships":"우정들","fries":"감자튀김","frowned":"찡그렸다","frowning":"찡그리는","froze":"얼었다","frustrated":"좌절한","frustration":"좌절","fully":"완전히","fumbling":"서툰, 더듬는","funeral":"장례식","fuse":"퓨즈","fuss":"법석",
  // G
  "games":"게임들","gang":"갱단, 무리","garlic":"마늘","gasped":"헉 했다","gates":"문들","gathered":"모았다","gathering":"모으는","gave":"줬다","gender":"성별","generally":"일반적으로","generator":"발전기","gently":"부드럽게","gestured":"몸짓을 했다","gets":"얻다","getting":"얻는","gifts":"선물들","ginger":"생강","given":"주어진","giving":"주는","glance":"힐끔 보다","glanced":"힐끔 봤다","glitch":"결함","glitched":"결함이 생겼다","glitching":"결함이 생기는","glitchy":"결함이 있는","gloves":"장갑들","glow":"빛나다","glowed":"빛났다","gluten":"글루텐","goalposts":"골대들","goes":"가다","going":"가는","gone":"사라진","goodbyes":"작별 인사들","gorgeous":"아름다운","gossip":"험담","gotta":"해야 한다","gotten":"얻은","gps":"위성 항법 장치","grabbed":"잡았다","grabbing":"잡는","grace":"우아함","grad":"졸업생","graduate":"졸업하다","graduates":"졸업하다","graduation":"졸업","grammar":"문법","grandma":"할머니","grandparents":"조부모","granted":"부여된","green":"녹색","grew":"자랐다","grid":"격자, 전력망","grilled":"구운","grim":"엄숙한, 음울한","grinned":"활짝 웃었다","gripped":"꽉 잡았다","groaned":"신음했다","groceries":"식료품들","growing":"자라는","growled":"으르렁거렸다","grown":"자란","growth":"성장","grumpy":"불쾌한","guesthouse":"게스트하우스","guests":"손님들","guidebook":"안내서","gym":"체육관",
  // H
  "hadn":"하지 않았었다","hair":"머리카락","haircut":"이발","half":"반","halfway":"중간에","hallway":"복도","handed":"건넸다","handled":"다뤘다","handles":"다루다","handling":"다루는","handouts":"인쇄물들","handover":"인수인계","hands":"손들","handy":"편리한","hanging":"걸려 있는","happened":"일어났다","happening":"일어나는","happens":"일어나다","happiness":"행복","harder":"더 어려운","hardly":"거의 ~않는","hasn":"~하지 않았다","hated":"싫어했다","haven":"~하지 않았다","having":"가지는","headache":"두통","headed":"향했다","heading":"향하는","headline":"헤드라인","heads":"머리들","heard":"들었다","heater":"히터","heating":"가열하는","heaviest":"가장 무거운","heavily":"무겁게","hectic":"매우 바쁜","held":"잡았다","helped":"도왔다","helping":"돕는","helps":"돕다","herself":"그녀 자신","hesitated":"망설였다","hesitation":"망설임","hey":"이봐","hidden":"숨겨진","hiding":"숨는","higher":"더 높은","hike":"하이킹","hills":"언덕들","himself":"그 자신","hindsight":"뒤늦은 깨달음","hinted":"암시했다","hiring":"채용하는","hits":"치다","hitting":"치는","hmm":"음","hobbies":"취미들","hoisted":"들어올렸다","holding":"잡고 있는","holds":"잡다","holidays":"휴일들","homemade":"집에서 만든","homework":"숙제","honestly":"솔직히","honesty":"정직","hop":"뛰다","hoped":"바랐다","hopefully":"바라건대","hopes":"희망들","hoping":"바라는","horses":"말들","hostel":"호스텔","hourly":"시간당","household":"가정","housewarming":"집들이","hovered":"맴돌았다","hugged":"안았다","humidity":"습도","hunches":"예감들","hung":"걸었다","hurried":"서둘렀다","hurts":"아프다","hypotheticals":"가정들",
  // I
  "icebreaker":"아이스브레이커","icon":"아이콘","icy":"얼음같은","ignored":"무시했다","ignoring":"무시하는","imagined":"상상했다","implications":"의미들","importance":"중요성","impressed":"감명받은","impressions":"인상들","improved":"향상됐다","improvement":"향상","inbox":"수신함","included":"포함됐다","includes":"포함하다","incomplete":"미완성의","increased":"증가했다","incredibly":"믿을 수 없을 정도로","inequality":"불평등","ins":"참가들","insane":"미친","insisted":"주장했다","installments":"할부들","instantly":"즉시","instincts":"본능들","interesting":"흥미로운","intern":"인턴","internationally":"국제적으로","internship":"인턴십","interviewer":"면접관","introverts":"내향적인 사람들","invested":"투자했다","investing":"투자하는","invitation":"초대","invoice":"청구서","invoices":"청구서들","involved":"관련된","ironed":"다렸다","isn":"~이 아니다","isolating":"고립시키는","issues":"문제들","items":"항목들","itinerary":"여행 일정","itself":"그 자체",
  // J
  "jammed":"막혔다","jamming":"막히는","jay":"제이 (이름)","jet":"제트기","jog":"조깅하다","jogged":"조깅했다","jogger":"조깅하는 사람","joined":"합류했다","joining":"합류하는","jokes":"농담들","joking":"농담하는","jotted":"적었다","judging":"판단하는","juggle":"저글링하다","juggling":"여러 일을 동시에 하는","jumped":"뛰었다",
  // K
  "keeping":"유지하는","keeps":"유지하다","keepsake":"기념품","kept":"유지했다","keynote":"기조연설","keys":"열쇠들","killing":"죽이는","kindly":"친절하게","kindness":"친절","kiosk":"키오스크","kit":"장비","knew":"알았다","knocked":"두드렸다","known":"알려진","knows":"알다",
  // L
  "lag":"지연","laid":"놓았다","landed":"착륙했다","landlord":"집주인","lands":"착륙하다","larger":"더 큰","lasts":"지속하다","lately":"최근에","latest":"최신의","laughed":"웃었다","laughing":"웃는","laundry":"세탁","lay":"누웠다","layoffs":"해고들","layover":"경유","leaders":"지도자들","leading":"이끄는","leak":"누출","leaked":"누출됐다","leaking":"누출되는","leaned":"기댔다","learned":"배웠다","learning":"배우는","lease":"임대 계약","leash":"목줄","leaves":"잎들, 떠나다","leaving":"떠나는","led":"이끌었다","left":"떠났다, 왼쪽","leftovers":"남은 음식","legs":"다리들","lend":"빌려주다","lending":"빌려주는","lent":"빌려줬다","less":"더 적은","lets":"하게 하다","letting":"하게 하는","licenses":"면허들","licks":"핥다","lifestyle":"생활방식","lifetime":"일생","lifted":"들어올렸다","lighter":"더 가벼운","lights":"불빛들","lined":"줄 세운","lingered":"머물렀다","liquids":"액체들","listed":"나열했다","listened":"들었다","listening":"듣는","listens":"듣다","lists":"목록들","lit":"켰다","live":"살다","living":"사는","loading":"로딩하는","loaner":"임대","lobby":"로비","locked":"잠긴","locking":"잠그는","lodging":"숙소","login":"로그인","longer":"더 긴","looked":"봤다","looking":"보는","looks":"보다","loop":"고리","loosen":"느슨하게 하다","losing":"잃는","lost":"잃었다","lottery":"복권","lounge":"라운지","loved":"사랑했다","loves":"사랑하다","lower":"낮추다","lowered":"낮췄다","loyalty":"충성도","lying":"거짓말하는, 누워 있는",
  // M
  "mailing":"우편 발송하는","mailman":"우편 배달부","majoring":"전공하는","makes":"만들다","making":"만드는","managed":"관리했다","management":"관리","maps":"지도들","marathon":"마라톤","marked":"표시된","marketing":"마케팅","married":"결혼한","mat":"매트","mattered":"중요했다","matters":"중요하다","maturity":"성숙","meals":"식사들","meant":"의미했다","meditation":"명상","meds":"약들","meetings":"회의들","memories":"기억들","mentioned":"언급했다","mentions":"언급하다","mentor":"멘토","menus":"메뉴들","merger":"합병","messed":"엉망으로 했다","met":"만났다","meter":"미터","metro":"지하철","mid":"중간의","might":"~할지도 모른다","migraine":"편두통","mile":"마일","miles":"마일들","mindfulness":"마음챙김","minds":"마음들","mindset":"사고방식","mints":"박하사탕들","minty":"박하향의","minus":"빼기","misled":"오해하게 했다","missed":"그리워했다","misses":"그리워하다","missing":"그리워하는","mistakes":"실수들","misunderstanding":"오해","mixed":"섞인","mixing":"섞는","mode":"모드","module":"모듈","mom":"엄마","moments":"순간들","momentum":"동력","monday":"월요일","mop":"대걸레","mopping":"대걸레질하는","mornings":"아침들","motivated":"동기부여된","mountains":"산들","moved":"이사했다","movers":"이삿짐 업체","moving":"이사하는","mug":"머그컵","multitasking":"멀티태스킹","must":"~해야 한다","mute":"음소거하다","muttered":"중얼거렸다","mutual":"상호의","myself":"나 자신",
  // N
  "nailed":"완벽하게 해냈다","names":"이름들","nap":"낮잠","navigate":"탐색하다","navigated":"탐색했다","nearest":"가장 가까운","necessarily":"필연적으로","needed":"필요했다","needs":"필요들","negligence":"태만","negotiation":"협상","neighborhood":"이웃","neighborhoods":"이웃들","nerves":"신경들","news":"뉴스","newspaper":"신문","next":"다음","nicely":"멋지게","nighter":"밤새우는 사람","nights":"밤들","nine":"아홉","nodded":"끄덕였다","nods":"끄덕이다","noises":"소음들","non":"비~","nonstop":"쉬지 않는","northern":"북쪽의","notes":"메모들","noticed":"알아챘다","noticing":"알아채는","notification":"알림","notifications":"알림들","nudged":"툭 찔렀다","numbers":"숫자들","nuts":"견과들",
  // O
  "oak":"떡갈나무","obstacles":"장애물들","occurred":"발생했다","oddly":"이상하게","odds":"확률","offending":"기분 상하게 하는","offered":"제공했다","offers":"제공하다","offices":"사무실들","offline":"오프라인의","offsite":"현장 밖의","okay":"괜찮은","onboarding":"온보딩","once":"한번","ones":"것들","oops":"이런","opened":"열었다","opening":"열리는","openings":"개구부들","opens":"열다","operator":"운영자","opposed":"반대된","opposition":"반대","options":"선택들","ordered":"주문했다","ordering":"주문하는","orders":"주문들","others":"다른 것들","otherwise":"그렇지 않으면","outage":"정전","outages":"정전들","outlet":"콘센트","outstanding":"뛰어난","outweighs":"능가하다","overall":"전반적으로","overhead":"간접비","overhyped":"과장된","overloaded":"과부하된","overnight":"밤새","overpromise":"과도하게 약속하다","overreacting":"과잉반응하는","overspend":"과소비하다","overstep":"한도를 넘다","overthink":"과도하게 생각하다","overtime":"초과근무","overwhelmed":"압도된","overwhelming":"압도적인","overwhelmingly":"압도적으로","owl":"올빼미","oysters":"굴들",
  // P
  "packed":"꽉 찬","packing":"포장하는","paid":"지불했다","painkiller":"진통제","paints":"칠하다","pajamas":"잠옷","panicking":"당황하는","paperwork":"서류 작업","parents":"부모들","parked":"주차됐다","part":"부분","partial":"부분적인","partnership":"파트너십","parts":"부분들","pass":"통과하다","passed":"통과했다","passes":"통과하다","passionate":"열정적인","password":"비밀번호","pasta":"파스타","patch":"패치","patted":"토닥였다","paused":"멈췄다","paying":"지불하는","payment":"지불","payments":"지불들","pays":"지불하다","peanuts":"땅콩들","peeling":"벗기는","penciled":"연필로 쓴","pension":"연금","perfection":"완벽","perfectly":"완벽하게","performed":"공연했다","perks":"혜택들","personally":"개인적으로","perspective":"관점","pharmacist":"약사","pharmacy":"약국","phases":"단계들","phew":"휴","phones":"전화들","photography":"사진촬영","photos":"사진들","physics":"물리학","picked":"골랐다","picking":"고르는","pickpockets":"소매치기들","pickup":"픽업","pictured":"그림을 그렸다","pieced":"조각들을 맞췄다","piled":"쌓았다","piling":"쌓는","pinged":"핑 소리 났다","planned":"계획했다","planning":"계획하는","plants":"식물들","plates":"접시들","platforms":"플랫폼들","playground":"놀이터","playing":"노는","plucked":"뽑았다","plumber":"배관공","pockets":"주머니들","pointed":"가리켰다","pointless":"무의미한","points":"점수들","politely":"공손하게","pooling":"풀링하는","popped":"팡 하고 터졌다","portal":"포털","posted":"게시했다","posting":"게시하는","postponed":"연기했다","potatoes":"감자들","pottery":"도예","poured":"부었다","pouring":"붓는","powered":"전원 공급된","practiced":"연습했다","precise":"정확한","prep":"준비","preparation":"준비","prescription":"처방전","presentation":"발표","presenting":"발표하는","pressed":"눌렀다","pretending":"~인 척하는","prices":"가격들","pricey":"비싼","pricing":"가격 책정","printed":"인쇄했다","printer":"프린터","priorities":"우선순위들","pro":"전문가","proceed":"진행하다","processed":"처리했다","production":"생산","productivity":"생산성","projector":"프로젝터","promised":"약속했다","promising":"유망한","promoted":"승진됐다","promotion":"승진","proofread":"교정하다","properly":"제대로","proportion":"비율","proven":"입증된","puffed":"부풀었다","pulled":"당겼다","pulling":"당기는","pulls":"당기다","pumped":"설렜다","purchase":"구매하다","pushed":"밀었다","pushing":"미는","puts":"두다","putting":"두는","puzzled":"당황스러운",
  // Q
  "quantum":"양자","quarterly":"분기별로","quieter":"더 조용한","quietly":"조용히","quits":"그만두다","quitting":"그만두는",
  // R
  "racing":"경주하는","radiator":"라디에이터","rained":"비가 왔다","raining":"비가 오는","rains":"비가 오다","rainy":"비 오는","raised":"올렸다","raising":"올리는","ran":"달렸다","ranch":"목장","randomly":"무작위로","rang":"울렸다","rash":"발진, 성급한","reached":"도달했다","reaching":"도달하는","reading":"읽는","realistic":"현실적인","realization":"깨달음","realized":"깨달았다","reasoning":"추론","reasons":"이유들","rebooked":"다시 예약했다","rebuild":"재건하다","rebuilding":"재건하는","received":"받았다","reception":"접수처, 수신","recession":"경기침체","recharge":"재충전하다","recline":"기대다","recommended":"추천했다","recovery":"회복","recurring":"반복되는","recycling":"재활용하는","reduces":"줄이다","refers":"언급하다","refill":"다시 채우다","refocus":"다시 집중하다","refresh":"새로 고치다","refreshing":"상쾌한","refund":"환불","refused":"거절했다","regardless":"~에 관계없이","regrets":"후회들","regularly":"규칙적으로","reimbursement":"상환","rejection":"거절","rejoining":"다시 합류하는","relationships":"관계들","relaxed":"편안한","relieved":"안도한","remembered":"기억했다","reminded":"상기시켰다","reminder":"알림","reminds":"상기시키다","renovation":"리노베이션","rental":"임대","repaired":"수리했다","repairing":"수리하는","repairs":"수리들","repeated":"반복됐다","replaced":"대체됐다","replacement":"대체","replacements":"대체들","replaying":"다시 재생하는","replied":"답했다","replies":"답장들","replying":"답장하는","requests":"요청들","reread":"다시 읽다","reschedule":"일정을 바꾸다","resentment":"분노","reservation":"예약","reserved":"예약된","reset":"초기화하다","resets":"초기화하다","resetting":"초기화하는","reshaped":"재형성됐다","residents":"거주자들","resolved":"해결됐다","resort":"리조트","responding":"응답하는","responsibilities":"책임들","responsibility":"책임","restart":"재시작하다","restarting":"재시작하는","restless":"불안한","restroom":"화장실","results":"결과들","resume":"이력서, 재개하다","rethink":"재고하다","returned":"돌아왔다","returning":"돌아오는","returns":"돌아오다","reunion":"재결합","reviewing":"검토하는","reviews":"검토들","revisions":"수정들","rewarded":"보상받은","ridden":"타고 다닌","ride":"타다","rights":"권리들","ringing":"울리는","rings":"울리다","rising":"오르는","risks":"위험들","risky":"위험한","roads":"도로들","roadside":"길가","roared":"포효했다","rocking":"흔들리는","rolled":"굴렸다","rolling":"구르는","rooftops":"옥상들","roommate":"룸메이트","rooms":"방들","router":"라우터","rubbed":"문질렀다","rules":"규칙들","running":"달리는","runs":"달리다","rushed":"서둘렀다","rushing":"서두르는",
  // S
  "sadly":"슬프게","safely":"안전하게","safer":"더 안전한","sales":"판매들","salon":"살롱","samples":"샘플들","sane":"제정신의","sanitizer":"살균제","sat":"앉았다","satisfied":"만족한","saturday":"토요일","saturdays":"토요일들","saved":"저장했다","saves":"저장하다","saving":"저장하는","saw":"봤다","saying":"말하는","says":"말하다","scaling":"확장하는","scanned":"스캔했다","scared":"무서워진","scarf":"스카프","scenic":"경치 좋은","schedules":"일정들","screenshot":"스크린샷","scrolled":"스크롤했다","seafood":"해산물","searching":"검색하는","seatbelt":"안전벨트","seats":"좌석들","sec":"초","security":"보안","seeing":"보는","seemed":"~인 것 같았다","seems":"~인 것 같다","seen":"봤다","sees":"보다","seller":"판매자","semester":"학기","sending":"보내는","sent":"보냈다","serendipity":"뜻밖의 행운","seriously":"심각하게","server":"서버","setback":"좌절","setbacks":"좌절들","setting":"설정","settled":"정착했다","settling":"정착하는","setup":"설치","seven":"일곱","shaggy":"덥수룩한","shaken":"흔들린","shaking":"흔들리는","shaky":"흔들리는","shared":"공유했다","sharing":"공유하는","sharply":"날카롭게","shaved":"면도했다","shellfish":"조개류","shelves":"선반들","shh":"쉿","shifted":"이동했다","shifts":"교대들","shipment":"화물","shipped":"배송됐다","shipping":"배송하는","shoes":"신발들","shook":"흔들었다","shopping":"쇼핑하는","shots":"주사들","shoulders":"어깨들","shouldn":"~하지 않아야 한다","shouted":"소리쳤다","showed":"보여줬다","showing":"보여주는","shown":"보여진","shows":"보여주다","shrugged":"어깨를 으쓱했다","shuts":"닫다","shutting":"닫는","sickness":"질병","side":"옆면","sides":"면들","sidetracked":"방향을 잃은","sighed":"한숨을 쉬었다","signals":"신호들","signed":"서명했다","significantly":"상당히","signing":"서명하는","signs":"표지들","silently":"조용히","simmer":"시글시글 끓이다","simpler":"더 간단한","simply":"단순히","sincerely":"진심으로","sipping":"홀짝이는","sirens":"사이렌들","sitting":"앉는","six":"여섯","sixth":"여섯 번째","sketchbook":"스케치북","skills":"기술들","skipped":"건너뛰었다","skipping":"건너뛰는","skips":"건너뛰다","sleeping":"자는","sleepy":"졸린","sleeves":"소매들","slept":"잤다","slid":"미끄러졌다","slides":"미끄러지다","slipped":"미끄러졌다","slowed":"느려졌다","smaller":"더 작은","smelled":"냄새났다","smells":"냄새나다","smiled":"미소 지었다","smiling":"미소 짓는","smoking":"흡연하는","smoothing":"부드럽게 하는","smoothly":"부드럽게","snacks":"간식들","snapping":"딱 소리 내는","sniff":"냄새 맡다","snoring":"코고는","soaked":"흠뻑 젖은","soared":"솟았다","socks":"양말들","sofa":"소파","softened":"부드러워진","softly":"부드럽게","sold":"팔았다","solo":"혼자의","solved":"해결했다","solving":"해결하는","someday":"언젠가","sooner":"더 빨리","sorted":"정렬됐다","sorting":"정렬하는","sounded":"들렸다","sounds":"소리들","sourdough":"사워도우 빵","souvenirs":"기념품들","sparked":"불꽃이 튀었다","sparks":"불꽃들","speaking":"말하는","speaks":"말하다","spec":"사양","speeding":"속도 위반하는","spending":"소비하는","spicy":"매운","spilled":"쏟았다","spinning":"돌리는","spite":"악의","splitting":"나누는","splurge":"과소비하다","splurged":"과소비했다","spoke":"말했다","spoken":"말해진","spotlight":"스포트라이트","spots":"장소들","spotted":"발견했다","sprained":"삐었다","spreading":"퍼지는","spreads":"퍼지다","spreadsheet":"스프레드시트","sprint":"단거리 질주","sprinted":"달렸다","spun":"돌았다","spur":"박차, 자극하다","squeezed":"짰다","stability":"안정성","stack":"쌓다","stacking":"쌓는","stain":"얼룩","stairs":"계단들","stall":"지연되다","standing":"서 있는","standpoint":"관점","stands":"서다","standup":"스탠드업","stapler":"스테이플러","stared":"응시했다","staring":"응시하는","started":"시작했다","starter":"시작하는 사람","starting":"시작하는","starts":"시작하다","startup":"스타트업","starving":"굶주리는","stayed":"머물렀다","staying":"머무르는","steeper":"더 가파른","stepped":"발을 내디뎠다","stepping":"발을 내디디는","steps":"단계들","stew":"스튜","sticker":"스티커","stocked":"재고가 있는","stole":"훔쳤다","stood":"서 있었다","stopped":"멈췄다","stopping":"멈추는","stops":"멈추다","straightforward":"간단한","streak":"연속","streets":"거리들","strengths":"강점들","stressed":"스트레스받은","stressful":"스트레스 받는","stretched":"늘렸다","strikes":"파업들","struggles":"투쟁들","struggling":"투쟁하는","students":"학생들","studies":"공부한다","studying":"공부하는","stuffy":"답답한","submitting":"제출하는","subway":"지하철","successfully":"성공적으로","suggested":"제안했다","suitcases":"여행가방들","suite":"스위트룸","suited":"어울리는","summed":"요약했다","sunburn":"햇볕에 탐","sunday":"일요일","sundays":"일요일들","sunglasses":"선글라스","sunrise":"일출","supplements":"보충제들","supplier":"공급자","supplies":"공급품들","supports":"지원하다","supposed":"예상된","surfing":"서핑하는","surprised":"놀란","surprises":"놀라게 하다","sushi":"스시","suspected":"의심했다","swamped":"압도된","swapped":"바꿨다","swatches":"견본들","sweetie":"자기야","swelling":"붓는","swerved":"방향을 바꿨다","switched":"전환됐다","switching":"전환하는","swore":"맹세했다","sympathize":"공감하다","sympathizes":"공감하다","sync":"동기화하다",
  // T
  "tab":"탭","tacos":"타코들","tact":"재치","tag":"태그","takeaway":"포장 음식, 요점","taken":"가져가진","takeout":"포장 음식","takes":"가져가다","taking":"가져가는","talented":"재능 있는","talked":"이야기했다","talking":"이야기하는","talks":"이야기들","taped":"테이프로 붙였다","tapped":"두드렸다","targets":"목표들","tasks":"과제들","tasted":"맛봤다","tastes":"맛보다","teaching":"가르치는","teammate":"팀원","teammates":"팀원들","teams":"팀들","teamwork":"팀워크","tears":"눈물들","teasing":"놀리는","tech":"기술","technician":"기술자","tedious":"지루한","teeth":"치아들","teller":"은행 창구 직원","telling":"말하는","tells":"말하다","temples":"사원들","temptation":"유혹","ten":"열","tends":"경향이 있다","tens":"십들","tension":"긴장","tensions":"긴장들","tenth":"열 번째","terminal":"터미널","terms":"조건들","terrified":"공포에 질린","textbook":"교과서","texted":"문자 보냈다","texting":"문자 보내는","texts":"문자들","thank":"감사하다","thanked":"감사했다","thanks":"감사해","themselves":"그들 자신","therapy":"치료","thinking":"생각하는","thinks":"생각하다","third":"세 번째","thirty":"서른","thoughts":"생각들","three":"셋","thrives":"번성하다","thumbs":"엄지들","thunderstorms":"폭풍우들","thursday":"목요일","ticked":"체크했다","tickets":"표들","till":"~까지","tilted":"기울어진","timeline":"타임라인","timer":"타이머","timing":"타이밍","tips":"팁들","tiptoeing":"발끝으로 걷는","tire":"타이어","told":"말했다","took":"가져갔다","tools":"도구들","totally":"완전히","totals":"합계들","toughest":"가장 힘든","tourists":"관광객들","tow":"견인하다","towels":"수건들","towering":"우뚝 솟은","towing":"견인하는","toxic":"독성의","toys":"장난감들","tracking":"추적하는","traded":"거래했다","trading":"거래하는","transferring":"이동하는","transfers":"이동들","transit":"이동","transition":"전환","transparency":"투명성","traveling":"여행하는","travels":"여행들","trends":"경향들","tried":"시도했다","tries":"시도하다","trips":"여행들","trotted":"빠르게 걸었다","troubleshooting":"문제 해결","trusting":"믿는","trying":"시도하는","tucked":"집어넣었다","tuesday":"화요일","turbulence":"난기류","turned":"돌렸다","turning":"돌리는","turns":"돌다","tutorial":"튜토리얼","twelve":"열둘","twenties":"이십대","twenty":"스물","twice":"두 번","typed":"입력했다","typo":"오탈자",
  // U
  "ugh":"으","ultimately":"궁극적으로","umbrellas":"우산들","unanswered":"답변 없는","uncertainty":"불확실성","underestimate":"과소평가하다","underprivileged":"혜택받지 못한","understatement":"절제된 표현","understood":"이해했다","unfairly":"불공평하게","units":"단위들","unlocked":"잠금 해제됐다","unmuted":"음소거 해제됐다","unpack":"짐을 풀다","unpacking":"짐 푸는","unplug":"플러그를 뽑다","unplugging":"플러그 뽑는","unread":"읽지 않은","unstoppable":"멈출 수 없는","unsure":"확신하지 못하는","unwinding":"긴장을 풀는","updated":"업데이트됐다","updates":"업데이트들","upfront":"솔직한, 선불의","uploading":"업로드하는","uploads":"업로드들","urgently":"긴급하게","using":"사용하는",
  // V
  "vacuuming":"진공 청소기 돌리는","valued":"소중히 여겨진","values":"가치들","vanished":"사라졌다","vase":"꽃병","vending":"자동판매","vendor":"판매자","vendors":"판매자들","venue":"장소","vibe":"분위기","victims":"희생자들","visa":"비자","visited":"방문했다","vitamins":"비타민들","volunteering":"자원봉사하는",
  // W
  "wagged":"흔들었다","waited":"기다렸다","waiting":"기다리는","wakes":"깨다","waking":"깨는","walked":"걸었다","walking":"걷는","wanted":"원했다","wants":"원하다","warmer":"더 따뜻한","warmly":"따뜻하게","warmth":"따뜻함","warned":"경고했다","warranty":"보증","wasn":"~이 아니었다","watched":"봤다","watching":"보는","waters":"물들","waved":"흔들었다","waving":"흔드는","ways":"방법들","wearing":"입는","website":"웹사이트","wedding":"결혼식","weekday":"평일","weekends":"주말들","weeks":"주들","went":"갔다","weren":"~이 아니었다","whatever":"무엇이든","which":"어느","whispered":"속삭였다","whiteboard":"화이트보드","whoever":"누구든","whose":"누구의","wifi":"와이파이","wiggle":"흔들다","willpower":"의지력","winced":"움찔했다","windy":"바람 부는","wink":"윙크하다","wins":"이기다","wiped":"닦았다","wiper":"와이퍼","wiring":"배선","wished":"바랐다","withdrawal":"철회, 출금","wobbly":"흔들리는","woke":"깼다","won":"이겼다","wondered":"궁금해했다","wondering":"궁금해하는","wonders":"경이들","workday":"근무일","worked":"일했다","working":"일하는","workload":"업무량","workout":"운동","workplace":"직장","works":"일하다","workshop":"워크숍","worried":"걱정했다","worries":"걱정들","worthwhile":"가치 있는","wouldn":"~하지 않을 것이다","wow":"와","wrapped":"쌌다","wrapping":"싸는","writing":"쓰는","written":"써진","wrote":"썼다",
  // Y-Z
  "yawned":"하품했다","yeah":"응","yelling":"소리치는","yes":"그렇다","yeses":"동의들","yours":"당신의 것","yourself":"당신 자신","zero":"영",
}

for (const [w, meaning] of Object.entries(EXTRA2)) {
  if (!LARGE_DICT[w]) LARGE_DICT[w] = { meaning }
}

// ── build output ──
const words = readFileSync(join(__dirname, '_content-words.txt'), 'utf8')
  .split(/\r?\n/).map(s => s.trim()).filter(Boolean)

function jsStemCandidates(w) {
  const c = [w]
  if (w.endsWith("ies") && w.length > 4) c.push(w.slice(0, -3) + "y")
  if (w.endsWith("es") && w.length > 3) { c.push(w.slice(0, -2)); c.push(w.slice(0, -1)) }
  if (w.endsWith("s") && w.length > 3) c.push(w.slice(0, -1))
  if (w.endsWith("ing") && w.length > 5) {
    const base = w.slice(0, -3)
    c.push(base, base + "e")
    if (base.length > 1 && base[base.length - 1] === base[base.length - 2]) c.push(base.slice(0, -1))
  }
  if (w.endsWith("ed") && w.length > 4) {
    const base = w.slice(0, -2)
    c.push(base, base + "e", w.slice(0, -1))
    if (base.length > 1 && base[base.length - 1] === base[base.length - 2]) c.push(base.slice(0, -1))
    if (base.endsWith("i")) c.push(base.slice(0, -1) + "y")
  }
  if (w.endsWith("ly") && w.length > 4) { c.push(w.slice(0, -2)); c.push(w.slice(0, -2) + "e") }
  if (w.endsWith("er") && w.length > 4) { c.push(w.slice(0, -2)); c.push(w.slice(0, -1)) }
  if (w.endsWith("est") && w.length > 5) { c.push(w.slice(0, -3)); c.push(w.slice(0, -2)) }
  return c
}
function resolves(w) {
  if (LARGE_DICT[w]) return true
  return jsStemCandidates(w).some(c => LARGE_DICT[c])
}

const covered = []
const uncovered = []
for (const w of words) {
  if (resolves(w)) covered.push(w)
  else uncovered.push(w)
}

// Emit all dictionary entries (full LARGE_DICT), sorted.
const allKeys = Object.keys(LARGE_DICT).sort()
const lines = allKeys.map(w => {
  const e = LARGE_DICT[w]
  const parts = [`word: ${JSON.stringify(w)}`, `meaning: ${JSON.stringify(e.meaning)}`]
  if (e.pos) parts.push(`pos: ${JSON.stringify(e.pos)}`)
  if (e.level) parts.push(`level: ${JSON.stringify(e.level)}`)
  return `  ${JSON.stringify(w)}: { ${parts.join(', ')} },`
})

const out = `// Auto-generated — do not edit manually. Run scripts/generate-dictionary.mjs to rebuild.
export type DictEntry = {
  word: string
  meaning: string
  pos?: string   // 'noun' | 'verb' | 'adj' | 'adv' | 'prep' | 'conj'
  level?: string // 'A1' | 'A2' | 'B1' | 'B2'
}

export const pattoDict: Record<string, DictEntry> = {
${lines.join('\n')}
}

// Generate candidate base forms for a possibly-inflected word (plurals, -ed, -ing, etc.).
function stemCandidates(w: string): string[] {
  const c: string[] = [w]
  if (w.endsWith("ies") && w.length > 4) c.push(w.slice(0, -3) + "y")
  if (w.endsWith("es") && w.length > 3) { c.push(w.slice(0, -2)); c.push(w.slice(0, -1)) }
  if (w.endsWith("s") && w.length > 3) c.push(w.slice(0, -1))
  if (w.endsWith("ing") && w.length > 5) {
    const base = w.slice(0, -3)
    c.push(base, base + "e")
    if (base.length > 1 && base[base.length - 1] === base[base.length - 2]) c.push(base.slice(0, -1))
  }
  if (w.endsWith("ed") && w.length > 4) {
    const base = w.slice(0, -2)
    c.push(base, base + "e", w.slice(0, -1))
    if (base.length > 1 && base[base.length - 1] === base[base.length - 2]) c.push(base.slice(0, -1))
    if (base.endsWith("i")) c.push(base.slice(0, -1) + "y")
  }
  if (w.endsWith("ly") && w.length > 4) { c.push(w.slice(0, -2)); c.push(w.slice(0, -2) + "e") }
  if (w.endsWith("er") && w.length > 4) { c.push(w.slice(0, -2)); c.push(w.slice(0, -1)) }
  if (w.endsWith("est") && w.length > 5) { c.push(w.slice(0, -3)); c.push(w.slice(0, -2)) }
  return c
}

export function lookupMeaning(word: string): string | undefined {
  const w = word.toLowerCase()
  const direct = pattoDict[w]
  if (direct) return direct.meaning
  for (const cand of stemCandidates(w)) {
    const e = pattoDict[cand]
    if (e) return e.meaning
  }
  return undefined
}
`

writeFileSync(join(root, 'data/patto-dictionary.ts'), out, 'utf8')

const pct = ((covered.length / words.length) * 100).toFixed(1)
console.log('Dictionary total entries:', allKeys.length)
console.log('Total words in content:', words.length)
console.log('Words covered:', covered.length)
console.log('Coverage:', pct + '%')
console.log('Uncovered words (max 100):')
console.log(uncovered.slice(0, 100).join(', '))
