import { useState } from "react";
import { PieChart, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";

const DEFAULT_PRODUCTS = [
  {
    name: "CRED Cash & Mint",
    category: "Digital Lending & P2P",
    share: 45,
    color: "#00df82",
    image: "/assets/images/cred_cash_lending_1794843054137.jpg",
    detail:
      "Instant pre-approved personal credit lines up to ₹10,00,000 (₹10 Lakh) disbursable in 30 seconds directly to bank accounts. Partnered with LiquiLoans, IDFC First Bank, and L&T Finance. Managed lending AUM has scaled past ₹22,000 Cr with industry-leading prime repayment records.",
    revenueModel: "Processing fee (1.5%–2.5%) + Net Interest Margin share (2%–4% spread)",
    metrics: "₹22,000+ Cr AUM · <1.2% Default Rate",
  },
  {
    name: "CRED Garage & Motor Insurance",
    category: "Automotive Concierge",
    share: 22,
    color: "#00e5ff",
    image: "/assets/images/cred_garage_auto_1794843054104.jpg",
    detail:
      "A comprehensive vehicle lifecycle concierge tracking FASTag balances, live fuel price tracking, challan notifications, pollution check alerts, and one-click motor insurance renewals under CRED's direct IRDAI corporate-agency license.",
    revenueModel:
      "15%–20% brokerage commission on comprehensive car/bike insurance policies + FASTag recharge take rates",
    metrics: "4.5M+ Registered Vehicles · ₹500+ Cr Insurance Premiums",
  },
  {
    name: "Kuvera Wealth Management",
    category: "Investments & Advisory",
    share: 18,
    color: "#b388ff",
    image: "/assets/images/kuvera_wealth_portal_1794843054803.jpg",
    detail:
      "Acquired in 2024, Kuvera brings ₹50,000+ Cr in Assets Under Advisory across zero-commission direct mutual funds, Indian equities, Fixed Deposits, and US equities into the CRED ecosystem, turning CRED into a holistic balance-sheet manager.",
    revenueModel:
      "B2B platform fees, premium advisory tiers, high-yield fixed-income distribution margins",
    metrics: "₹50,000+ Cr AUM · 3.2M+ Investor Portfolios",
  },
  {
    name: "CRED Pay, Store & Escapes",
    category: "Commerce & Travel",
    share: 15,
    color: "#ff3355",
    image: "/assets/images/cred_escapes_luxury_1794843055723.jpg",
    detail:
      "CRED Pay powers online 1-click checkout across top D2C merchants, while CRED Escapes offers curated experiential luxury stays at 5-star properties (Taj, Oberoi, Marriott) with exclusive member perks and coin burn redemption.",
    revenueModel:
      "1%–3% merchant checkout take rate + 10%–20% hospitality commission on Escapes bookings",
    metrics: "1,200+ Brand Partners · 150K+ Luxury Stays Booked",
  },
];

export default function MonetizationEcosystem({ products = DEFAULT_PRODUCTS }) {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  const list = products?.length ? products : DEFAULT_PRODUCTS;
  const active = list[selectedProduct] || list[0];

  const markFailed = (key) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <section className="ecosystem-section" id="ecosystem">
      <div className="container">
        <Reveal className="section-head">
          <div className="editorial-kicker">
            <span>10</span>
            <span aria-hidden="true">·</span>
            <span>Multi-Pillar Monetization Flywheel</span>
          </div>
          <h2>How CRED Converts Trust into High-Margin Revenue</h2>
          <p>
            Bill payments serve as the zero-margin acquisition hook. Real enterprise value is generated across
            lending, auto telemetry, wealth management, and luxury commerce.
          </p>
        </Reveal>

        {/* Product Revenue Mix Bar */}
        <Reveal as="div" className="card revenue-share-bar-card">
          <div className="rev-bar-header">
            <div className="rev-bar-title">
              <PieChart size={18} className="accent-gold" />
              <h3>Estimated Revenue Mix by Business Vertical (FY25)</h3>
            </div>
            <span className="rev-bar-note">Segment distribution of ₹2,735 Cr operating revenue</span>
          </div>

          <div className="rev-stacked-bar">
            {list.map((p, idx) => (
              <div
                key={p.name}
                className={`rev-bar-chunk ${selectedProduct === idx ? "active-chunk" : ""}`}
                style={{ width: `${p.share}%`, backgroundColor: p.color }}
                onClick={() => setSelectedProduct(idx)}
                title={`${p.name}: ~${p.share}% of revenue`}
              >
                <span className="chunk-label tabular-nums">{p.share}%</span>
              </div>
            ))}
          </div>

          <div className="rev-legend-row">
            {list.map((p, idx) => (
              <button
                key={p.name}
                className={`rev-legend-btn ${selectedProduct === idx ? "active" : ""}`}
                onClick={() => setSelectedProduct(idx)}
              >
                <span className="legend-dot" style={{ backgroundColor: p.color }} />
                <span className="legend-name">{p.name}</span>
                <span className="legend-pct tabular-nums">({p.share}%)</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Selected Product Deep-Dive Spotlight Card */}
        <Reveal as="div" delay={80} className="card product-spotlight-card">
          <div className="spotlight-grid">
            <div className="spotlight-image-col">
              <div className="spotlight-img-wrap">
                {!failedImages[active.name] ? (
                  <img
                    src={active.image}
                    alt={active.name}
                    className="spotlight-real-img"
                    referrerPolicy="no-referrer"
                    onError={() => markFailed(active.name)}
                  />
                ) : (
                  <div className="spotlight-fallback-surface" style={{ borderColor: active.color }}>
                    <span className="font-mono" style={{ color: active.color }}>{active.category}</span>
                    <strong>{active.name}</strong>
                  </div>
                )}
                <div className="spotlight-overlay-gradient" />
                <div className="spotlight-cat-label" style={{ color: active.color }}>
                  {active.category}
                </div>
              </div>
            </div>

            <div className="spotlight-info-col">
              <div className="spotlight-header">
                <span className="spotlight-rev-share tabular-nums" style={{ color: active.color }}>
                  ~{active.share}% of Total Operating Revenue
                </span>
                <h3>{active.name}</h3>
              </div>

              <p className="spotlight-detail-desc">{active.detail}</p>

              <div className="spotlight-mechanics-box">
                <div className="mech-row">
                  <span className="mech-label">Monetization Engine:</span>
                  <span className="mech-val">{active.revenueModel}</span>
                </div>
                <div className="mech-row">
                  <span className="mech-label">Key Scale Metrics:</span>
                  <span className="mech-val accent-green">{active.metrics}</span>
                </div>
              </div>

              <div className="spotlight-actions">
                <a href="#financials" className="btn btn-primary" style={{ padding: "10px 20px" }}>
                  <span>View Financial Margins</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Grid of All 4 Ecosystem Cards */}
        <div className="ecosystem-cards-grid">
          {list.map((p, idx) => (
            <Reveal
              as="div"
              key={p.name}
              delay={idx * 50}
              className={`card eco-tile-card ${selectedProduct === idx ? "selected" : ""}`}
              onClick={() => setSelectedProduct(idx)}
            >
              <div className="tile-thumb-wrap">
                {!failedImages[`tile-${p.name}`] ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="tile-thumb-img"
                    referrerPolicy="no-referrer"
                    onError={() => markFailed(`tile-${p.name}`)}
                  />
                ) : (
                  <div className="tile-fallback-surface" />
                )}
                <span className="tile-share-pill tabular-nums" style={{ backgroundColor: p.color }}>
                  {p.share}% Rev
                </span>
              </div>
              <div className="tile-body">
                <span className="tile-cat" style={{ color: p.color }}>{p.category}</span>
                <h4>{p.name}</h4>
                <p className="tile-metric-str">{p.metrics}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
