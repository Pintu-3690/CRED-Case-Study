import { useState } from "react";
import { ShieldAlert, Zap, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";

const QUADRANTS = [
  { key: "strengths", label: "Strengths (Internal)", color: "#00df82", icon: Zap },
  { key: "weaknesses", label: "Weaknesses (Internal)", color: "#ff3355", icon: AlertTriangle },
  { key: "opportunities", label: "Opportunities (External)", color: "#00e5ff", icon: TrendingUp },
  { key: "threats", label: "Threats (External)", color: "#ffd700", icon: ShieldAlert },
];

export default function Swot({ swot }) {
  const [activeTab, setActiveTab] = useState("all");

  if (!swot) return null;

  return (
    <div className="swot-section-wrapper">
      <Reveal className="section-head">
        <div className="eyebrow-pill">
          <Zap size={14} className="accent-green" />
          <span>STRATEGIC AUDIT</span>
        </div>
        <h2>SWOT Analysis</h2>
        <p>Comprehensive evaluation of CRED&rsquo;s internal competitive assets and external market risks.</p>
      </Reveal>

      {/* Tab Filter */}
      <div className="swot-filter-bar">
        <button
          className={`swot-tab-pill ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Quadrants
        </button>
        {QUADRANTS.map((q) => (
          <button
            key={q.key}
            className={`swot-tab-pill ${activeTab === q.key ? "active" : ""}`}
            onClick={() => setActiveTab(q.key)}
          >
            <span className="dot" style={{ backgroundColor: q.color }} />
            {q.label.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="swot-grid-v2">
        {QUADRANTS.filter((q) => activeTab === "all" || activeTab === q.key).map((q, i) => {
          const IconComp = q.icon;
          return (
            <Reveal as="div" key={q.key} delay={i * 60} className={`card swot-card-v2 ${q.key}`}>
              <div className="swot-card-head" style={{ borderLeftColor: q.color }}>
                <div className="swot-icon-badge" style={{ backgroundColor: `rgba(${q.color === "#00df82" ? "0,223,130" : q.color === "#ff3355" ? "255,51,85" : q.color === "#00e5ff" ? "0,229,255" : "255,215,0"}, 0.15)`, color: q.color }}>
                  <IconComp size={18} />
                </div>
                <h3 style={{ color: q.color }}>{q.label}</h3>
              </div>

              <ul className="swot-points-list">
                {swot[q.key].map((point, pIdx) => (
                  <li key={pIdx}>
                    <span className="swot-bullet" style={{ backgroundColor: q.color }} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
