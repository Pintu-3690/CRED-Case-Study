import { useState } from "react";
import { Check, ShieldCheck, Zap, ArrowUpRight, TrendingUp, Sparkles } from "lucide-react";
import Reveal from "./Reveal";

export default function Competition({ competitors, outlook }) {
  if (!competitors || !outlook) return null;

  return (
    <section className="competition-section" id="competition">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow-pill">
            <TrendingUp size={14} className="accent-cyan" />
            <span>BENCHMARK MATRIX</span>
          </div>
          <h2>Competitive Positioning vs. Indian FinTech Giants</h2>
          <p>{competitors.note}</p>
        </Reveal>

        <div className="comp-outlook-grid">
          {/* Left: Comparison Table */}
          <Reveal as="div" className="card comp-table-card">
            <div className="comp-table-responsive">
              <table className="comp-table">
                <thead>
                  <tr>
                    {competitors.headers.map((h, i) => (
                      <th key={h} className={i === 1 ? "cred-th-highlight" : ""}>
                        {i === 1 && <span className="cred-star">★ </span>}
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitors.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={ci === 1 ? "cred-td-highlight" : ""}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* Right: Meta Strategic Outlook Card */}
          <Reveal as="div" delay={100} className="card outlook-card">
            <div className="outlook-header">
              <span className="outlook-badge-pill">{outlook.badge}</span>
              <h3>{outlook.title}</h3>
              <p className="outlook-body-text">{outlook.body}</p>
            </div>

            <div className="outlook-points-stack">
              {outlook.points.map((p) => (
                <div className="outlook-item" key={p.title}>
                  <div className="outlook-item-head">
                    <Sparkles size={14} className="accent-green" />
                    <strong>{p.title}</strong>
                  </div>
                  <p>{p.detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
