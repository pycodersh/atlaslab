import {
  Award, AudioLines, Backpack, BadgeCheck, Beer, Bike, Brain, Briefcase, Building2, CalendarCheck, ChefHat, CircleHelp,
  Clapperboard, ClipboardList, CloudFog, CloudLightning, CloudRain, CloudSun, Coffee, Compass, CookingPot, Droplets, Drum,
  Dumbbell, Eye, Feather, Flag, Flame, Footprints, Gift, Glasses, Globe, GraduationCap, HandHeart, HandHelping, Handshake,
  Heart, HeartHandshake, HeartPulse, History, Hourglass, House, Landmark, Languages, Layers, Leaf, Library, Lightbulb, Link,
  ListChecks, ListOrdered, Map, Megaphone, MessageCircle, MessageCircleHeart, MessagesSquare, Mic, MicVocal, Milestone,
  Mountain, Music, NotebookPen, Palette, PartyPopper, Pill, Plane, Popcorn, Puzzle, Recycle, RefreshCw, Rocket, Salad,
  Scale, School, Share2, Shirt, ShoppingBag, ShoppingBasket, ShoppingCart, Smartphone, Smile, Soup, Sparkles, Split,
  Sprout, Star, Stethoscope, Store, Sun, Target, TrainFront, TrendingUp, Trophy, Tv, Users, Utensils, UtensilsCrossed,
  Waves, type LucideIcon,
} from 'lucide-react'

/**
 * 에피소드 번호 → 상황 라인 아이콘 (Library 에피소드 헤더 카드용).
 * OS 컬러 이모지는 기기마다 모양이 달라 앱 톤과 어긋났다 — 단색 lucide 아이콘으로 어디서나 같게 보이게 한다.
 * 제목(kp_episodes.title)을 보고 100화 모두 직접 고른 값. 101화 이후·누락은 MessageCircle.
 */
const ICONS: Record<number, LucideIcon> = {
  1: Coffee,            // 카페에서
  2: TrainFront,        // 지하철에서
  3: Soup,              // 떡볶이 가게에서
  4: Store,             // 편의점에서
  5: UtensilsCrossed,   // 식당에서
  6: Mic,               // 노래방에서
  7: ShoppingBasket,    // 시장에서
  8: Sparkles,          // 뷰티숍에서
  9: Waves,             // 한강에서
  10: School,           // 학교에서
  11: TrainFront,       // 지하철에서
  12: UtensilsCrossed,  // 식당에서 (심화)
  13: CalendarCheck,    // 약속 잡기
  14: Compass,          // 길 잃은 에마
  15: Tv,               // 드라마 추천
  16: CloudSun,         // 날씨 이야기
  17: Pill,             // 약국에서
  18: Palette,          // 취미 이야기
  19: Landmark,         // 경복궁 여행
  20: Handshake,        // 오랜만에 만남
  21: History,          // 어제 뭐 했어?
  22: CircleHelp,       // 추측하기
  23: ListChecks,       // 해야 해요
  24: MessagesSquare,   // 의견 나누기
  25: Footprints,       // 경험 이야기
  26: Clapperboard,     // K-드라마 이야기
  27: Music,            // K-POP
  28: ShoppingBag,      // K-뷰티 쇼핑
  29: Dumbbell,         // 건강과 운동
  30: House,            // 어디 살아요?
  31: Smile,            // 감정 표현
  32: HeartHandshake,   // 위로하기
  33: Smartphone,       // SNS 친구
  34: Utensils,         // 밥 한번 먹어요
  35: Drum,             // 한국 문화
  36: Beer,             // 음주 문화
  37: MicVocal,         // 노래방
  38: PartyPopper,      // K-댄스
  39: NotebookPen,      // 카페 공부
  40: Sprout,           // 문화 적응
  41: Link,             // 연결 표현
  42: Split,            // 조건과 제안
  43: Scale,            // 이유와 비교
  44: ListOrdered,      // 시간 순서
  45: HandHelping,      // 도움 주기
  46: Hourglass,        // 기간과 진행
  47: Shirt,            // 패션
  48: Bike,             // 배달 음식
  49: Plane,            // 여행 계획
  50: Flag,             // 한국 생활 절반
  51: ClipboardList,    // 계획 세우기
  52: BadgeCheck,       // 결심
  53: Share2,           // 경험 나누기
  54: Languages,        // 언어 교환
  55: ChefHat,          // 음식 만들기
  56: ShoppingCart,     // 쇼핑
  57: Briefcase,        // 카페 알바
  58: Stethoscope,      // 병원
  59: Library,          // 독서 카페
  60: Salad,            // 음식 문화
  61: Waves,            // 한강에서
  62: Building2,        // 직장 생활
  63: TrendingUp,       // SNS 트렌드
  64: CookingPot,       // 요리 도전
  65: Droplets,         // K-뷰티 루틴
  66: GraduationCap,    // 한국어 실력
  67: Leaf,             // 날씨와 계절
  68: Puzzle,           // 갈등 해소
  69: Target,           // 목표와 꿈
  70: Recycle,          // 환경과 분리수거
  71: MessageCircleHeart, // 감성 대화
  72: CloudLightning,   // 갈등과 오해
  73: Trophy,           // 목표 달성
  74: Map,              // 한국 음식 탐험
  75: Sun,              // 일상의 즐거움
  76: Brain,            // 한국어 고민
  77: Users,            // 친구와 시간
  78: Rocket,           // 꿈을 향해
  79: Star,             // 맛집 탐방
  80: Mountain,         // 성장을 느끼며
  81: Megaphone,        // 간접 전달
  82: RefreshCw,        // 자연스러운 변화
  83: Layers,           // 뉘앙스 심화
  84: Glasses,          // 신중한 판단
  85: Eye,              // 직관과 감각
  86: Globe,            // 문화 이해
  87: Heart,            // 솔직한 감정
  88: AudioLines,       // 유창함
  89: Backpack,         // 로컬 여행
  90: Flame,            // 트렌드
  91: Feather,          // 완곡한 표현
  92: Lightbulb,        // 논리와 결론
  93: HeartPulse,       // 깊은 감정
  94: HandHeart,        // 깊은 위로
  95: Popcorn,          // 드라마 감상
  96: CloudFog,         // 설명하기 어려운 감정
  97: CloudRain,        // 이별과 그리움
  98: Award,            // 유창함의 완성
  99: Gift,             // 감사와 관계
  100: Milestone,       // 한국어 여정의 시작
}

export function episodeIcon(epNum: number): LucideIcon {
  return ICONS[epNum] ?? MessageCircle
}
