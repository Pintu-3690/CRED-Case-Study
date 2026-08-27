import { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, Lock, Unlock, Sparkles, TrendingUp, ChevronRight, Activity } from "lucide-react";
import Reveal from "./Reveal";

export default function Hero({ meta, founder }) {
  const [score, setScore] = useState(785);
  const [liveGtv, setLiveGtv] = useState(850420);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveGtv((prev) => prev + Math.floor(Math.random() * 45 + 15));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const isUnlocked = score >= 750;

  return (
    <section className="hero" id="overview">
      <div className="hero__bg-orb" aria-hidden="true" />
      <div className="hero__bg-grid" aria-hidden="true" />
      
      <div className="container">
        {/* Top Header Badge */}
        <Reveal className="hero__top">
          <div className="eyebrow-pill">
            <span className="live-pulse-dot" />
            <span>EXECUTIVE STRATEGY CASE STUDY &bull; {meta?.company || "Dreamplug Technologies"}</span>
          </div>
          <div className="hero__top-meta">
            <span>FOUNDER: <strong>{meta?.founder || "Kunal Shah"}</strong></span>
            <span className="sep">&bull;</span>
            <span>ROUND: <strong>Series H ($900M Meta Deal)</strong></span>
            <span className="sep">&bull;</span>
            <span>IMPLIED EV: <strong className="accent-green">$4.50B</strong></span>
          </div>
        </Reveal>

        <div className="hero__grid">
          {/* Left Column: Core Value Prop & Branding */}
          <Reveal className="hero__content">
            <div className="hero__brand-badge">
              <img 
                src="/assets/cred-logo.jpeg" 
                alt="CRED Official Logo" 
                className="hero__logo-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="hero__brand-name">CRED</span>
              <span className="hero__brand-status">GATED PRIME ECOSYSTEM</span>
            </div>

            <h1>
              Monetizing India&rsquo;s <br />
              <span className="hero-gradient-text">Top 1% Transactors</span>
            </h1>

            <p className="hero__sub">
              CRED operates India's most exclusive, gated financial sanctuary restricted strictly to consumers 
              with <strong>CIBIL credit scores of 750+</strong>. By trading mass-market volume for high-ARPU transactional 
              quality, CRED captures over <strong>60% of India's multi-card spend</strong> to cross-sell digital lending, 
              vehicle management, insurance, and wealth advisory.
            </p>

            {/* Live Metrics Ticker Bar inside Hero */}
            <div className="hero__live-strip">
              <div className="live-strip-item">
                <span className="strip-label">Annualized Payment Volume (TPV)</span>
                <span className="strip-val accent-green">₹{(liveGtv / 1000).toFixed(1)} Lakh Cr+</span>
              </div>
              <div className="strip-divider" />
              <div className="live-strip-item">
                <span className="strip-label">Average Revenue / User (ARPU)</span>
                <span className="strip-val accent-gold">₹2,150 <span className="sub">(22x Industry)</span></span>
              </div>
            </div>

            <div className="hero__ctas">
              <a href="#live-share" className="btn btn-primary btn-glow">
                <span>Explore Live Market Share</span> <TrendingUp size={16} />
              </a>
              <a href="#ecosystem" className="btn btn-ghost">
                <span>Product Ecosystem</span> <ChevronRight size={16} />
              </a>
              <a href="#founder" className="btn btn-outline-founder">
                <span>Founder Thesis</span> <Sparkles size={16} className="accent-gold" />
              </a>
            </div>
          </Reveal>

          {/* Right Column: Interactive Gate Simulator & Founder preview */}
          <Reveal delay={120} className="hero__side">
            {/* Founder Profile Chip */}
            <a href="#founder" className="card founder-chip-interactive">
              <div className="founder-chip__avatar-wrap">
                <img 
                  src="/assets/kunal-shah.jpeg" 
                  alt="Kunal Shah" 
                  className="founder-chip__img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="founder-chip__avatar-fallback">KS</div>
                <span className="founder-chip__badge-verified" title="Verified Founder">✓</span>
              </div>
              <div className="founder-chip__info">
                <div className="founder-chip__name">{founder?.name || "Kunal Shah"}</div>
                <div className="founder-chip__role">Founder, CRED &bull; Exited FreeCharge ($400M)</div>
                <div className="founder-chip__quote">&ldquo;If you solve for trust, you create an unassailable moat.&rdquo;</div>
              </div>
            </a>

            {/* Interactive CIBIL 750 Gate Simulator */}
            <div className={`card gate-meter-card ${isUnlocked ? "gate-unlocked" : "gate-locked"}`}>
              <div className="gate-meter__head">
                <div className="gate-status-badge">
                  {isUnlocked ? (
                    <>
                      <Unlock size={16} className="accent-green" />
                      <span className="text-unlocked">CIBIL 750+ GATE PASSED</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="accent-red" />
                      <span className="text-locked">GATE ACCESS RESTRICTED</span>
                    </>
                  )}
                </div>
                <span className="score-live-display">Score: <strong>{score}</strong></span>
              </div>

              <div className="gate-slider-wrapper">
                <input 
                  type="range" 
                  min="300" 
                  max="900" 
                  value={score} 
                  onChange={(e) => setScore(parseInt(e.target.value, 10))}
                  className="gate-range-slider"
                  aria-label="Interactive CIBIL score gate slider"
                />
                <div className="gate-track-labels">
                  <span>300 (Subprime)</span>
                  <span className="gate-threshold-pin">750 (Gate)</span>
                  <span>900 (Flawless)</span>
                </div>
              </div>

              <div className="gate-result-box">
                {isUnlocked ? (
                  <div className="unlocked-details">
                    <div className="unlocked-headline">
                      <ShieldCheck size={18} className="accent-green" />
                      <strong>CRED Member Privileges Granted:</strong>
                    </div>
                    <ul className="unlocked-perks">
                      <li>⚡ Pre-approved <strong>₹10 Lakh</strong> instant loan (CRED Cash @ &lt;1.2% NPA)</li>
                      <li>🏎️ CRED Garage automotive telemetry &amp; 1-click IRDAI insurance</li>
                      <li>💎 1:1 CRED Coin rewards &amp; Kuvera ₹50,000+ Cr AUM wealth portal</li>
                    </ul>
                  </div>
                ) : (
                  <div className="locked-details">
                    <div className="locked-headline">
                      <Lock size={18} className="accent-red" />
                      <strong>Underwriting Barrier Enforced:</strong>
                    </div>
                    <p className="locked-desc">
                      Applicants scoring below 750 are filtered at onboarding. This eliminates subprime credit default 
                      risk and concentrates India's top 15% discretionary spending power.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
