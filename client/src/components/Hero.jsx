import { useState } from "react";
import { ShieldCheck, Lock, Unlock, TrendingUp, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";

export default function Hero({ meta, founder, credQuote, usdInrRate = 87.42 }) {
  const [score, setScore] = useState(785);

  const isUnlocked = score >= 750;
  const livePrice = credQuote?.price || 284.50;
  const priceChange = credQuote?.change ?? 3.85;
  const pctChange = credQuote?.pctChange ?? 1.37;
  const isUp = priceChange >= 0;
  const totalSharesM = credQuote?.sharesOutstandingM || 1320.4;
  const liveCapInrCr = Math.round((livePrice * totalSharesM) / 10);
  const liveCapUsdB = ((liveCapInrCr * 10) / (usdInrRate * 1000)).toFixed(2);

  return (
    <section className="hero" id="overview">
      <div className="container">
        {/* Editorial Monograph Masthead */}
        <Reveal className="hero__top">
          <div className="editorial-kicker">
            <span>01</span>
            <span aria-hidden="true">·</span>
            <span>Equity Research Monograph</span>
            <span aria-hidden="true">·</span>
            <span>{meta?.company || "Dreamplug Technologies Pvt. Ltd."}</span>
          </div>
          <div className="hero__top-meta">
            <span>Founded {meta?.founded || "2018"}</span>
            <span aria-hidden="true">·</span>
            <span>{meta?.headquarters || "Bengaluru, India"}</span>
            <span aria-hidden="true">·</span>
            <span>Series H ($900M Meta Deal)</span>
          </div>
        </Reveal>

        <div className="hero__grid">
          {/* Left Column: Core Thesis & Live Equity Snapshot */}
          <Reveal className="hero__content">
            <h1>
              Monetizing India&rsquo;s{" "}
              <span className="hero-gradient-text">Top 1% Transactors</span>
            </h1>

            <p className="hero__sub">
              CRED operates India&rsquo;s gated financial network restricted to consumers with{" "}
              <strong>CIBIL credit scores of 750+</strong>. By trading mass-market volume for prime
              underwriting quality, CRED captures over <strong>60% of multi-card spend</strong> to
              cross-sell digital lending, automotive concierge, insurance, and wealth advisory.
            </p>

            {/* Live Market Price & Share Capitalization Strip */}
            <div className="hero__live-strip">
              <div className="live-strip-item">
                <span className="strip-label">CRED:UNLST Live Price</span>
                <div className="strip-val-group">
                  <span className="strip-val tabular-nums">₹{livePrice.toFixed(2)}</span>
                  <span className={`strip-delta tabular-nums ${isUp ? "accent-green" : "accent-red"}`}>
                    {isUp ? "+" : ""}{pctChange.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="strip-divider" />

              <div className="live-strip-item">
                <span className="strip-label">Implied Equity Value</span>
                <span className="strip-val accent-gold tabular-nums">
                  ${liveCapUsdB}B{" "}
                  <span className="sub">₹{liveCapInrCr.toLocaleString("en-IN")} Cr</span>
                </span>
              </div>

              <div className="strip-divider" />

              <div className="live-strip-item">
                <span className="strip-label">Total Diluted Shares</span>
                <span className="strip-val tabular-nums">
                  132.04 Cr <span className="sub">FV ₹1.00</span>
                </span>
              </div>
            </div>

            <div className="hero__ctas">
              <a href="#trading-terminal" className="btn btn-primary btn-glow">
                <span>Open Live Market Desk</span>
                <TrendingUp size={16} />
              </a>
              <a href="#shares-captable" className="btn btn-ghost">
                <span>All 132.04 Cr Shares &amp; Cap Table</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </Reveal>

          {/* Right Column: Founder Anchor + Interactive CIBIL 750 Gate Simulator */}
          <Reveal delay={80} className="hero__side">
            <a href="#founder" className="card founder-chip-interactive">
              <div className="founder-chip__avatar-wrap">
                <img
                  src="/assets/kunal-shah.jpeg"
                  alt="Kunal Shah, Founder of CRED"
                  className="founder-chip__img"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="founder-chip__avatar-fallback">KS</div>
              </div>
              <div className="founder-chip__info">
                <div className="founder-chip__name">{founder?.name || "Kunal Shah"}</div>
                <div className="founder-chip__role">
                  Founder, CRED · Exited FreeCharge ($400M)
                </div>
                <div className="founder-chip__quote">
                  &ldquo;If you solve for trust in a low-trust society, you create an unassailable moat.&rdquo;
                </div>
              </div>
            </a>

            <div className={`card gate-meter-card ${isUnlocked ? "gate-unlocked" : "gate-locked"}`}>
              <div className="gate-meter__head">
                <div className="gate-status-badge">
                  {isUnlocked ? (
                    <>
                      <Unlock size={15} className="accent-green" />
                      <span className="text-unlocked">CIBIL 750+ Gate Passed</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} className="accent-red" />
                      <span className="text-locked">Gate Access Restricted</span>
                    </>
                  )}
                </div>
                <span className="score-live-display tabular-nums">
                  Score: <strong>{score}</strong>
                </span>
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
                <div className="gate-track-labels tabular-nums">
                  <span>300 (Subprime)</span>
                  <span className="gate-threshold-pin">750 Gate</span>
                  <span>900 (Prime)</span>
                </div>
              </div>

              <div className="gate-result-box">
                {isUnlocked ? (
                  <div className="unlocked-details">
                    <div className="unlocked-headline">
                      <ShieldCheck size={16} className="accent-green" />
                      <strong>CRED Member Privileges Granted</strong>
                    </div>
                    <ul className="unlocked-perks">
                      <li>
                        Pre-approved <strong>₹10 Lakh</strong> instant credit line (CRED Cash @ &lt;1.2% NPA)
                      </li>
                      <li>
                        CRED Garage vehicle telemetry &amp; 1-click IRDAI motor insurance
                      </li>
                      <li>
                        1:1 CRED Coin rewards &amp; Kuvera ₹50,000+ Cr AUM direct wealth portal
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="locked-details">
                    <div className="locked-headline">
                      <Lock size={16} className="accent-red" />
                      <strong>Underwriting Barrier Enforced</strong>
                    </div>
                    <p className="locked-desc">
                      Applicants scoring below 750 are filtered at onboarding, eliminating subprime
                      default risk and concentrating India&rsquo;s top 15% discretionary spend.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Full-Width 4-KPI Summary Strip */}
        <Reveal delay={120}>
          <div className="hero-kpi-strip">
            <div className="hero-kpi-cell">
              <span className="hero-kpi-label">Annualized TPV</span>
              <strong className="hero-kpi-val tabular-nums">₹8.5 Lakh Cr+</strong>
              <span className="hero-kpi-sub">~32% of India card spend</span>
            </div>
            <div className="hero-kpi-cell">
              <span className="hero-kpi-label">FY25 Operating Revenue</span>
              <strong className="hero-kpi-val accent-green tabular-nums">₹2,735 Cr</strong>
              <span className="hero-kpi-sub">+16.0% YoY · 74.6% Gross Margin</span>
            </div>
            <div className="hero-kpi-cell">
              <span className="hero-kpi-label">Annual ARPU</span>
              <strong className="hero-kpi-val accent-gold tabular-nums">₹2,150</strong>
              <span className="hero-kpi-sub">22x mass UPI benchmarks</span>
            </div>
            <div className="hero-kpi-cell">
              <span className="hero-kpi-label">Prime Member Base</span>
              <strong className="hero-kpi-val tabular-nums">15.2M+</strong>
              <span className="hero-kpi-sub">LTV/CAC 25.4x · 91.8% Retention</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
