// K-PATTO UI string dictionary
// 1차 런칭: EN (complete) | 2차: JA | 3차: ES

export type KPattoUILang = 'en' | 'ja' | 'es'

const EN = {
  home_today: 'TODAY',
  home_progress: 'PROGRESS',
  home_quick_access: 'QUICK ACCESS',
  home_start: 'Start Learning →',
  home_stat_episodes: 'Episodes Done',
  home_stat_patterns: 'Patterns',
  home_stat_streak: 'Day Streak',
  home_link_precourse: 'Learn Hangeul (Pre-Course)',
  home_link_stories: 'All Stories',
  home_link_patterns: 'Pattern Library',
  home_link_vocab: 'Vocabulary',

  pc_title: 'PRE-COURSE',
  pc_hero_label: 'Master Hangeul Reading',
  pc_hero_progress: (done: number, total: number) => `Lesson ${done}/${total} complete`,
  pc_hero_hint: 'Complete Lesson 6 to unlock stories',
  pc_hero_done_heading: 'Hangeul Basics Complete!',
  pc_hero_done_body: 'You can now start the story.',
  pc_hero_done_cta: 'Watch Episode 1 →',
  pc_section_required: 'REQUIRED — must complete to access stories',
  pc_section_optional: 'OPTIONAL — can do alongside stories',
  pc_badge_required: 'REQUIRED',
  pc_badge_optional: 'OPTIONAL',

  lp_next: 'Next →',
  lp_start_quiz: 'Start Quiz →',
  lp_done: 'Done!',
  lp_quiz_label: 'QUIZ',
  lp_try_hint: 'Try at least 3 combinations to continue',
  lp_tap_hint: 'Tap to check meaning · 🔊 to hear pronunciation',
  lp_meta_required: 'REQUIRED',
  lp_meta_optional: 'OPTIONAL',

  lc_master: 'Hangeul Master! 🇰🇷',
  lc_passed: 'Lesson Complete!',
  lc_failed: 'Not quite — give it another try!',
  lc_body_unlock: 'You completed Lessons 1–6!\nYou can now read Korean. Start Episode 1!',
  lc_body_passed: 'Great work! Move on to the next lesson.',
  lc_body_failed: (score: number, total: number) => `${score}/${total} correct — ${total - score} more needed to pass.`,
  lc_cta_story: '🎬 Start Episode 1',
  lc_cta_next: 'Next Lesson →',
  lc_cta_retry: 'Try Again 🔄',
  lc_cta_list: 'Back to List',

  sa_add_coda: 'Add Coda ↓',
  sa_hide_coda: 'Hide Coda',
  sa_next_example: 'Next Example',

  dg_tab_core: 'Core',
  dg_tab_ref: 'Reference',

  sv_ep_complete: 'Episode Complete!',
  sv_patterns_learned: (n: number) => `${n} pattern${n === 1 ? '' : 's'} learned`,
  sv_back: 'Back to Stories',
  sv_view_progress: 'View Progress',
  sv_welcome_heading: 'Hangeul Basics Complete!',
  sv_welcome_body: 'Now learn Korean through webtoon stories.',
}

const JA: typeof EN = {
  home_today: '今日の学習',
  home_progress: '進捗',
  home_quick_access: 'クイックアクセス',
  home_start: '学習を始める →',
  home_stat_episodes: '完了エピソード',
  home_stat_patterns: 'パターン',
  home_stat_streak: '連続学習日',
  home_link_precourse: 'ハングルを学ぶ（プレコース）',
  home_link_stories: 'すべてのストーリー',
  home_link_patterns: 'パターンライブラリ',
  home_link_vocab: '単語一覧',

  pc_title: 'プレコース',
  pc_hero_label: 'ハングルの読み方をマスター',
  pc_hero_progress: (done: number, total: number) => `レッスン ${done}/${total} 完了`,
  pc_hero_hint: 'レッスン6を完了するとストーリーが解放されます',
  pc_hero_done_heading: 'ハングル基礎完了！',
  pc_hero_done_body: 'ストーリーを始めることができます。',
  pc_hero_done_cta: 'エピソード1を見る →',
  pc_section_required: '必須 — ストーリー開放に必要',
  pc_section_optional: '任意 — ストーリーと並行して学習可能',
  pc_badge_required: '必須',
  pc_badge_optional: '任意',

  lp_next: '次へ →',
  lp_start_quiz: 'クイズを始める →',
  lp_done: '完了！',
  lp_quiz_label: 'クイズ',
  lp_try_hint: '3回以上組み合わせて続けてください',
  lp_tap_hint: 'タップして意味を確認 · 🔊 で発音を聞く',
  lp_meta_required: '必須',
  lp_meta_optional: '任意',

  lc_master: 'ハングルマスター！🇰🇷',
  lc_passed: 'レッスン完了！',
  lc_failed: 'もう一度挑戦しましょう！',
  lc_body_unlock: 'レッスン1〜6を完了しました！\n韓国語が読めるようになりました。エピソード1を始めましょう！',
  lc_body_passed: 'よくできました！次のレッスンへ進みましょう。',
  lc_body_failed: (score: number, total: number) => `${score}/${total}正解 — あと${total - score}問必要です。`,
  lc_cta_story: '🎬 エピソード1を始める',
  lc_cta_next: '次のレッスン →',
  lc_cta_retry: 'もう一度 🔄',
  lc_cta_list: 'リストに戻る',

  sa_add_coda: '終声を追加 ↓',
  sa_hide_coda: '終声を隠す',
  sa_next_example: '次の例',

  dg_tab_core: '基本',
  dg_tab_ref: '参考',

  sv_ep_complete: 'エピソード完了！',
  sv_patterns_learned: (n: number) => `${n}個のパターンを学習しました`,
  sv_back: 'ストーリー一覧へ',
  sv_view_progress: '進捗を見る',
  sv_welcome_heading: 'ハングル基礎完了！',
  sv_welcome_body: 'ウェブトゥーンで韓国語を学びましょう。',
}

