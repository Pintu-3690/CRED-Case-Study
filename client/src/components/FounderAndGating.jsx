import { useState } from "react";
import { Brain, Lock, Sparkles, Award, TrendingUp, Compass, Target, ShieldCheck, Quote, ChevronRight, Briefcase } from "lucide-react";
import Reveal from "./Reveal";

const ANGEL_PORTFOLIO = [
  { name: "Razorpay", category: "Fintech Decacorn", exit: "Valued at $7.5B+" },
  { name: "Unacademy", category: "Edtech Unicorn", exit: "Valued at $3.4B" },
  { name: "Slice", category: "Credit Cards & Banking", exit: "Merged with NESFB" },
  { name: "Khatabook", category: "MSME Ledger SaaS", exit: "Series C" },
  { name: "CoinDCX", category: "Crypto / Web3", exit: "Unicorn Status" },
  { name: "Zepto", category: "Quick Commerce", exit: "Valued at $5.0B+" },
];

export default function FounderAndGating({ founder, gating }) {
  const [activePhilosophy, setActivePhilosophy] = useState(0);

  if (!founder || !gating) return null;

  const philosophies = founder.philosophies || [
    {
      title: "The Delta-4 Theory",
      tagline: "The Irreversibility of Superior User Experiences",
      description: founder.delta4?.description || "When a product improves an existing workflow by a factor of 4x or more, users develop an irreversible habit.",
    },
  ];

  return (
    <section className="founder-section" id="founder">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow-pill">
            <Sparkles size={14} className="accent-gold" />
            <span>FOUNDER PROFILE &amp; PRODUCT PHILOSOPHY</span>
          </div>
          <h2>The Mind Behind the 750 Gate: Kunal Shah</h2>
          <p>
            How Kunal Shah’s background in philosophy and behavioural economics shaped CRED’s 
            high-trust, high-ARPU gated ecosystem.
          </p>
        </Reveal>

        {/* Top Profile Card Grid */}
        <div className="founder-main-grid">
          {/* Left Column: Official Kunal Shah Image & Credentials */}
          <Reveal as="div" className="card founder-hero-card">
            <div className="founder-portrait-frame">
              <img 
                src="/assets/kunal-shah.jpeg" 
                alt="Kunal Shah - Founder of CRED" 
                className="founder-portrait-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="portrait-glow-ring" />
              <div className="portrait-badge">
                <ShieldCheck size={16} className="accent-green" />
                <span>Second-Time Founder</span>
              </div>
            </div>

            <div className="founder-card-body">
              <div className="founder-header-info">
                <h3>{founder.name}</h3>
                <p className="founder-role-title">{founder.role || "Founder, CRED & Tech Icon"}</p>
                <p className="founder-edu">{founder.education}</p>
              </div>

              <p className="founder-bio-text">{founder.bio}</p>

              {/* Career Highlights Matrix */}
              <div className="founder-stat-matrix">
                <div className="fstat-box">
                  <span className="fstat-label">Prior Exit</span>
                  <span className="fstat-val accent-gold">FreeCharge ($400M)</span>
                  <span className="fstat-sub">Acquired by Snapdeal (2015)</span>
                </div>
                <div className="fstat-box">
                  <span className="fstat-label">Angel Portfolio</span>
                  <span className="fstat-val accent-cyan">200+ Ventures</span>
                  <span className="fstat-sub">India's most active angel</span>
                </div>
                <div className="fstat-box">
                  <span className="fstat-label">Strategic Role</span>
                  <span className="fstat-val accent-green">Head of WhatsApp Strategy</span>
                  <span className="fstat-sub">Via Meta $900M Strategic Deal</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Interactive Philosophies & Quotes */}
          <Reveal as="div" delay={100} className="card philosophies-card">
            <div className="philo-header">
              <div className="philo-title-tag">
                <Brain size={18} className="accent-gold" />
                <h3>Core Philosophical Frameworks</h3>
              </div>
              <span className="philo-subtag">Click to explore each thesis</span>
            </div>

            {/* Philosophy Navigation Tabs */}
            <div className="philo-tabs-nav">
              {philosophies.map((ph, idx) => (
                <button
                  key={ph.title}
                  className={`philo-tab-btn ${activePhilosophy === idx ? "active" : ""}`}
                  onClick={() => setActivePhilosophy(idx)}
                >
                  <span className="tab-idx">0{idx + 1}</span>
                  <span className="tab-name">{ph.title}</span>
                </button>
              ))}
            </div>

            {/* Active Philosophy Content Display */}
            <div className="active-philo-display">
              <div className="philo-display-head">
                <h4>{philosophies[activePhilosophy]?.title}</h4>
                <span className="philo-tagline-badge">{philosophies[activePhilosophy]?.tagline}</span>
              </div>
              <p className="philo-long-desc">{philosophies[activePhilosophy]?.description}</p>
            </div>

            {/* Featured Quote Box */}
            {founder.quotes && founder.quotes.length > 0 && (
              <div className="founder-quote-banner">
                <Quote size={24} className="quote-icon" />
                <div className="quote-content">
                  <blockquote className="quote-text">
                    &ldquo;{founder.quotes[0].quote}&rdquo;
                  </blockquote>
                  <span className="quote-author">&mdash; Kunal Shah &bull; {founder.quotes[0].context}</span>
                </div>
              </div>
            )}
          </Reveal>
        </div>

        {/* Angel Portfolio Spotlight */}
        <Reveal as="div" delay={120} className="card angel-portfolio-banner">
          <div className="angel-banner-head">
            <div className="angel-title-wrap">
              <Briefcase size={18} className="accent-cyan" />
              <h3>Kunal Shah&rsquo;s Notable Angel Investments</h3>
            </div>
            <span className="angel-count-pill">200+ High-Growth Startups</span>
          </div>

          <div className="angel-grid">
            {ANGEL_PORTFOLIO.map((startup) => (
              <div className="angel-chip" key={startup.name}>
                <div className="angel-chip-name">{startup.name}</div>
                <div className="angel-chip-cat">{startup.category}</div>
                <div className="angel-chip-val">{startup.exit}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Gated Platform Mechanics Deep Dive */}
        <Reveal as="div" delay={140} className="card gating-breakdown-card">
          <div className="gating-breakdown-head">
            <div className="gate-icon-badge">
              <Lock size={22} className="accent-red" />
            </div>
            <div>
              <h3>{gating.title}</h3>
              <p>{gating.intro}</p>
            </div>
          </div>

          <div className="gating-points-grid">
            {gating.points.map((pt, i) => (
              <div className="gating-pt-card" key={pt.title}>
                <div className="pt-number">0{i + 1}</div>
                <h4 className="pt-title">{pt.title}</h4>
                <p className="pt-detail">{pt.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
