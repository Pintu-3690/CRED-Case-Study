import { useState } from "react";
import { DollarSign, Shield, Zap, Car, TrendingUp, ShoppingBag, PieChart, Layers, ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";

const DEFAULT_PRODUCTS = [
  { 
    name: "CRED Cash & Mint", 
    category: "Digital Lending & P2P",
    share: 45, 
    color: "#00df82", 
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    detail: "Instant pre-approved personal credit lines up to ₹10,000,000 disbursable in 30 seconds directly to bank accounts. Partnered with LiquiLoans, IDFC First Bank, and L&T Finance. Managed lending AUM has scaled past ₹22,000 Cr with industry-leading prime repayment records.",
    revenueModel: "Processing fee (1.5%–2.5%) + Net Interest Margin share (2%–4% spread)",
    metrics: "₹22,000+ Cr AUM • <1.2% Default Rate"
  },
  { 
    name: "CRED Garage & Motor Insurance", 
    category: "Automotive Concierge",
    share: 22, 
    color: "#00e5ff", 
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
    detail: "A comprehensive vehicle lifecycle concierge tracking FASTag balances, live fuel price tracking, challan notifications, pollution check alerts, and one-click motor insurance renewals under CRED's direct IRDAI corporate-agency license.",
    revenueModel: "15%–20% brokerage commission on comprehensive car/bike insurance policies + FASTag recharge take rates",
    metrics: "4.5M+ Registered Vehicles • ₹500+ Cr Insurance Premiums"
  },
  { 
    name: "Kuvera Wealth Management", 
    category: "Investments & Advisory",
    share: 18, 
    color: "#b388ff", 
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    detail: "Acquired in 2024, Kuvera brings ₹50,000+ Cr in Assets Under Advisory across zero-commission direct mutual funds, Indian equities, Fixed Deposits, and US equities into the CRED ecosystem, turning CRED into a holistic balance-sheet manager.",
    revenueModel: "B2B platform fees, premium advisory tiers, high-yield fixed-income distribution margins",
    metrics: "₹50,000+ Cr AUM • 3.2M+ Investor Portfolios"
  },
  { 
    name: "CRED Pay, Store & Escapes", 
    category: "Commerce & Travel",
    share: 15, 
    color: "#ff3355", 
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
    detail: "CRED Pay powers online 1-click checkout across top D2C merchants, while CRED Escapes offers curated experiential luxury stays at 5-star properties (Taj, Oberoi, Marriott) with exclusive member perks and coin burn redemption.",
    revenueModel: "1%–3% merchant checkout take rate + 10%–20% hospitality commission on Escapes bookings",
    metrics: "1,200+ Brand Partners • 150K+ Luxury Stays Booked"
  },
];

export default function MonetizationEcosystem({ products = DEFAULT_PRODUCTS }) {
  const [selectedProduct, setSelectedProduct] = useState(0);

  const active = products[selectedProduct] || products[0];

  return (
    <section className="ecosystem-section" id="ecosystem">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow-pill">
            <Layers size={14} className="accent-green" />
            <span>MULTI-PILLAR MONETIZATION FLYWHEEL</span>
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
            <span className="rev-bar-note">Estimated segment distribution of ₹2,735 Cr operating revenue</span>
          </div>

          <div className="rev-stacked-bar">
            {products.map((p, idx) => (
              <div
                key={p.name}
                className={`rev-bar-chunk ${selectedProduct === idx ? "active-chunk" : ""}`}
                style={{ width: `${p.share}%`, backgroundColor: p.color }}
                onClick={() => setSelectedProduct(idx)}
                title={`${p.name}: ~${p.share}% of revenue`}
              >
                <span className="chunk-label">{p.share}%</span>
              </div>
            ))}
          </div>

          <div className="rev-legend-row">
            {products.map((p, idx) => (
              <button
                key={p.name}
                className={`rev-legend-btn ${selectedProduct === idx ? "active" : ""}`}
                onClick={() => setSelectedProduct(idx)}
              >
                <span className="legend-dot" style={{ backgroundColor: p.color }} />
                <span className="legend-name">{p.name}</span>
                <span className="legend-pct">({p.share}%)</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Selected Product Deep-Dive Spotlight Card */}
        <Reveal as="div" delay={100} className="card product-spotlight-card">
          <div className="spotlight-grid">
            {/* Left: Product Image & Badges */}
            <div className="spotlight-image-col">
              <div className="spotlight-img-wrap">
                <img 
                  src={active.image} 
                  alt={active.name} 
                  className="spotlight-real-img"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="spotlight-overlay-gradient" />
                <div className="spotlight-badge-cat" style={{ borderColor: active.color, color: active.color }}>
                  {active.category}
                </div>
              </div>
            </div>

            {/* Right: Detailed Breakdown & Revenue Mechanics */}
            <div className="spotlight-info-col">
              <div className="spotlight-header">
                <span className="spotlight-rev-share" style={{ color: active.color }}>
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
                  <span>View Financial Margins</span> <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Grid of All 4 Ecosystem Cards */}
        <div className="ecosystem-cards-grid">
          {products.map((p, idx) => (
            <Reveal
              as="div"
              key={p.name}
              delay={idx * 60}
              className={`card eco-tile-card ${selectedProduct === idx ? "selected" : ""}`}
              onClick={() => setSelectedProduct(idx)}
            >
              <div className="tile-thumb-wrap">
                <img src={p.image} alt={p.name} className="tile-thumb-img" />
                <span className="tile-share-pill" style={{ backgroundColor: p.color }}>{p.share}% Rev</span>
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
