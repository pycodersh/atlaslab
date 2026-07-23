import type { Question } from '@/components/kpatto/ChallengeSection'

export const EP002_QUESTIONS: Question[] = [
  {
    type: 'mc',
    prompt: '"How do you ask where the bathroom is?"',
    choices: ['화장실 어디예요?', '화장실 주세요.', '화장실 있어요?', '화장실 얼마예요?'],
    correctIdx: 0,
  },
  {
    type: 'mc',
    prompt: '"How do you say \'I want to go to Myeongdong\'?"',
    choices: ['명동에 가고 싶어요.', '명동 어디예요?', '명동 어떻게 가요?', '명동 좋아요.'],
    correctIdx: 0,
  },
  {
    type: 'mc',
    prompt: '"How do you ask how to get to the airport?"',
    choices: ['공항 어떻게 가요?', '공항 어디예요?', '공항에 가고 싶어요.', '공항 좋아요.'],
    correctIdx: 0,
  },
  {
    type: 'mc',
    prompt: '"How do you say \'Two tickets, please\'?"',
    choices: ['표 두 장 주세요.', '표 어디예요?', '표 두 장 있어요?', '표 어떻게 가요?'],
    correctIdx: 0,
  },
  {
    type: 'build',
    prompt: '"I like Seoul."',
    words: ['서울', '좋아요', '어디예요', '가고 싶어요'],
    answer: ['서울', '좋아요'],
  },
]
