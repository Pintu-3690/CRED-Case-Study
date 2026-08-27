import { useState } from "react";
import { Line } from "react-chartjs-2";
import { Sparkles, DollarSign, Award, ArrowUpRight, TrendingUp } from "lucide-react";
import Reveal from "./Reveal";
import "../chartSetup";

export default function ValuationTimeline({ timeline = [], totalRaised = "$1.84B+" }) {
  const [active, setActive] = useState(timeline.length - 1);

  const activeItem = timeline[active] || timeline[0];

  const data = {
    labels: timeline.map((t) => `${t.year}\n${t.round}`),
    datasets: [
      {
        label: "Enterprise Valuation ($ Billion USD)",
        data: timeline.map((t) => t.valuation),
        borderColor: "#00df82",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 360);
          gradient.addColorStop(0, "rgba(0, 223, 130, 0.3)");
          gradient.addColorStop(1, "rgba(0, 223, 130, 0.01)");
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#08080a",
        pointBorderColor: "#00df82",
        pointBorderWidth: 2.5,
        pointRadius: (ctx) => (ctx.dataIndex === active ? 9 : 5),
        pointHoverRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
    onClick: (_evt, elements) => {
      if (elements?.length) setActive(elements[0].index);
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(18, 20, 26, 0.95)",
        borderColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        titleColor: "#f3f2ee",
        bodyColor: "#00df82",
        callbacks: {
          label: (ctx) => `Valuation: $${ctx.parsed.y} Billion USD`,
        },
      },
    },
    scales: {
      x: { 
        grid: { color: "rgba(255,255,255,0.03)" }, 
        ticks: { color: "#a7a7ad", font: { family: "Inter", size: 10.5 } } 
      },
      y: {
        grid: { color: "rgba(255,255,255,0.06)" },
        title: { display: true, text: "Valuation ($ Billion USD)", color: "#8a8a92" },
        ticks: { 
          color: "#a7a7ad", 
          font: { family: "JetBrains Mono", size: 11 },
          callback: (v) => `$${v}B` 
        },
      },
    },
  };

  return (
    <section className="timeline-section" id="valuation-history">
      <div className="container">
        <Reveal className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="eyebrow-pill">
              <TrendingUp size={14} className="accent-green" />
              <span>CAPITALIZATION HISTORY</span>
            </div>
            <h2>Seed to $6.4B Peak &amp; $4.5B Meta Series H</h2>
            <p>
              Tracking CRED&rsquo;s funding trajectory across 8 institutional rounds backed by Sequoia (Peak XV), 
              Tiger Global, GIC, and Meta.
            </p>
          </div>
          <span className="total-raised-badge">Total Raised: <strong>{totalRaised}</strong></span>
        </Reveal>

        <div className="timeline-grid">
          {/* Main Chart Card */}
          <Reveal as="div" className="card timeline-chart-card">
            <div className="timeline-chart-head">
              <h3>Enterprise Valuation Progression ($B)</h3>
              <span className="chart-tip">Click any point to view round intelligence</span>
            </div>
            <div className="chart-box" style={{ height: 350 }}>
              <Line data={data} options={options} />
            </div>
          </Reveal>

          {/* Right: Selected Round Highlight & Milestone List */}
          <Reveal as="div" delay={100} className="card timeline-milestone-card">
            <div className="active-round-banner">
              <div className="active-round-top">
                <span className="active-round-tag">{activeItem.round} &bull; {activeItem.year}</span>
                <span className="active-round-val accent-green">${activeItem.valuation}B</span>
              </div>
              {activeItem.lead && (
                <div className="active-round-lead">
                  <strong>Lead Investor(s):</strong> {activeItem.lead}
                </div>
              )}
              {activeItem.raised && (
                <div className="active-round-raised">
                  <strong>Capital Injected:</strong> {activeItem.raised}
                </div>
              )}
              <p className="active-round-note">{activeItem.note}</p>
            </div>

            <h4 className="milestone-list-title">All Funding Rounds</h4>
            <div className="milestone-scroll-list">
              {timeline.map((t, i) => (
                <div
                  key={`${t.year}-${t.round}`}
                  className={`milestone-item ${i === active ? "active" : ""}`}
                  onClick={() => setActive(i)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="ms-left">
                    <span className="ms-year">{t.year}</span>
                    <span className="ms-round">{t.round}</span>
                  </div>
                  <span className="ms-val">${t.valuation}B</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
