// ── PATTO Legal Content (Terms & Privacy) ──────────────────────────────────────
// 각 언어별 전체 법적 문서 내용.
// 번역이 없는 언어는 한국어('ko')로 폴백됩니다.
// 새 언어 번역 추가: TERMS 또는 PRIVACY 객체에 해당 AppLang 키를 추가하세요.

import type { AppLang } from '@/lib/settings/preferences'

export type LegalSection = { title: string; body: string }
export type LegalDoc = {
  title: string
  updated: string
  sections: LegalSection[]
}

// ── Terms of Service ───────────────────────────────────────────────────────────

export const TERMS: Partial<Record<AppLang, LegalDoc>> = {
  ko: {
    title: '이용약관',
    updated: '최종 업데이트: 2026년 6월 25일',
    sections: [
      {
        title: '1. 서비스 소개',
        body: `PATTO(이하 "서비스")는 매거진 스타일의 영어 스토리와 패턴 학습을 통해 자연스러운 영어 실력을 키울 수 있도록 돕는 모바일 및 웹 애플리케이션입니다. 서비스는 PATTO Inc.가 운영하며 전 세계 사용자에게 제공됩니다.\n\n서비스에 접속하거나 이용함으로써 본 이용약관에 동의하는 것으로 간주합니다. 동의하지 않는 경우 서비스를 이용하지 마십시오.`,
      },
      {
        title: '2. 사용자 책임',
        body: `사용자는 관련 법령을 준수하며 본 약관에 따라 PATTO를 이용해야 합니다. 다음 행위는 금지됩니다.\n\n• 관련 법령을 위반하는 방식으로 서비스를 이용하는 행위\n• 서비스의 일부에 무단 접근을 시도하는 행위\n• 서면 허가 없이 콘텐츠를 복제·배포하거나 2차 저작물을 제작하는 행위\n• 자동화 도구를 이용해 콘텐츠를 수집하거나 크롤링하는 행위\n• 서비스의 운영을 방해하거나 성능에 지장을 주는 행위`,
      },
      {
        title: '3. 구독 정책',
        body: `PATTO는 무료 플랜과 프리미엄 구독 플랜을 제공합니다. 프리미엄 구독은 구매 시 선택한 월간 또는 연간 주기로 청구됩니다.\n\n구독은 현재 결제 기간 종료 최소 24시간 전에 해지하지 않으면 자동 갱신됩니다. 계정 설정에서 언제든지 구독을 해지할 수 있습니다. 환불은 관련 소비자 보호법에 따라 당사의 재량으로 처리됩니다.\n\n가격은 30일 전 사전 공지 후 변경될 수 있으며, 변경 후 서비스를 계속 이용하면 새로운 가격에 동의한 것으로 간주합니다.`,
      },
      {
        title: '4. 지식재산권',
        body: `스토리, 패턴, 삽화, 오디오, 소프트웨어를 포함한 PATTO 내 모든 콘텐츠는 PATTO Inc. 또는 라이선서의 소유이며 저작권법 및 기타 지식재산권 관련 법령에 의해 보호됩니다.\n\n사용자는 개인적·비상업적 목적으로 콘텐츠에 접근·이용할 수 있는 제한적이고 비독점적인 라이선스를 부여받습니다. 이 라이선스는 사전 서면 동의 없이 콘텐츠를 복제·배포하거나 2차 저작물을 제작할 권리를 포함하지 않습니다.`,
      },
      {
        title: '5. 책임 제한',
        body: `관련 법령이 허용하는 최대 범위 내에서, PATTO Inc.는 서비스 이용 또는 이용 불가로 인해 발생하는 이익 손실, 데이터 손실, 영업권 손실 등 간접적·부수적·특별·결과적 손해에 대해 책임을 지지 않습니다.\n\n서비스는 명시적 또는 묵시적 보증 없이 "있는 그대로", "제공 가능한 상태로" 제공됩니다. 당사는 서비스가 중단 없이, 오류 없이, 또는 유해한 요소 없이 운영될 것을 보증하지 않습니다.`,
      },
      {
        title: '6. 계정 해지',
        body: `당사는 사용자가 본 약관을 위반하거나 서비스 또는 다른 사용자에게 해롭다고 판단하는 행동을 하는 경우, 단독 재량으로 계정을 정지 또는 해지할 수 있습니다.\n\n사용자는 계정 설정에서 언제든지 계정을 삭제할 수 있습니다. 계정 삭제 시 개인정보는 개인정보처리방침에 따라 법적 보관 의무 범위 내에서 처리됩니다.`,
      },
      {
        title: '7. 문의',
        body: `이용약관에 관한 문의는 아래로 연락주시기 바랍니다.\n\n이메일: legal@patto.app\n주소: PATTO Inc., 대한민국 서울\n\n본 이용약관은 2026년 6월 25일에 최종 업데이트되었습니다.`,
      },
    ],
  },

  en: {
    title: 'Terms of Service',
    updated: 'Last updated: June 25, 2026',
    sections: [
      {
        title: '1. About the Service',
        body: `PATTO ("Service") is a mobile and web application that helps you build natural English skills through magazine-style stories and pattern learning. The Service is operated by PATTO Inc. and is available to users worldwide.\n\nBy accessing or using the Service, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.`,
      },
      {
        title: '2. User Responsibilities',
        body: `You must use PATTO in compliance with applicable laws and in accordance with these Terms. The following actions are prohibited:\n\n• Using the Service in any way that violates applicable laws\n• Attempting unauthorized access to any part of the Service\n• Reproducing, distributing, or creating derivative works without written permission\n• Using automated tools to scrape or crawl content\n• Interfering with or degrading the performance of the Service`,
      },
      {
        title: '3. Subscription Policy',
        body: `PATTO offers a free plan and a premium subscription plan. Premium subscriptions are billed on a monthly or annual basis as selected at the time of purchase.\n\nSubscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period. You may cancel your subscription at any time in your account settings. Refunds are handled at our discretion in accordance with applicable consumer protection laws.\n\nPrices may change with 30 days' advance notice. Continued use of the Service after a price change constitutes acceptance of the new price.`,
      },
      {
        title: '4. Intellectual Property',
        body: `All content within PATTO — including stories, patterns, illustrations, audio, and software — is owned by PATTO Inc. or its licensors and is protected by copyright and other intellectual property laws.\n\nYou are granted a limited, non-exclusive license to access and use the content for personal, non-commercial purposes. This license does not include the right to reproduce, distribute, or create derivative works without prior written consent.`,
      },
      {
        title: '5. Limitation of Liability',
        body: `To the maximum extent permitted by applicable law, PATTO Inc. shall not be liable for any indirect, incidental, special, or consequential damages — including loss of profits, data, or goodwill — arising from your use of or inability to use the Service.\n\nThe Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or free from harmful components.`,
      },
      {
        title: '6. Account Termination',
        body: `We may suspend or terminate your account at our sole discretion if you violate these Terms or engage in behavior we determine to be harmful to the Service or other users.\n\nYou may delete your account at any time in your account settings. Upon deletion, your personal information will be handled in accordance with our Privacy Policy, subject to legal retention requirements.`,
      },
      {
        title: '7. Contact',
        body: `For inquiries regarding these Terms of Service, please contact us:\n\nEmail: legal@patto.app\nAddress: PATTO Inc., Seoul, South Korea\n\nThese Terms of Service were last updated on June 25, 2026.`,
      },
    ],
  },

  es: {
    title: 'Términos de Servicio',
    updated: 'Última actualización: 25 de junio de 2026',
    sections: [
      {
        title: '1. Sobre el servicio',
        body: `PATTO ("Servicio") es una aplicación móvil y web que te ayuda a desarrollar habilidades naturales en inglés mediante historias de estilo editorial y aprendizaje de patrones. El Servicio es operado por PATTO Inc. y está disponible para usuarios de todo el mundo.\n\nAl acceder o usar el Servicio, aceptas estos Términos de Servicio. Si no estás de acuerdo, no uses el Servicio.`,
      },
      {
        title: '2. Responsabilidades del usuario',
        body: `Debes usar PATTO de conformidad con las leyes aplicables y de acuerdo con estos Términos. Las siguientes acciones están prohibidas:\n\n• Usar el Servicio de manera que infrinja las leyes aplicables\n• Intentar acceso no autorizado a cualquier parte del Servicio\n• Reproducir, distribuir o crear obras derivadas sin permiso escrito\n• Usar herramientas automatizadas para extraer o rastrear contenido\n• Interferir con el rendimiento del Servicio`,
      },
      {
        title: '3. Política de suscripción',
        body: `PATTO ofrece un plan gratuito y un plan de suscripción premium con facturación mensual o anual. Las suscripciones se renuevan automáticamente a menos que se cancelen al menos 24 horas antes del final del período de facturación.\n\nPuedes cancelar en cualquier momento desde la configuración de tu cuenta. Los reembolsos se gestionan a nuestra discreción conforme a las leyes de protección al consumidor aplicables.`,
      },
      {
        title: '4. Propiedad intelectual',
        body: `Todo el contenido de PATTO — incluyendo historias, patrones, ilustraciones, audio y software — es propiedad de PATTO Inc. o sus licenciantes, protegido por leyes de derechos de autor.\n\nSe te otorga una licencia limitada y no exclusiva para acceder y usar el contenido con fines personales y no comerciales. Esta licencia no incluye el derecho de reproducir, distribuir o crear obras derivadas sin consentimiento previo por escrito.`,
      },
      {
        title: '5. Limitación de responsabilidad',
        body: `En la máxima medida permitida por la ley, PATTO Inc. no será responsable de daños indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de uso del Servicio.\n\nEl Servicio se proporciona "tal cual" y "según disponibilidad" sin garantías de ningún tipo.`,
      },
      {
        title: '6. Cancelación de cuenta',
        body: `Podemos suspender o cancelar tu cuenta a nuestra discreción si incumples estos Términos. Puedes eliminar tu cuenta en cualquier momento desde la configuración. Al eliminarla, tu información personal se tratará conforme a nuestra Política de Privacidad.`,
      },
      {
        title: '7. Contacto',
        body: `Para consultas sobre estos Términos:\n\nCorreo: legal@patto.app\nDirección: PATTO Inc., Seúl, Corea del Sur\n\nÚltima actualización: 25 de junio de 2026.`,
      },
    ],
  },

  ja: {
    title: '利用規約',
    updated: '最終更新日：2026年6月25日',
    sections: [
      {
        title: '1. サービスについて',
        body: `PATTO（以下「サービス」）は、マガジン形式の英語ストーリーとパターン学習を通じて自然な英語力を伸ばすモバイル・Webアプリです。PATTO Inc.が運営し、世界中のユーザーに提供されます。\n\nサービスを利用することで、本利用規約に同意したものとみなします。同意されない場合はご利用をお控えください。`,
      },
      {
        title: '2. ユーザーの責任',
        body: `PATTOは適用法令を遵守し、本規約に従ってご利用ください。以下の行為は禁止されています。\n\n• 適用法令に違反する方法でサービスを利用すること\n• サービスへの不正アクセスを試みること\n• 書面による許可なくコンテンツを複製・配布・二次利用すること\n• 自動化ツールによるコンテンツ収集・クローリング\n• サービスの運営を妨害・阻害する行為`,
      },
      {
        title: '3. サブスクリプションポリシー',
        body: `PATTOは無料プランとプレミアムサブスクリプションプランを提供しています。プレミアムサブスクリプションは月額または年額で請求されます。\n\nサブスクリプションは、現在の請求期間終了の少なくとも24時間前にキャンセルしない限り自動更新されます。アカウント設定からいつでもキャンセルできます。返金は適用される消費者保護法に従い当社の裁量で対応します。`,
      },
      {
        title: '4. 知的財産権',
        body: `ストーリー、パターン、イラスト、音声、ソフトウェアを含むPATTO内の全コンテンツはPATTO Inc.またはライセンサーの所有物であり、著作権法により保護されています。\n\n個人的・非商業的目的に限り、コンテンツへのアクセス・利用の限定的・非独占的ライセンスが付与されます。書面による事前同意なしに複製・配布・二次利用することはできません。`,
      },
      {
        title: '5. 責任の制限',
        body: `適用法令が許容する最大範囲において、PATTO Inc.はサービスの利用または利用不能により生じる間接的・付随的・特別・結果的損害に対して責任を負いません。\n\nサービスは明示または黙示の保証なく「現状のまま」「提供可能な状態で」提供されます。`,
      },
      {
        title: '6. アカウントの解約',
        body: `本規約に違反した場合、当社の独自の裁量でアカウントを停止または解約することができます。\n\nアカウント設定からいつでもアカウントを削除できます。削除時の個人情報はプライバシーポリシーに従い処理されます。`,
      },
      {
        title: '7. お問い合わせ',
        body: `利用規約に関するお問い合わせは下記までご連絡ください。\n\nメール：legal@patto.app\n住所：PATTO Inc.、大韓民国ソウル\n\n本利用規約は2026年6月25日に最終更新されました。`,
      },
    ],
  },

  'zh-cn': {
    title: '服务条款',
    updated: '最后更新：2026年6月25日',
    sections: [
      {
        title: '1. 服务介绍',
        body: `PATTO（以下简称"服务"）是一款通过杂志风格英语故事和句型学习帮助您提升自然英语能力的移动和网页应用程序。本服务由PATTO Inc.运营，面向全球用户提供。\n\n访问或使用本服务即表示您同意本服务条款。如不同意，请勿使用本服务。`,
      },
      {
        title: '2. 用户责任',
        body: `您必须遵守适用法律法规并按照本条款使用PATTO。以下行为被禁止：\n\n• 以违反适用法律的方式使用本服务\n• 尝试未经授权访问服务的任何部分\n• 未经书面许可复制、分发或创作衍生作品\n• 使用自动化工具抓取或爬取内容\n• 干扰或降低服务性能`,
      },
      {
        title: '3. 订阅政策',
        body: `PATTO提供免费套餐和高级订阅套餐，按月或按年计费。订阅将自动续费，除非在当前计费周期结束前至少24小时取消。\n\n您可以随时在账户设置中取消订阅。退款将根据适用消费者保护法律由我方酌情处理。`,
      },
      {
        title: '4. 知识产权',
        body: `PATTO内所有内容（包括故事、句型、插图、音频和软件）均属PATTO Inc.或其许可方所有，受版权法保护。\n\n您获得有限、非独家的许可，可出于个人非商业目的访问和使用内容。未经事先书面同意，不得复制、分发或创作衍生作品。`,
      },
      {
        title: '5. 责任限制',
        body: `在适用法律允许的最大范围内，PATTO Inc.不对因使用或无法使用服务而造成的任何间接、附带、特殊或后果性损害负责。\n\n本服务按"现状"和"可用状态"提供，不附带任何明示或暗示的保证。`,
      },
      {
        title: '6. 账户终止',
        body: `若您违反本条款，我们可自行决定暂停或终止您的账户。您可随时在账户设置中删除账户。删除后，您的个人信息将根据我们的隐私政策处理。`,
      },
      {
        title: '7. 联系方式',
        body: `如需咨询服务条款相关事宜，请联系：\n\n邮箱：legal@patto.app\n地址：PATTO Inc.，韩国首尔\n\n本服务条款于2026年6月25日最后更新。`,
      },
    ],
  },

  fr: {
    title: 'Conditions d\'utilisation',
    updated: 'Dernière mise à jour : 25 juin 2026',
    sections: [
      {
        title: '1. À propos du service',
        body: `PATTO (« Service ») est une application mobile et web qui vous aide à développer des compétences naturelles en anglais grâce à des histoires de style magazine et à l'apprentissage de structures linguistiques. Le Service est exploité par PATTO Inc. et disponible pour les utilisateurs du monde entier.\n\nEn accédant au Service ou en l'utilisant, vous acceptez ces Conditions d'utilisation. Si vous n'êtes pas d'accord, veuillez ne pas utiliser le Service.`,
      },
      {
        title: '2. Responsabilités de l\'utilisateur',
        body: `Vous devez utiliser PATTO en conformité avec les lois applicables. Les actions suivantes sont interdites :\n\n• Utiliser le Service en violation des lois applicables\n• Tenter d'accéder de manière non autorisée à toute partie du Service\n• Reproduire, distribuer ou créer des œuvres dérivées sans autorisation écrite\n• Utiliser des outils automatisés pour extraire du contenu\n• Interférer avec les performances du Service`,
      },
      {
        title: '3. Politique d\'abonnement',
        body: `PATTO propose un plan gratuit et un abonnement premium facturé mensuellement ou annuellement. Les abonnements se renouvellent automatiquement sauf annulation au moins 24 heures avant la fin de la période de facturation.\n\nVous pouvez annuler à tout moment depuis les paramètres de votre compte.`,
      },
      {
        title: '4. Propriété intellectuelle',
        body: `Tout le contenu de PATTO — histoires, structures, illustrations, audio et logiciels — appartient à PATTO Inc. ou à ses concédants et est protégé par les lois sur le droit d'auteur.\n\nVous bénéficiez d'une licence limitée et non exclusive pour accéder au contenu à des fins personnelles et non commerciales.`,
      },
      {
        title: '5. Limitation de responsabilité',
        body: `Dans toute la mesure permise par la loi, PATTO Inc. ne sera pas responsable des dommages indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation du Service.\n\nLe Service est fourni « tel quel » sans garanties d'aucune sorte.`,
      },
      {
        title: '6. Résiliation du compte',
        body: `Nous pouvons suspendre ou résilier votre compte à notre seule discrétion si vous enfreignez ces Conditions. Vous pouvez supprimer votre compte à tout moment depuis les paramètres.`,
      },
      {
        title: '7. Contact',
        body: `Pour toute question concernant ces Conditions :\n\nEmail : legal@patto.app\nAdresse : PATTO Inc., Séoul, Corée du Sud\n\nCes Conditions ont été mises à jour le 25 juin 2026.`,
      },
    ],
  },

  de: {
    title: 'Nutzungsbedingungen',
    updated: 'Zuletzt aktualisiert: 25. Juni 2026',
    sections: [
      {
        title: '1. Über den Dienst',
        body: `PATTO („Dienst") ist eine mobile und Web-App, die Ihnen hilft, natürliche Englischkenntnisse durch magazinartige Geschichten und Musterlernmethoden zu entwickeln. Der Dienst wird von PATTO Inc. betrieben und steht Nutzern weltweit zur Verfügung.\n\nDurch die Nutzung des Dienstes erklären Sie sich mit diesen Nutzungsbedingungen einverstanden.`,
      },
      {
        title: '2. Nutzerpflichten',
        body: `Sie müssen PATTO in Übereinstimmung mit geltendem Recht nutzen. Folgende Handlungen sind verboten:\n\n• Nutzung des Dienstes unter Verstoß gegen geltende Gesetze\n• Unbefugter Zugriff auf Teile des Dienstes\n• Vervielfältigung oder Verbreitung von Inhalten ohne schriftliche Genehmigung\n• Einsatz automatisierter Tools zum Scraping von Inhalten\n• Beeinträchtigung der Leistung des Dienstes`,
      },
      {
        title: '3. Abonnementrichtlinien',
        body: `PATTO bietet einen kostenlosen Plan und ein Premium-Abonnement an, das monatlich oder jährlich abgerechnet wird. Abonnements verlängern sich automatisch, sofern sie nicht mindestens 24 Stunden vor Ablauf des Abrechnungszeitraums gekündigt werden.\n\nSie können jederzeit in den Kontoeinstellungen kündigen.`,
      },
      {
        title: '4. Geistiges Eigentum',
        body: `Alle Inhalte in PATTO — Geschichten, Muster, Illustrationen, Audio und Software — sind Eigentum von PATTO Inc. oder seinen Lizenzgebern und durch Urheberrecht geschützt.\n\nSie erhalten eine eingeschränkte, nicht-exklusive Lizenz zur Nutzung für persönliche, nicht-kommerzielle Zwecke.`,
      },
      {
        title: '5. Haftungsbeschränkung',
        body: `Im gesetzlich zulässigen Umfang haftet PATTO Inc. nicht für indirekte, zufällige, besondere oder Folgeschäden aus der Nutzung des Dienstes.\n\nDer Dienst wird „wie besehen" und ohne Gewährleistungen jeglicher Art bereitgestellt.`,
      },
      {
        title: '6. Kontokündigung',
        body: `Wir können Ihr Konto nach eigenem Ermessen sperren oder kündigen, wenn Sie gegen diese Bedingungen verstoßen. Sie können Ihr Konto jederzeit in den Kontoeinstellungen löschen.`,
      },
      {
        title: '7. Kontakt',
        body: `Bei Fragen zu diesen Nutzungsbedingungen:\n\nE-Mail: legal@patto.app\nAdresse: PATTO Inc., Seoul, Südkorea\n\nDiese Nutzungsbedingungen wurden zuletzt am 25. Juni 2026 aktualisiert.`,
      },
    ],
  },
}

