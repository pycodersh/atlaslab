export default function HubHome() {
  const apps = [
    {
      name: "patto",
      category: "English Learning",
      status: "live" as const,
      desc: "Pattern-based English learning with AI feedback. Master 500 core patterns through guided conversation.",
      href: "/patto",
      gradient: ["#6B5DD3", "#A89FEE"],
      monogram: "P",
    },
    {
      name: "k-patto",
      category: "Korean Learning",
      status: "soon" as const,
      desc: "Korean grammar patterns for English speakers. Learn to speak naturally through structured pattern drills.",
      gradient: ["#D85A30", "#F0997B"],
      monogram: "K",
    },
    {
      name: "k-pantry",
      category: "Korean Food",
      status: "soon" as const,
      desc: "Your AI guide to Korean cuisine — ingredients, recipes, and pantry essentials explained.",
      gradient: ["#1D9E75", "#5DCAA5"],
      monogram: "K",
    },
    {
      name: "career navi",
      category: "Career",
      status: "soon" as const,
      desc: "Re-entry career navigator for mid-career professionals. AI-mapped paths from where you are to where you want to be.",
      gradient: ["#185FA5", "#85B7EB"],
      monogram: "C",
    },
    {
      name: "news radar",
      category: "News",
      status: "soon" as const,
      desc: "Real-time news monitoring with AI summaries. Stay informed without the noise.",
      gradient: ["#854F0B", "#EF9F27"],
      monogram: "N",
    },
    {
      name: "진로탐색",
      category: "Education",
      status: "soon" as const,
      desc: "학생을 위한 AI 진로 탐색 가이드. 적성과 미래를 연결하는 경로를 찾아드립니다.",
      gradient: ["#993556", "#ED93B1"],
      monogram: "진",
    },
  ];

  const [featured, ...rest] = apps;

  return (
    <div className="hub-root">
      {/* Background orbs */}
      <div className="hub-bg-orbs">
        <div className="hub-orb hub-orb-1" />
        <div className="hub-orb hub-orb-2" />
        <div className="hub-orb hub-orb-3" />
      </div>

      {/* Nav */}
      <nav className="hub-nav">
        <div className="hub-nav-inner">
          <a href="/" className="hub-logo">
            <div className="hub-logo-icon">A</div>
            <span className="hub-logo-text">Atlas Lab</span>
          </a>
          <ul className="hub-nav-links">
            <li><a href="#apps">Apps</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>
      </nav>

      {/* Content */}
      <main className="hub-content">

        {/* Hero */}
        <section className="hub-hero">
          <div className="hub-badge">
            <span className="hub-badge-dot" />
            AI-powered guide apps
          </div>
          <h1 className="hub-title">
            Find your path.<br />
            <em>We&apos;ll guide the way.</em>
          </h1>
          <p className="hub-sub">
            Atlas Lab builds AI agent apps that help you navigate
            language, career, news, and food.
          </p>
          <div className="hub-cta">
            <a href="#apps" className="hub-btn-primary">
              Explore Apps
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#blog" className="hub-btn-glass">
              Read our blog
            </a>
          </div>
        </section>

        {/* Apps section */}
        <section className="hub-section" id="apps">
          <p className="hub-eyebrow">Our apps</p>
          <h2 className="hub-section-title">Six paths. One studio.</h2>

          {/* Featured card — patto */}
          <div className="hub-apps-featured">
            <div className="hub-glass hub-app-card hub-app-card-featured">
              <HubAppIcon gradient={featured.gradient} monogram={featured.monogram} size="lg" />
              <div className="hub-app-content">
                <div className="hub-tag-row">
                  <span className="hub-app-cat">{featured.category}</span>
                  <span className="hub-app-status hub-status-live">Live</span>
                </div>
                <h3 className="hub-app-name hub-app-name-lg">{featured.name}</h3>
                <p className="hub-app-desc">{featured.desc}</p>
                <a href={featured.href} className="hub-app-link">
                  Open app
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="#A89FEE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* 2-col grid */}
          <div className="hub-apps-grid">
            {rest.map((app) => (
              <div key={app.name} className="hub-glass hub-app-card">
                <HubAppIcon gradient={app.gradient} monogram={app.monogram} />
                <div className="hub-app-content">
                  <div className="hub-tag-row">
                    <span className="hub-app-cat">{app.category}</span>
                    <span className="hub-app-status hub-status-soon">Coming soon</span>
                  </div>
                  <h3 className="hub-app-name">{app.name}</h3>
                  <p className="hub-app-desc">{app.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="hub-divider"><hr /></div>

        {/* Blog section */}
        <section className="hub-section" id="blog">
          <p className="hub-eyebrow">From the studio</p>
          <h2 className="hub-section-title">Stories from the studio.</h2>
          <div className="hub-blog-grid">
            <HubBlogCard
              tag="Design & AI"
              title="Why we build with patterns, not prompts"
              preview="Language learning works best when structure comes first. Here's the philosophy behind patto's curriculum design."
            />
            <HubBlogCard
              tag="Product"
              title="Building six apps at once: our stack, our sanity"
              preview="One Next.js monorepo, one design system, six products in progress. A candid look at how Atlas Lab works."
            />
          </div>
        </section>

        <div className="hub-divider"><hr /></div>

        {/* Footer */}
        <footer className="hub-footer" id="about">
          <div className="hub-footer-left">
            <div className="hub-footer-logo">A</div>
            <span className="hub-footer-brand">Atlas Lab &nbsp;&middot;&nbsp; &copy; 2026</span>
          </div>
          <div className="hub-footer-right">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="mailto:hello@atlaslab.app">Contact</a>
          </div>
        </footer>

      </main>
    </div>
  );
}

function HubAppIcon({
  gradient,
  monogram,
  size = "normal",
}: {
  gradient: string[];
  monogram: string;
  size?: "normal" | "lg";
}) {
  const cls = size === "lg" ? "hub-app-icon-lg" : "hub-app-icon";
  return (
    <div
      className={cls}
      style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text
          x="12" y="16.5"
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="rgba(255,255,255,0.9)"
          fontFamily="Space Mono, monospace"
        >
          {monogram}
        </text>
      </svg>
    </div>
  );
}

function HubBlogCard({
  tag, title, preview,
}: {
  tag: string; title: string; preview: string;
}) {
  return (
    <div className="hub-glass hub-blog-card">
      <p className="hub-blog-tag">{tag}</p>
      <h3 className="hub-blog-title">{title}</h3>
      <p className="hub-blog-preview">{preview}</p>
      <span className="hub-blog-soon">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
          <path d="M6 3.5v3l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
        Coming soon
      </span>
    </div>
  );
}
