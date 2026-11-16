import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Reveal from "./Reveal";

const CATEGORIES = [
  { id: "all", label: "All Metrics" },
  { id: "volume", label: "Volume & Scale" },
  { id: "monetization", label: "Monetization & ARPU" },
  { id: "efficiency", label: "Loss Reduction & Risk" },
  { id: "valuation", label: "Valuation & Capital" },
];

export default function KpiDashboard({ kpis = [] }) {
  const [activeCat, setActiveCat] = useState("all");

  const filteredKpis = activeCat === "all"
    ? kpis
    : kpis.filter((k) => k.category === activeCat);

  return (
    <section className="kpi-section" id="kpis">
      <div className="container">
        <Reveal className="section-head">
          <div className="editorial-kicker">
            <span>07</span>
            <span aria-hidden="true">·</span>
            <span>Executive Key Performance Indicators</span>
          </div>
          <h2>The Numbers Driving India&rsquo;s High-ARPU Fintech</h2>
          <p>
            FY25 performance across total payment volume, top-line operating revenue,
            rapidly narrowing operating burn, and enterprise valuation.
          </p>
        </Reveal>

        {/* Filter Controls */}
        <div className="kpi-filter-bar">
          <div className="filter-pills-list">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`kpi-filter-btn ${activeCat === cat.id ? "active" : ""}`}
                onClick={() => setActiveCat(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="kpi-grid">
          {filteredKpis.map((k, i) => (
            <Reveal as="div" key={k.id} delay={i * 40} className="card kpi-card-enhanced">
              <div className="kpi-top-row">
                <span className="kpi-label">{k.label}</span>
                <span className="kpi-period-tag">{k.period || "FY25 Audited"}</span>
              </div>

              <div className="kpi-value-row">
                <span className="kpi-value-str tabular-nums">{k.value}</span>
              </div>

              <div className={`kpi-delta-tag tabular-nums ${k.trend}`}>
                {k.trend === "down-good" || k.trend === "up" ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                <span>{k.delta}</span>
              </div>

              <div className="kpi-footer-note">
                <p>{k.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
