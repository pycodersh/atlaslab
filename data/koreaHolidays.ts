/**
 * Korea Holiday & Peak Calendar 원본 — 날짜와 여행자가 겪을 영향을 함께 적는다.
 * 2026-11-09 확인: 2027 날짜는 우주항공청 월력요항을 옮긴 공개 자료 기준.
 * 노동절은 2026년 전 국민 공휴일이 됐고, 제헌절도 2026년 공휴일로 복원됐다.
 * 음력 휴일은 해마다 날짜가 달라지므로 새 해를 넣을 때 월력요항으로 다시 확인한다.
 */
export type HolidayImpact = 'major-shutdown' | 'crowded' | 'normal'
export type Holiday = {
  name: string
  koreanName: string
  date: string
  /** 연휴의 마지막 날 */
  endDate?: string
  /** 주말과 겹쳐 쉬는 대체공휴일 */
  substitute?: string
  impact: HolidayImpact
  travelTip: string
}

type Info = Pick<Holiday, 'name' | 'koreanName' | 'impact' | 'travelTip'>
type Dates = Pick<Holiday, 'date' | 'endDate' | 'substitute'>

const INFO = {
  newYear: { name: 'New Year’s Day', koreanName: '신정', impact: 'normal', travelTip: 'Most shops and restaurants stay open. East coast sunrise spots get busy before dawn.' },
  seollal: { name: 'Seollal (Lunar New Year)', koreanName: '설날 연휴', impact: 'major-shutdown', travelTip: 'Trains and highways jam nationwide and many markets and small shops close. Royal palaces have usually opened free.' },
  independence: { name: 'Independence Movement Day', koreanName: '삼일절', impact: 'normal', travelTip: 'Government offices close, while tourist areas run as usual.' },
  labor: { name: 'Labor Day', koreanName: '노동절', impact: 'normal', travelTip: 'Banks and government offices close, while malls and restaurants mostly stay open.' },
  children: { name: 'Children’s Day', koreanName: '어린이날', impact: 'crowded', travelTip: 'Theme parks, museums and city parks fill with families. Go early or pick an adult-friendly area.' },
  buddha: { name: 'Buddha’s Birthday', koreanName: '부처님오신날', impact: 'crowded', travelTip: 'Major temples draw crowds for lantern events. Arrive early and expect traffic nearby.' },
  memorial: { name: 'Memorial Day', koreanName: '현충일', impact: 'normal', travelTip: 'A siren sounds nationwide at 10 a.m. for a moment of silence. It is not an emergency.' },
  constitution: { name: 'Constitution Day', koreanName: '제헌절', impact: 'normal', travelTip: 'Government offices close, while shops and sights run as usual.' },
  liberation: { name: 'Liberation Day', koreanName: '광복절', impact: 'normal', travelTip: 'Government offices close, while shops and restaurants mostly stay open.' },
  chuseok: { name: 'Chuseok (Harvest Festival)', koreanName: '추석 연휴', impact: 'major-shutdown', travelTip: 'KTX seats sell out early and return traffic is heavy. Many small restaurants close. Royal palaces have usually opened free.' },
  foundation: { name: 'National Foundation Day', koreanName: '개천절', impact: 'normal', travelTip: 'Government offices close, while tourist areas run as usual.' },
  hangeul: { name: 'Hangeul Day', koreanName: '한글날', impact: 'normal', travelTip: 'Government offices close, while shops and sights run as usual.' },
  christmas: { name: 'Christmas Day', koreanName: '크리스마스', impact: 'crowded', travelTip: 'Myeongdong, Seongsu and other city centers get packed. Book restaurants ahead.' },
} satisfies Record<string, Info & { impact: HolidayImpact }>

const YEARS: Record<number, Record<keyof typeof INFO, Dates>> = {
  2026: {
    newYear: { date: '2026-01-01' },
    seollal: { date: '2026-02-16', endDate: '2026-02-18' },
    independence: { date: '2026-03-01', substitute: '2026-03-02' },
    labor: { date: '2026-05-01' },
    children: { date: '2026-05-05' },
    buddha: { date: '2026-05-24', substitute: '2026-05-25' },
    memorial: { date: '2026-06-06' },
    constitution: { date: '2026-07-17' },
    liberation: { date: '2026-08-15', substitute: '2026-08-17' },
    chuseok: { date: '2026-09-24', endDate: '2026-09-26' },
    foundation: { date: '2026-10-03', substitute: '2026-10-05' },
    hangeul: { date: '2026-10-09' },
    christmas: { date: '2026-12-25' },
  },
  2027: {
    newYear: { date: '2027-01-01' },
    seollal: { date: '2027-02-06', endDate: '2027-02-08', substitute: '2027-02-09' },
    independence: { date: '2027-03-01' },
    labor: { date: '2027-05-01', substitute: '2027-05-03' },
    children: { date: '2027-05-05' },
    buddha: { date: '2027-05-13' },
    memorial: { date: '2027-06-06' },
    constitution: { date: '2027-07-17', substitute: '2027-07-19' },
    liberation: { date: '2027-08-15', substitute: '2027-08-16' },
    chuseok: { date: '2027-09-14', endDate: '2027-09-16' },
    foundation: { date: '2027-10-03', substitute: '2027-10-04' },
    hangeul: { date: '2027-10-09', substitute: '2027-10-11' },
    christmas: { date: '2027-12-25', substitute: '2027-12-27' },
  },
}

export const HOLIDAY_YEARS = Object.keys(YEARS).map(Number)

export const KOREA_HOLIDAYS: Holiday[] = HOLIDAY_YEARS.flatMap(year =>
  (Object.keys(INFO) as (keyof typeof INFO)[]).map(key => ({ ...INFO[key], ...YEARS[year][key] })),
)

/** 학교 일정은 학교마다 다르므로 날짜로 박지 않고 대략의 시즌으로만 안내한다 */
export type SchoolSeason = { name: string; koreanName: string; period: string; impact: string; tip: string }
export const SCHOOL_SEASONS: SchoolSeason[] = [
  {
    name: 'Summer Break', koreanName: '여름방학', period: 'Mid-July to late August',
    impact: 'Peak season for theme parks like Lotte World and Everland, and for Busan, Gangneung and Jeju.',
    tip: 'Reserve theme park fast passes ahead, even on weekdays, and expect higher KTX demand and beach hotel prices.',
  },
  {
    name: 'Winter Break', koreanName: '겨울방학', period: 'Mid-December to late February',
    impact: 'Ski season opens, and malls, aquariums and pop-up stores get busy even on weekdays.',
    tip: 'Visit indoor attractions early in the day, and book ski trips ahead.',
  },
  {
    name: 'College Back-to-School', koreanName: '대학교 개강', period: 'Early March & early September',
    impact: 'College areas like Hongdae, Sinchon and Hyehwa get livelier, with evening waits at pubs and restaurants.',
    tip: 'Weekday daytime, while students are in class, is the most comfortable time for popular spots and cafes.',
  },
]

/** 대체공휴일까지 포함한 마지막 쉬는 날 */
export const lastDayOf = (h: Holiday) => [h.date, h.endDate ?? '', h.substitute ?? ''].sort().at(-1) as string
