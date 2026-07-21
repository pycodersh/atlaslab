/**
 * K-PATTO UI string dictionary
 *
 * Launch order: 1st EN (complete), 2nd ES+PT, 3rd ZH-CN
 * To add a language: fill in its block below — no code changes needed.
 *
 * Keys are used directly in components via useKPattoUI().
 */

export type KPattoUILang = 'en' | 'es' | 'pt' | 'zh-cn'

export const UI: Record<KPattoUILang, typeof EN> = {
  en: undefined as never,   // filled below
  es: undefined as never,
  pt: undefined as never,
  'zh-cn': undefined as never,
}

// ── English (1차 — complete) ──────────────────────────────────────────────────
const EN = {
  // ── Home ────────────────────────────────────────────────────────────────────
  home_today:           'TODAY',
  home_progress:        'PROGRESS',
  home_quick_access:    'QUICK ACCESS',
  home_start:           'Start Learning →',
  home_stat_episodes:   'Episodes Done',
  home_stat_patterns:   'Patterns',
  home_stat_streak:     'Day Streak',
  home_link_precourse:  'Learn Hangeul (Pre-Course)',
  home_link_stories:    'All Stories',
  home_link_patterns:   'Pattern Library',
  home_link_vocab:      'Vocabulary',

  // ── Pre-course list ──────────────────────────────────────────────────────────
  pc_title:             'PRE-COURSE',
  pc_hero_label:        'Master Hangeul Reading',
  pc_hero_progress:     (done: number, total: number) => `Lesson ${done}/${total} complete`,
  pc_hero_hint:         'Complete Lesson 6 to unlock stories',
  pc_hero_done_heading: 'Hangeul Basics Complete!',
  pc_hero_done_body:    'You can now start the story.',
  pc_hero_done_cta:     'Watch Episode 1 →',
  pc_section_required:  'REQUIRED — must complete to access stories',
  pc_section_optional:  'OPTIONAL — can do alongside stories',
  pc_badge_required:    'REQUIRED',
  pc_badge_optional:    'OPTIONAL',

  // ── Lesson player ────────────────────────────────────────────────────────────
  lp_next:              'Next →',
  lp_start_quiz:        'Start Quiz →',
  lp_done:              'Done!',
  lp_quiz_label:        'QUIZ',
  lp_try_hint:          'Try at least 3 combinations to continue',
  lp_tap_hint:          'Tap to check meaning · 🔊 to hear pronunciation',
  lp_meta_required:     'REQUIRED',
  lp_meta_optional:     'OPTIONAL',

  // ── Lesson complete ──────────────────────────────────────────────────────────
  lc_master:            'Hangeul Master! 🇰🇷',
  lc_passed:            'Lesson Complete!',
  lc_failed:            'Not quite — give it another try!',
  lc_body_unlock:       'You completed Lessons 1–6!\nYou can now read Korean. Start Episode 1!',
  lc_body_passed:       'Great work! Move on to the next lesson.',
  lc_body_failed:       (score: number, total: number) =>
    `${score}/${total} correct — ${total - score} more needed to pass.`,
  lc_cta_story:         '🎬 Start Episode 1',
  lc_cta_next:          'Next Lesson →',
  lc_cta_retry:         'Try Again 🔄',
  lc_cta_list:          'Back to List',

  // ── Stack animation (받침) ───────────────────────────────────────────────────
  sa_add_coda:          'Add Coda ↓',
  sa_hide_coda:         'Hide Coda',
  sa_next_example:      'Next Example',

  // ── Diphthong grid ───────────────────────────────────────────────────────────
  dg_tab_core:          'Core',
  dg_tab_ref:           'Reference',

  // ── Story viewer ─────────────────────────────────────────────────────────────
  sv_ep_complete:       'Episode Complete!',
  sv_patterns_learned:  (n: number) => `${n} pattern${n === 1 ? '' : 's'} learned`,
  sv_back:              'Back to Stories',
  sv_view_progress:     'View Progress',
  sv_welcome_heading:   'Hangeul Basics Complete!',
  sv_welcome_body:      'Now learn Korean through webtoon stories.',
}

