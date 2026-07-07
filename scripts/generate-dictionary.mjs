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
