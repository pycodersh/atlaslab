import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

interface EpUpdate { episode_num: number; location: string; characters: string[]; is_free: boolean }
interface EpInsert { episode_num: number; title: string; location: string; characters: string[]; is_free: boolean }

const EP_UPDATES: EpUpdate[] = [
  { episode_num: 1,  location: '카페 (지수 알바 중)',  characters: ['emma','jisu'],                        is_free: true  },
  { episode_num: 2,  location: '지하철역',               characters: ['emma','jisu'],                        is_free: true  },
  { episode_num: 3,  location: '떡볶이 가게',            characters: ['emma','jisu','merchant'],              is_free: true  },
  { episode_num: 4,  location: '편의점',                 characters: ['emma','minjun'],                      is_free: true  },
  { episode_num: 5,  location: '삼겹살 식당',            characters: ['emma','jisu','minjun','staff'],        is_free: true  },
  { episode_num: 6,  location: '노래방',                 characters: ['emma','jisu','sophie'],                is_free: false },
  { episode_num: 7,  location: '전통시장',               characters: ['emma','minjun','merchant'],            is_free: false },
  { episode_num: 8,  location: '뷰티숍',                 characters: ['emma','sophie','staff'],               is_free: false },
  { episode_num: 9,  location: '한강공원',               characters: ['emma','jisu','sophie'],                is_free: false },
  { episode_num: 10, location: '대학교 강의실',          characters: ['emma','jisu','professor','students'],  is_free: false },
]

const EP_INSERTS: EpInsert[] = [
  { episode_num: 11, title: '지하철에서',          location: '지하철역 / 지하철 / 택시',  characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 12, title: '식당에서 (심화)',     location: '한식당',                    characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 13, title: '약속 잡기',           location: '카카오톡 / 카페',            characters: ['emma','jisu','sophie'],            is_free: false },
  { episode_num: 14, title: '길 잃은 에마',        location: '인사동 골목',               characters: ['emma','stranger'],                 is_free: false },
  { episode_num: 15, title: '드라마 추천',         location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 16, title: '날씨 이야기',         location: '학교 앞',                   characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 17, title: '약국에서',            location: '약국',                      characters: ['emma','jisu','pharmacist'],         is_free: false },
  { episode_num: 18, title: '취미 이야기',         location: '카페',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 19, title: '경복궁 여행',         location: '경복궁',                    characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 20, title: '오랜만에 만남',       location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 21, title: '어제 뭐 했어?',      location: '학교 복도',                 characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 22, title: '추측하기',            location: '식당 앞',                   characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 23, title: '해야 해요',           location: '도서관',                    characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 24, title: '의견 나누기',         location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 25, title: '경험 이야기',         location: '한강공원',                  characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 26, title: 'K-드라마 이야기',    location: '소피 방',                   characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 27, title: 'K-POP',              location: '지수 방',                   characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 28, title: 'K-뷰티 쇼핑',        location: '뷰티숍',                    characters: ['emma','sophie','staff'],           is_free: false },
  { episode_num: 29, title: '건강과 운동',         location: '공원',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 30, title: '어디 살아요?',        location: '지하철',                    characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 31, title: '감정 표현',           location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 32, title: '위로하기',            location: '공원 벤치',                 characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 33, title: 'SNS 친구',            location: '카페',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 34, title: '밥 한번 먹어요',      location: '식당',                      characters: ['emma','jisu','minjun'],            is_free: false },
  { episode_num: 35, title: '한국 문화',           location: '한복 체험관',               characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 36, title: '음주 문화',           location: '포장마차',                  characters: ['emma','jisu','minjun'],            is_free: false },
  { episode_num: 37, title: '노래방',              location: '노래방',                    characters: ['emma','jisu','sophie'],            is_free: false },
  { episode_num: 38, title: 'K-댄스',             location: '댄스 스튜디오',             characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 39, title: '카페 공부',           location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 40, title: '문화 적응',           location: '한강',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 41, title: '연결 표현',           location: '학교 앞',                   characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 42, title: '조건과 제안',         location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 43, title: '이유와 비교',         location: '식당',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 44, title: '시간 순서',           location: '공원',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 45, title: '도움 주기',           location: '카페',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 46, title: '기간과 진행',         location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 47, title: '패션',               location: '쇼핑몰',                    characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 48, title: '배달 음식',           location: '소피 방',                   characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 49, title: '여행 계획',           location: '카페',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 50, title: '한국 생활 절반',      location: '한강',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 51, title: '계획 세우기',         location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 52, title: '결심',               location: '공원',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 53, title: '경험 나누기',         location: '식당',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 54, title: '언어 교환',           location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 55, title: '음식 만들기',         location: '지수 집 주방',              characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 56, title: '쇼핑',               location: '동대문 쇼핑몰',             characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 57, title: '카페 알바',           location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 58, title: '병원',               location: '병원',                      characters: ['emma','receptionist','doctor'],    is_free: false },
  { episode_num: 59, title: '독서 카페',           location: '독서 카페',                 characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 60, title: '음식 문화',           location: '식당',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 61, title: '뉘앙스',             location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 62, title: '직장 생활',           location: '카페',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 63, title: 'SNS 트렌드',          location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 64, title: '요리 도전',           location: '에마 방',                   characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 65, title: 'K-뷰티 루틴',        location: '소피 방',                   characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 66, title: '한국어 실력',         location: '공원',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 67, title: '날씨와 계절',         location: '거리',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 68, title: '갈등 해소',           location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 69, title: '목표와 꿈',           location: '한강',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 70, title: '환경과 분리수거',     location: '아파트 앞',                 characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 71, title: '감성 대화',           location: '한강 야경',                 characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 72, title: '갈등과 오해',         location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 73, title: '목표 달성',           location: '카페',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 74, title: '한국 음식 탐험',      location: '광장시장',                  characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 75, title: '일상의 즐거움',       location: '동네 산책',                 characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 76, title: '한국어 고민',         location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 77, title: '친구와 시간',         location: '한강',                      characters: ['emma','jisu','minjun','sophie'],   is_free: false },
  { episode_num: 78, title: '꿈을 향해',           location: '카페',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 79, title: '맛집 탐방',           location: '맛집',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 80, title: '성장을 느끼며',       location: '학교',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 81, title: '간접 전달',           location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 82, title: '자연스러운 변화',     location: '공원',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 83, title: '뉘앙스 심화',         location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 84, title: '신중한 판단',         location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 85, title: '직관과 감각',         location: '식당',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 86, title: '문화 이해',           location: '거리',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 87, title: '솔직한 감정',         location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 88, title: '유창함',             location: '카페',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 89, title: '로컬 여행',           location: '골목 맛집',                 characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 90, title: '트렌드',             location: '카페',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 91, title: '완곡한 표현',         location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 92, title: '논리와 결론',         location: '카페',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 93, title: '깊은 감정',           location: '공원',                      characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 94, title: '깊은 위로',           location: '카페',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 95, title: '드라마 감상',         location: '소피 방',                   characters: ['emma','sophie'],                   is_free: false },
  { episode_num: 96, title: '설명하기 어려운 감정', location: '한강',                     characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 97, title: '이별과 그리움',       location: '공항',                      characters: ['emma','jisu'],                     is_free: false },
  { episode_num: 98, title: '유창함의 완성',       location: '카페',                      characters: ['emma','minjun'],                   is_free: false },
  { episode_num: 99, title: '감사와 관계',         location: '카페',                      characters: ['emma','jisu','minjun','sophie'],   is_free: false },
  { episode_num: 100, title: '한국어 여정의 시작', location: '한강',                      characters: ['emma','jisu','minjun','sophie'],   is_free: false },
]