// ── Spanish (2차) ─────────────────────────────────────────────────────────────
const ES: typeof EN = {
  home_today:           'HOY',
  home_progress:        'PROGRESO',
  home_quick_access:    'ACCESO RÁPIDO',
  home_start:           'Comenzar →',
  home_stat_episodes:   'Episodios',
  home_stat_patterns:   'Patrones',
  home_stat_streak:     'Días seguidos',
  home_link_precourse:  'Aprender Hangul (Pre-Curso)',
  home_link_stories:    'Todas las historias',
  home_link_patterns:   'Biblioteca de patrones',
  home_link_vocab:      'Vocabulario',

  pc_title:             'PRE-CURSO',
  pc_hero_label:        'Domina la lectura del Hangul',
  pc_hero_progress:     (done, total) => `Lección ${done}/${total} completada`,
  pc_hero_hint:         'Completa la Lección 6 para desbloquear historias',
  pc_hero_done_heading: '¡Hangul básico completo!',
  pc_hero_done_body:    'Ya puedes empezar la historia.',
  pc_hero_done_cta:     'Ver Episodio 1 →',
  pc_section_required:  'OBLIGATORIO — necesario para acceder a las historias',
  pc_section_optional:  'OPCIONAL — se puede hacer junto con las historias',
  pc_badge_required:    'OBLIGATORIO',
  pc_badge_optional:    'OPCIONAL',

  lp_next:              'Siguiente →',
  lp_start_quiz:        'Iniciar examen →',
  lp_done:              '¡Listo!',
  lp_quiz_label:        'EXAMEN',
  lp_try_hint:          'Prueba al menos 3 combinaciones para continuar',
  lp_tap_hint:          'Toca para ver el significado · 🔊 para escuchar',
  lp_meta_required:     'OBLIGATORIO',
  lp_meta_optional:     'OPCIONAL',

  lc_master:            '¡Maestro del Hangul! 🇰🇷',
  lc_passed:            '¡Lección completada!',
  lc_failed:            'Casi — ¡inténtalo de nuevo!',
  lc_body_unlock:       '¡Completaste las Lecciones 1–6!\nYa puedes leer coreano. ¡Empieza el Episodio 1!',
  lc_body_passed:       '¡Buen trabajo! Pasa a la siguiente lección.',
  lc_body_failed:       (score, total) =>
    `${score}/${total} correctas — necesitas ${total - score} más para pasar.`,
  lc_cta_story:         '🎬 Empezar Episodio 1',
  lc_cta_next:          'Siguiente lección →',
  lc_cta_retry:         'Intentar de nuevo 🔄',
  lc_cta_list:          'Volver a la lista',

  sa_add_coda:          'Añadir coda ↓',
  sa_hide_coda:         'Ocultar coda',
  sa_next_example:      'Siguiente ejemplo',

  dg_tab_core:          'Principales',
  dg_tab_ref:           'Referencia',

  sv_ep_complete:       '¡Episodio completo!',
  sv_patterns_learned:  (n) => `${n} patrón${n === 1 ? '' : 'es'} aprendido${n === 1 ? '' : 's'}`,
  sv_back:              'Volver a historias',
  sv_view_progress:     'Ver progreso',
  sv_welcome_heading:   '¡Hangul básico completo!',
  sv_welcome_body:      'Ahora aprende coreano con historias de webtoon.',
}

// ── Portuguese (2차) ──────────────────────────────────────────────────────────
const PT: typeof EN = {
  home_today:           'HOJE',
  home_progress:        'PROGRESSO',
  home_quick_access:    'ACESSO RÁPIDO',
  home_start:           'Começar →',
  home_stat_episodes:   'Episódios',
  home_stat_patterns:   'Padrões',
  home_stat_streak:     'Dias seguidos',
  home_link_precourse:  'Aprender Hangul (Pré-Curso)',
  home_link_stories:    'Todas as histórias',
  home_link_patterns:   'Biblioteca de padrões',
  home_link_vocab:      'Vocabulário',

  pc_title:             'PRÉ-CURSO',
  pc_hero_label:        'Domine a leitura do Hangul',
  pc_hero_progress:     (done, total) => `Lição ${done}/${total} concluída`,
  pc_hero_hint:         'Complete a Lição 6 para desbloquear as histórias',
  pc_hero_done_heading: 'Hangul básico concluído!',
  pc_hero_done_body:    'Agora você pode começar a história.',
  pc_hero_done_cta:     'Ver Episódio 1 →',
  pc_section_required:  'OBRIGATÓRIO — necessário para acessar as histórias',
  pc_section_optional:  'OPCIONAL — pode ser feito junto com as histórias',
  pc_badge_required:    'OBRIGATÓRIO',
  pc_badge_optional:    'OPCIONAL',

  lp_next:              'Próximo →',
  lp_start_quiz:        'Iniciar quiz →',
  lp_done:              'Pronto!',
  lp_quiz_label:        'QUIZ',
  lp_try_hint:          'Tente pelo menos 3 combinações para continuar',
  lp_tap_hint:          'Toque para ver o significado · 🔊 para ouvir',
  lp_meta_required:     'OBRIGATÓRIO',
  lp_meta_optional:     'OPCIONAL',

  lc_master:            'Mestre do Hangul! 🇰🇷',
  lc_passed:            'Lição concluída!',
  lc_failed:            'Quase lá — tente novamente!',
  lc_body_unlock:       'Você concluiu as Lições 1–6!\nAgora você sabe ler coreano. Comece o Episódio 1!',
  lc_body_passed:       'Ótimo trabalho! Siga para a próxima lição.',
  lc_body_failed:       (score, total) =>
    `${score}/${total} corretas — você precisa de mais ${total - score} para passar.`,
  lc_cta_story:         '🎬 Começar Episódio 1',
  lc_cta_next:          'Próxima lição →',
  lc_cta_retry:         'Tentar novamente 🔄',
  lc_cta_list:          'Voltar à lista',

  sa_add_coda:          'Adicionar coda ↓',
  sa_hide_coda:         'Ocultar coda',
  sa_next_example:      'Próximo exemplo',

  dg_tab_core:          'Principais',
  dg_tab_ref:           'Referência',

  sv_ep_complete:       'Episódio concluído!',
  sv_patterns_learned:  (n) => `${n} padrão${n === 1 ? '' : 'ões'} aprendido${n === 1 ? '' : 's'}`,
  sv_back:              'Voltar às histórias',
  sv_view_progress:     'Ver progresso',
  sv_welcome_heading:   'Hangul básico concluído!',
  sv_welcome_body:      'Agora aprenda coreano com histórias de webtoon.',
}

