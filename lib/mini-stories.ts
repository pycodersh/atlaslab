import type { Difficulty } from '@/types/pattern'
import type { MiniStoryContent } from '@/types/story'

export const MINI_STORIES: Record<number, Record<Difficulty, MiniStoryContent>> = {

  // Story 1 · I want to / I have to / I don't / I just / I can
  1: {
    normal: {
      en: "I want to rest this weekend, but I have to clean my room first.\n\nI don't have any big plans. I just need some quiet time.\n\nAfter a long week, I can finally relax.",
      ko: "이번 주말엔 쉬고 싶은데, 먼저 방 청소를 해야 해.\n\n특별한 계획은 없어. 그냥 조용한 시간이 필요해.\n\n긴 한 주가 지났으니, 이제 드디어 쉴 수 있어.",
    },
    advanced: {
      en: "I want to spend this weekend completely unplugged from work.\n\nI have to get through Friday's deadline before I let myself breathe. I don't think a quick nap will fix the exhaustion — I need a full two days of nothing.\n\nI just blocked my calendar and turned off all notifications. I can already feel the tension starting to leave my shoulders.",
      ko: "이번 주말만큼은 일에서 완전히 벗어나고 싶어.\n\n그러려면 금요일 마감을 먼저 끝내야 해. 잠깐 낮잠으로는 피로가 안 풀려 — 완전한 이틀 휴식이 필요해.\n\n방금 캘린더를 비우고 알림을 전부 껐어. 벌써 어깨에서 긴장이 풀리는 게 느껴져.",
    },
    native: {
      en: "I want to treat this weekend as a genuine mental reset, not just a pause before Monday hits again.\n\nI have to push through tonight's emails, which requires a level of focus I'm not sure I have left. I don't believe productivity is a virtue in and of itself — rest is part of the work.\n\nI just booked a last-minute cabin with no cell service and immediately felt lighter. I can't say exactly what I need until I stop long enough to hear myself think, but I know this weekend is where I'll find out.",
      ko: "이번 주말을 월요일 전 잠깐의 멈춤이 아닌, 진짜 정신적 재충전의 시간으로 만들고 싶어.\n\n오늘 밤 이메일 더미를 처리해야 하는데, 그럴 집중력이 남아 있을지 솔직히 모르겠어. 나는 생산성 자체가 미덕이라는 생각에 동의하지 않아 — 쉬는 것도 일의 일부야.\n\n막판에 와이파이도 안 터지는 산장을 예약했더니 바로 마음이 가벼워졌어. 멈추기 전까지는 내가 뭘 원하는지 잘 모르겠지만, 이번 주말에 답을 찾을 것 같아.",
    },
  },

  // Story 2 · I'm thinking about / I'm planning to / I'm about to / I'm going to / I'm going to try
  2: {
    normal: {
      en: "I'm thinking about starting a small online store.\n\nI'm planning to sell handmade items at first. I'm about to set up a social media page for it.\n\nI'm going to post photos every week. I'm going to try to make my first sale by this month.",
      ko: "작은 온라인 쇼핑몰을 열까 생각 중이야.\n\n처음엔 수공예품을 팔 계획이야. 이제 막 소셜 미디어 페이지를 만들려고 해.\n\n매주 사진을 올릴 거야. 이번 달 안에 첫 판매를 해보려고 해.",
    },
    advanced: {
      en: "I'm thinking about turning my side project into a real business by the end of the year.\n\nI'm planning to start with digital products to keep costs low. I'm about to publish a landing page that's been half-done for two months.\n\nI'm going to run a small ad campaign this week and track every click. I'm going to try to land my first ten customers before I change the strategy.",
      ko: "연말까지 사이드 프로젝트를 본격적인 사업으로 전환할까 생각 중이야.\n\n비용을 낮추기 위해 디지털 제품부터 시작할 계획이야. 두 달째 반쯤 완성된 채 방치한 랜딩 페이지를 이제 곧 올리려고 해.\n\n이번 주에 소규모 광고를 돌리며 클릭 하나하나를 추적할 거야. 전략을 바꾸기 전에 먼저 첫 고객 열 명을 확보해볼 거야.",
    },
    native: {
      en: "I'm thinking about making the leap from 'person with a side hustle' to 'person running a business' — and the distinction matters more than it sounds.\n\nI'm planning to bootstrap the whole thing rather than chase investors, because I'd rather grow slowly on my own terms. I'm about to hit publish on a product page that terrifies me — which I've decided is a reliable sign I should do it immediately.\n\nI'm going to document every win and failure publicly, because transparency builds trust faster than polished marketing. I'm going to try to stay detached from outcomes early on and treat every piece of negative feedback as the most valuable data I'll collect.",
      ko: "'부업하는 사람'에서 '사업 운영자'로 넘어가는 걸 진지하게 고민 중이야 — 이 둘의 차이는 생각보다 훨씬 커.\n\n투자자를 찾기보다 자력으로 시작할 생각이야. 남의 페이스에 맞춰 빠르게 크는 것보다, 내 방식대로 천천히 성장하는 걸 택하겠어. 솔직히 무서운 제품 페이지를 곧 올리려고 해 — 무서울 때가 바로 해야 할 신호라고 결심했거든.\n\n모든 성공과 실패를 공개적으로 기록할 거야. 잘 포장된 마케팅보다 솔직함이 신뢰를 더 빨리 쌓아준다고 믿으니까. 초반엔 결과에 연연하지 않고, 부정적인 피드백 하나하나를 가장 귀한 데이터로 받아들이려고 해.",
    },
  },

  // Story 3 · Let me / Thank you for / No wonder / Why don't we / Make sure
  3: {
    normal: {
      en: "Let me share my ideas for the new project.\n\nThank you for listening so carefully. No wonder the last plan didn't work — we rushed it.\n\nWhy don't we slow down and plan more carefully this time? Make sure everyone agrees before we move on.",
      ko: "새 프로젝트에 대한 내 아이디어를 공유할게.\n\n이렇게 잘 들어줘서 고마워. 지난 계획이 안 된 건 어쩌면 당연해 — 너무 서둘렀거든.\n\n이번엔 속도를 늦추고 더 꼼꼼하게 계획하는 게 어때? 다음으로 넘어가기 전에 모두가 동의했는지 꼭 확인해.",
    },
    advanced: {
      en: "Let me walk you through the revised proposal before we open the floor for questions.\n\nThank you for the honest pushback last week — it forced us to rethink some shaky assumptions. No wonder the pilot flopped; we skipped user research entirely.\n\nWhy don't we run a focused two-week sprint instead of committing to a full quarter upfront? Make sure the success criteria are agreed upon before anyone writes a line of code.",
      ko: "질문을 받기 전에 수정된 제안서를 먼저 살펴볼게.\n\n지난주에 솔직하게 반론해줘서 고마워 — 덕분에 불안했던 전제들을 다시 검토할 수 있었어. 파일럿이 실패한 건 어찌 보면 당연해. 사용자 조사를 아예 건너뛰었으니까.\n\n처음부터 한 분기를 통으로 맡기는 대신, 집중적인 2주 스프린트로 시작하는 건 어때? 코드 한 줄 쓰기 전에 성공 기준부터 합의해 놔야 해.",
    },
    native: {
      en: "Let me reframe the core problem before we fall into solution mode — I think we've been arguing about the wrong thing.\n\nThank you for flagging the budget issue early; catching it in week one rather than week eight saved us a real headache. No wonder stakeholder buy-in has been thin — we've been presenting outputs without explaining the reasoning behind them.\n\nWhy don't we run a proper retrospective before committing to the next phase, so we're iterating on evidence rather than gut feeling? Make sure whoever facilitates creates a space where the team can say what's actually not working — sanitized retrospectives are just expensive theater.",
      ko: "솔루션 모드로 넘어가기 전에 핵심 문제부터 다시 짚어볼게 — 우리가 엉뚱한 걸 두고 다투고 있었던 것 같아.\n\n예산 문제를 일찍 짚어줘서 고마워. 8주 차가 아닌 1주 차에 잡아낸 덕분에 큰 골치를 덜었어. 이해관계자들의 지지가 약한 건 어쩌면 당연해 — 결과물만 제시하고 그 뒤의 논리는 한 번도 설명하지 않았으니까.\n\n다음 단계에 뛰어들기 전에 제대로 된 회고를 먼저 하는 게 어때? 그래야 감이 아닌 데이터를 바탕으로 개선할 수 있잖아. 진행자는 팀원이 진짜 문제라고 생각하는 걸 솔직히 말할 수 있는 분위기를 만들어야 해 — 겉핥기식 회고는 그냥 돈 낭비야.",
    },
  },

}