// ── Privacy Policy ─────────────────────────────────────────────────────────────

export const PRIVACY: Partial<Record<AppLang, LegalDoc>> = {
  ko: {
    title: '개인정보처리방침',
    updated: '최종 업데이트: 2026년 6월 25일',
    sections: [
      {
        title: '1. 수집하는 정보',
        body: `당사는 사용자가 직접 제공하는 다음 정보를 수집합니다.\n\n• 계정 정보 (이메일 주소, 닉네임, 프로필 사진)\n• 이용 데이터 (읽은 스토리, 학습한 패턴, 연속 학습일)\n• 기기 정보 (기기 종류, 운영체제, 브라우저 종류)\n• 문의 및 피드백 내용\n\n결제 정보 등 민감한 개인정보는 직접 수집하지 않으며, 결제 처리는 제3자 서비스 제공업체를 통해 이루어집니다.`,
      },
      {
        title: '2. 정보 이용 목적',
        body: `수집한 정보는 다음 목적으로 이용됩니다.\n\n• 서비스 제공, 유지 및 개선\n• 맞춤형 학습 경험 제공 및 학습 진도 관리\n• 거래 관련 이메일 발송 (계정 인증, 구독 영수증 등)\n• 문의 및 질문 응대\n• 서비스 개선을 위한 이용 패턴 분석\n• 법적 의무 이행\n\n수집한 개인정보는 제3자에게 판매하지 않습니다.`,
      },
      {
        title: '3. 데이터 보관',
        body: `데이터는 Supabase, Inc.가 제공하는 보안 서버에 저장됩니다. 데이터는 미국 또는 당사 서비스 제공업체가 운영하는 국가에서 저장·처리될 수 있습니다.\n\n계정 데이터는 계정이 활성 상태인 동안 또는 서비스 제공에 필요한 기간 동안 보관됩니다. 계정 삭제 시 개인정보는 법적 보관 의무를 제외하고 30일 이내에 삭제됩니다.`,
      },
      {
        title: '4. 쿠키',
        body: `PATTO는 서비스 개선을 위해 쿠키 및 유사 기술을 사용합니다.\n\n• 세션 쿠키 — 방문 중 로그인 상태 유지\n• 환경설정 쿠키 — 테마, 언어 등 설정 기억\n• 분석 쿠키 — 서비스 이용 패턴 파악\n\n브라우저 설정에서 쿠키를 비활성화할 수 있으나, 일부 기능이 정상 작동하지 않을 수 있습니다.`,
      },
      {
        title: '5. 제3자 서비스',
        body: `PATTO는 다음 제3자 서비스를 이용하며, 해당 서비스는 사용자 정보를 수집할 수 있습니다.\n\n• Supabase — 데이터베이스 및 인증\n• Vercel — 호스팅 및 콘텐츠 전송\n• Web Speech API — 기기 내 TTS (데이터 전송 없음)\n• Unsplash — 스토리 이미지 (Unsplash 개인정보처리방침 적용)\n\n각 서비스는 자체 개인정보처리방침을 따릅니다.`,
      },
      {
        title: '6. 사용자 권리',
        body: `거주 지역에 따라 개인정보와 관련하여 다음 권리를 행사할 수 있습니다.\n\n• 열람권 — 당사가 보유한 데이터 사본 요청\n• 정정권 — 부정확한 데이터 수정 요청\n• 삭제권 — 계정 및 관련 데이터 삭제 요청\n• 이동권 — 기계가 읽을 수 있는 형식으로 데이터 수령\n• 이의제기권 — 특정 처리 활동에 대한 이의 제기\n\n권리 행사를 원하시면 privacy@patto.app으로 연락주시기 바랍니다.`,
      },
      {
        title: '7. 문의',
        body: `개인정보처리방침 또는 데이터 처리에 관한 문의는 아래로 연락주시기 바랍니다.\n\n이메일: privacy@patto.app\n주소: PATTO Inc., 대한민국 서울\n\n본 개인정보처리방침은 2026년 6월 25일에 최종 업데이트되었습니다.`,
      },
    ],
  },

  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: June 25, 2026',
    sections: [
      {
        title: '1. Information We Collect',
        body: `We collect the following information you provide directly:\n\n• Account information (email address, username, profile photo)\n• Usage data (stories read, patterns learned, study streaks)\n• Device information (device type, operating system, browser type)\n• Inquiries and feedback\n\nWe do not collect sensitive personal information such as payment details directly. Payment processing is handled by third-party providers.`,
      },
      {
        title: '2. How We Use Your Information',
        body: `We use collected information to:\n\n• Provide, maintain, and improve the Service\n• Deliver personalized learning experiences and track progress\n• Send transactional emails (account verification, subscription receipts)\n• Respond to inquiries and support requests\n• Analyze usage patterns to improve the Service\n• Comply with legal obligations\n\nWe do not sell your personal information to third parties.`,
      },
      {
        title: '3. Data Storage',
        body: `Data is stored on secure servers provided by Supabase, Inc. Your data may be stored and processed in the United States or in countries where our service providers operate.\n\nAccount data is retained while your account is active or as needed to provide the Service. Upon account deletion, personal information is deleted within 30 days, subject to legal retention requirements.`,
      },
      {
        title: '4. Cookies',
        body: `PATTO uses cookies and similar technologies to improve the Service:\n\n• Session cookies — maintain your login state during a visit\n• Preference cookies — remember settings like theme and language\n• Analytics cookies — understand usage patterns\n\nYou may disable cookies in your browser settings, but some features may not work properly as a result.`,
      },
      {
        title: '5. Third-Party Services',
        body: `PATTO uses the following third-party services that may collect user information:\n\n• Supabase — database and authentication\n• Vercel — hosting and content delivery\n• Web Speech API — on-device TTS (no data transmitted)\n• Unsplash — story images (subject to Unsplash's Privacy Policy)\n\nEach service follows its own privacy policy. Please review them accordingly.`,
      },
      {
        title: '6. Your Rights',
        body: `Depending on your location, you may have the following rights regarding your personal information:\n\n• Right to access — request a copy of data we hold\n• Right to rectification — request correction of inaccurate data\n• Right to erasure — request deletion of your account and data\n• Right to portability — receive your data in machine-readable format\n• Right to object — object to certain processing activities\n\nTo exercise these rights, contact us at privacy@patto.app. We will respond within 30 days.`,
      },
      {
        title: '7. Contact',
        body: `For inquiries regarding this Privacy Policy or our data practices:\n\nEmail: privacy@patto.app\nAddress: PATTO Inc., Seoul, South Korea\n\nThis Privacy Policy was last updated on June 25, 2026.`,
      },
    ],
  },

  es: {
    title: 'Política de Privacidad',
    updated: 'Última actualización: 25 de junio de 2026',
    sections: [
      { title: '1. Información que recopilamos', body: `Recopilamos la información que proporcionas directamente:\n\n• Información de cuenta (correo, nombre de usuario, foto)\n• Datos de uso (historias leídas, patrones aprendidos, racha de estudio)\n• Información del dispositivo\n• Consultas y comentarios\n\nNo vendemos tu información personal a terceros.` },
      { title: '2. Cómo usamos tu información', body: `Usamos la información recopilada para proporcionar y mejorar el Servicio, ofrecer experiencias de aprendizaje personalizadas, enviar correos transaccionales, responder consultas y cumplir obligaciones legales.` },
      { title: '3. Almacenamiento de datos', body: `Los datos se almacenan en servidores seguros de Supabase, Inc. Los datos se eliminan dentro de los 30 días posteriores a la eliminación de la cuenta, sujeto a requisitos legales de retención.` },
      { title: '4. Cookies', body: `PATTO usa cookies de sesión, de preferencias y analíticas para mejorar el Servicio. Puedes desactivar las cookies en la configuración de tu navegador.` },
      { title: '5. Servicios de terceros', body: `PATTO utiliza Supabase (base de datos/autenticación), Vercel (alojamiento), Web Speech API (TTS local) y Unsplash (imágenes). Cada servicio tiene su propia política de privacidad.` },
      { title: '6. Tus derechos', body: `Dependiendo de tu ubicación, puedes tener derechos de acceso, rectificación, supresión, portabilidad y oposición. Contáctanos en privacy@patto.app.` },
      { title: '7. Contacto', body: `Para consultas sobre esta Política de Privacidad:\n\nCorreo: privacy@patto.app\nÚltima actualización: 25 de junio de 2026.` },
    ],
  },

  ja: {
    title: 'プライバシーポリシー',
    updated: '最終更新日：2026年6月25日',
    sections: [
      { title: '1. 収集する情報', body: `直接提供いただく以下の情報を収集します。\n\n• アカウント情報（メールアドレス、ユーザー名、プロフィール写真）\n• 利用データ（読んだストーリー、学習したパターン、連続学習日数）\n• デバイス情報\n• お問い合わせ内容\n\n個人情報を第三者に販売することはありません。` },
      { title: '2. 情報の利用目的', body: `収集した情報はサービスの提供・改善、パーソナライズされた学習体験の提供、トランザクションメールの送信、お問い合わせ対応、法的義務の遵守に使用します。` },
      { title: '3. データの保管', body: `データはSupabase, Inc.のセキュアサーバーに保存されます。アカウント削除後は法的保持義務を除き30日以内に削除されます。` },
      { title: '4. Cookie', body: `PATTOはセッションCookie、設定Cookie、分析Cookieを使用します。ブラウザ設定でCookieを無効化できますが、一部機能が正常に動作しない場合があります。` },
      { title: '5. 第三者サービス', body: `Supabase（DB・認証）、Vercel（ホスティング）、Web Speech API（デバイス内TTS）、Unsplash（画像）を利用しています。各サービスは独自のプライバシーポリシーに従います。` },
      { title: '6. ユーザーの権利', body: `お住まいの地域によって、アクセス権、訂正権、削除権、ポータビリティ権、異議申立権を行使できます。privacy@patto.appまでお問い合わせください。` },
      { title: '7. お問い合わせ', body: `プライバシーポリシーに関するお問い合わせ：\n\nメール：privacy@patto.app\n最終更新日：2026年6月25日` },
    ],
  },

  'zh-cn': {
    title: '隐私政策',
    updated: '最后更新：2026年6月25日',
    sections: [
      { title: '1. 我们收集的信息', body: `我们收集您直接提供的信息：\n\n• 账户信息（电子邮件、用户名、头像）\n• 使用数据（已读故事、已学句型、学习连续天数）\n• 设备信息\n• 咨询和反馈\n\n我们不会将您的个人信息出售给第三方。` },
      { title: '2. 信息使用目的', body: `我们使用收集的信息来提供和改进服务、提供个性化学习体验、发送交易邮件、回应咨询并履行法律义务。` },
      { title: '3. 数据存储', body: `数据存储在Supabase, Inc.提供的安全服务器上。删除账户后，除法律保留要求外，个人信息将在30天内删除。` },
      { title: '4. Cookie', body: `PATTO使用会话Cookie、偏好Cookie和分析Cookie来改进服务。您可以在浏览器设置中禁用Cookie。` },
      { title: '5. 第三方服务', body: `PATTO使用Supabase（数据库/认证）、Vercel（托管）、Web Speech API（设备端TTS）和Unsplash（图片）。各服务遵循其自己的隐私政策。` },
      { title: '6. 用户权利', body: `根据您所在地区，您可能享有访问权、更正权、删除权、数据携带权和异议权。请联系privacy@patto.app行使这些权利。` },
      { title: '7. 联系方式', body: `如有关于本隐私政策的问题：\n\n邮箱：privacy@patto.app\n最后更新：2026年6月25日` },
    ],
  },

  fr: {
    title: 'Politique de Confidentialité',
    updated: 'Dernière mise à jour : 25 juin 2026',
    sections: [
      { title: '1. Informations collectées', body: `Nous collectons les informations que vous fournissez directement :\n\n• Informations de compte (email, nom d'utilisateur, photo)\n• Données d'utilisation (histoires lues, structures apprises, jours consécutifs)\n• Informations sur l'appareil\n\nNous ne vendons pas vos informations personnelles à des tiers.` },
      { title: '2. Utilisation des informations', body: `Nous utilisons les informations collectées pour fournir et améliorer le Service, personnaliser l'expérience d'apprentissage, envoyer des emails transactionnels et répondre aux demandes.` },
      { title: '3. Conservation des données', body: `Les données sont stockées sur des serveurs sécurisés de Supabase, Inc. Après suppression du compte, les informations personnelles sont supprimées dans les 30 jours, sous réserve des obligations légales.` },
      { title: '4. Cookies', body: `PATTO utilise des cookies de session, de préférences et analytiques. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.` },
      { title: '5. Services tiers', body: `PATTO utilise Supabase, Vercel, Web Speech API et Unsplash. Chaque service suit sa propre politique de confidentialité.` },
      { title: '6. Vos droits', body: `Selon votre localisation, vous pouvez exercer vos droits d'accès, de rectification, d'effacement, de portabilité et d'opposition en contactant privacy@patto.app.` },
      { title: '7. Contact', body: `Pour toute question :\n\nEmail : privacy@patto.app\nDernière mise à jour : 25 juin 2026.` },
    ],
  },

  de: {
    title: 'Datenschutzrichtlinie',
    updated: 'Zuletzt aktualisiert: 25. Juni 2026',
    sections: [
      { title: '1. Erhobene Daten', body: `Wir erheben folgende direkt bereitgestellte Informationen:\n\n• Kontoinformationen (E-Mail, Benutzername, Profilfoto)\n• Nutzungsdaten (gelesene Geschichten, erlernte Muster, Lerntage)\n• Geräteinformationen\n\nWir verkaufen Ihre personenbezogenen Daten nicht an Dritte.` },
      { title: '2. Verwendung der Informationen', body: `Wir verwenden gesammelte Informationen zur Bereitstellung und Verbesserung des Dienstes, personalisierten Lernerfahrungen, Versand von Transaktions-E-Mails und zur Erfüllung rechtlicher Verpflichtungen.` },
      { title: '3. Datenspeicherung', body: `Daten werden auf sicheren Servern von Supabase, Inc. gespeichert. Nach Kontolöschung werden personenbezogene Daten innerhalb von 30 Tagen gelöscht, vorbehaltlich gesetzlicher Aufbewahrungspflichten.` },
      { title: '4. Cookies', body: `PATTO verwendet Sitzungs-, Präferenz- und Analyse-Cookies. Sie können Cookies in Ihren Browsereinstellungen deaktivieren.` },
      { title: '5. Drittanbieterdienste', body: `PATTO nutzt Supabase, Vercel, Web Speech API und Unsplash. Jeder Dienst unterliegt seiner eigenen Datenschutzrichtlinie.` },
      { title: '6. Ihre Rechte', body: `Abhängig von Ihrem Standort haben Sie möglicherweise Auskunfts-, Berichtigungs-, Löschungs- und Widerspruchsrechte. Kontaktieren Sie uns unter privacy@patto.app.` },
      { title: '7. Kontakt', body: `Bei Fragen zur Datenschutzrichtlinie:\n\nE-Mail: privacy@patto.app\nZuletzt aktualisiert: 25. Juni 2026.` },
    ],
  },
}

// ── Helper ─────────────────────────────────────────────────────────────────────

export function getLegalDoc(
  doc: Partial<Record<AppLang, LegalDoc>>,
  lang: AppLang,
): LegalDoc {
  return doc[lang] ?? doc.ko!
}