// ── Chinese Simplified (3차) ──────────────────────────────────────────────────
const ZH: typeof EN = {
  home_today:           '今日',
  home_progress:        '进度',
  home_quick_access:    '快速访问',
  home_start:           '开始学习 →',
  home_stat_episodes:   '已完成集数',
  home_stat_patterns:   '句型',
  home_stat_streak:     '连续天数',
  home_link_precourse:  '学习韩文字母（预备课程）',
  home_link_stories:    '所有故事',
  home_link_patterns:   '句型库',
  home_link_vocab:      '词汇',

  pc_title:             '预备课程',
  pc_hero_label:        '掌握韩文字母阅读',
  pc_hero_progress:     (done, total) => `已完成第 ${done}/${total} 课`,
  pc_hero_hint:         '完成第6课后即可解锁故事',
  pc_hero_done_heading: '韩文字母基础完成！',
  pc_hero_done_body:    '现在可以开始故事了。',
  pc_hero_done_cta:     '观看第1集 →',
  pc_section_required:  '必修 — 进入故事前必须完成',
  pc_section_optional:  '选修 — 可与故事同步进行',
  pc_badge_required:    '必修',
  pc_badge_optional:    '选修',

  lp_next:              '下一步 →',
  lp_start_quiz:        '开始测验 →',
  lp_done:              '完成！',
  lp_quiz_label:        '测验',
  lp_try_hint:          '请至少尝试3种组合才能继续',
  lp_tap_hint:          '点击查看含义 · 🔊 收听发音',
  lp_meta_required:     '必修',
  lp_meta_optional:     '选修',

  lc_master:            '韩文字母大师！🇰🇷',
  lc_passed:            '课程完成！',
  lc_failed:            '差一点 — 再试一次吧！',
  lc_body_unlock:       '你完成了第1–6课！\n现在你可以读韩文了。开始第1集吧！',
  lc_body_passed:       '干得好！继续下一课。',
  lc_body_failed:       (score, total) =>
    `${score}/${total} 题正确 — 还需要 ${total - score} 题才能通过。`,
  lc_cta_story:         '🎬 开始第1集',
  lc_cta_next:          '下一课 →',
  lc_cta_retry:         '再试一次 🔄',
  lc_cta_list:          '返回列表',

  sa_add_coda:          '添加尾音 ↓',
  sa_hide_coda:         '隐藏尾音',
  sa_next_example:      '下一个示例',

  dg_tab_core:          '核心',
  dg_tab_ref:           '参考',

  sv_ep_complete:       '集数完成！',
  sv_patterns_learned:  (n) => `已学习 ${n} 个句型`,
  sv_back:              '返回故事',
  sv_view_progress:     '查看进度',
  sv_welcome_heading:   '韩文字母基础完成！',
  sv_welcome_body:      '现在通过漫画故事学习韩语。',
}

UI.en = EN
UI.es = ES
UI.pt = PT
UI['zh-cn'] = ZH

// ── Hook helper ───────────────────────────────────────────────────────────────
// Maps PATTO's Language pref to the closest supported KPattoUILang
export function resolveUILang(pattoLang: string | undefined): KPattoUILang {
  switch (pattoLang) {
    case 'es':    return 'es'
    case 'pt':    return 'pt'
    case 'zh-cn':
    case 'zh-tw': return 'zh-cn'
    default:      return 'en'
  }
}

export function getUI(pattoLang: string | undefined) {
  return UI[resolveUILang(pattoLang)]
}