const ES: typeof EN = {
  home_today: 'HOY',
  home_progress: 'PROGRESO',
  home_quick_access: 'ACCESO RÁPIDO',
  home_start: 'Empezar a aprender →',
  home_stat_episodes: 'Episodios completados',
  home_stat_patterns: 'Patrones',
  home_stat_streak: 'Días seguidos',
  home_link_precourse: 'Aprender Hangeul (Pre-Curso)',
  home_link_stories: 'Todas las historias',
  home_link_patterns: 'Biblioteca de patrones',
  home_link_vocab: 'Vocabulario',

  pc_title: 'PRE-CURSO',
  pc_hero_label: 'Domina la lectura del Hangeul',
  pc_hero_progress: (done: number, total: number) => `Lección ${done}/${total} completada`,
  pc_hero_hint: 'Completa la Lección 6 para desbloquear historias',
  pc_hero_done_heading: '¡Básico del Hangeul completado!',
  pc_hero_done_body: 'Ya puedes empezar la historia.',
  pc_hero_done_cta: 'Ver Episodio 1 →',
  pc_section_required: 'OBLIGATORIO — necesario para acceder a historias',
  pc_section_optional: 'OPCIONAL — se puede hacer junto a las historias',
  pc_badge_required: 'OBLIGATORIO',
  pc_badge_optional: 'OPCIONAL',

  lp_next: 'Siguiente →',
  lp_start_quiz: 'Comenzar quiz →',
  lp_done: '¡Hecho!',
  lp_quiz_label: 'QUIZ',
  lp_try_hint: 'Prueba al menos 3 combinaciones para continuar',
  lp_tap_hint: 'Toca para ver el significado · 🔊 para escuchar',
  lp_meta_required: 'OBLIGATORIO',
  lp_meta_optional: 'OPCIONAL',

  lc_master: '¡Maestro del Hangeul! 🇰🇷',
  lc_passed: '¡Lección completada!',
  lc_failed: '¡Casi! — inténtalo de nuevo.',
  lc_body_unlock: '¡Completaste las Lecciones 1–6!\nYa puedes leer coreano. ¡Empieza el Episodio 1!',
  lc_body_passed: '¡Buen trabajo! Continúa con la siguiente lección.',
  lc_body_failed: (score: number, total: number) => `${score}/${total} correctas — necesitas ${total - score} más para aprobar.`,
  lc_cta_story: '🎬 Empezar Episodio 1',
  lc_cta_next: 'Siguiente lección →',
  lc_cta_retry: 'Intentar de nuevo 🔄',
  lc_cta_list: 'Volver a la lista',

  sa_add_coda: 'Agregar consonante final ↓',
  sa_hide_coda: 'Ocultar consonante final',
  sa_next_example: 'Siguiente ejemplo',

  dg_tab_core: 'Principal',
  dg_tab_ref: 'Referencia',

  sv_ep_complete: '¡Episodio completo!',
  sv_patterns_learned: (n: number) => `${n} patrón${n === 1 ? '' : 'es'} aprendido${n === 1 ? '' : 's'}`,
  sv_back: 'Volver a historias',
  sv_view_progress: 'Ver progreso',
  sv_welcome_heading: '¡Básico del Hangeul completado!',
  sv_welcome_body: 'Ahora aprende coreano a través de historias de webtoon.',
}

export const UI: Record<KPattoUILang, typeof EN> = { en: EN, ja: JA, es: ES }

export function resolveUILang(pattoLang: string | undefined): KPattoUILang {
  switch (pattoLang) {
    case 'ja': return 'ja'
    case 'es': return 'es'
    default: return 'en'
  }
}

export function getUI(pattoLang: string | undefined): typeof EN {
  return UI[resolveUILang(pattoLang)]
}