async function main() {
  console.log('=== STEP 3: kp_episodes UPDATE (EP01-10) + INSERT (EP11-100) ===\n')

  // --- UPDATE EP01-10 ---
  let updateOk = 0, updateErr = 0
  for (const ep of EP_UPDATES) {
    const { error } = await supabase
      .from('kp_episodes')
      .update({ location: ep.location, characters: ep.characters, is_free: ep.is_free })
      .eq('episode_num', ep.episode_num)
    if (error) {
      console.error(`EP${String(ep.episode_num).padStart(2,'0')} UPDATE error:`, error.message)
      updateErr++
    } else {
      updateOk++
    }
  }
  console.log(`UPDATE EP01-10: ${updateOk} ok, ${updateErr} err`)

  // --- INSERT EP11-100 ---
  const { error: insertErr } = await supabase
    .from('kp_episodes')
    .insert(EP_INSERTS)
  if (insertErr) {
    console.error('INSERT EP11-100 error:', insertErr.message)
    // If bulk insert failed, try one by one
    console.log('Retrying one by one...')
    let singleOk = 0, singleErr = 0
    for (const ep of EP_INSERTS) {
      const { error } = await supabase.from('kp_episodes').insert(ep)
      if (error) {
        console.error(`EP${ep.episode_num} insert error:`, error.message)
        singleErr++
      } else {
        singleOk++
      }
    }
    console.log(`INSERT EP11-100 (single): ${singleOk} ok, ${singleErr} err`)
  } else {
    console.log(`INSERT EP11-100: ${EP_INSERTS.length} rows ok`)
  }

  // --- Verify ---
  const { data, error: countErr } = await supabase
    .from('kp_episodes')
    .select('episode_num, title, location, is_free')
    .order('episode_num')
  if (countErr) {
    console.error('Verify error:', countErr.message)
  } else {
    console.log(`\nVerify: total ${data?.length} episodes`)
    const withLocation = data?.filter(e => e.location).length ?? 0
    console.log(`  with location: ${withLocation}`)
    const free = data?.filter(e => e.is_free).length ?? 0
    console.log(`  is_free=true: ${free}`)
    console.log(`  last episode: EP${data?.at(-1)?.episode_num} — ${data?.at(-1)?.title}`)
  }
}

main().catch(console.error)
