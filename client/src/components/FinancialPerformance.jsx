import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Layers, ArrowDownRight } from "lucide-react";
import Reveal from "./Reveal";
import "../chartSetup";

export default function FinancialPerformance({ financials, arpu, unitEconomics = [] }) {
  const [finView, setFinView] = useState("scale"); // "scale" | "margin"

  if (!financials || !arpu) return null;

  const operatingMarginPct = financials.years.map((_, i) => {
    const rev = financials.operatingRevenue[i] || 1;
    const loss = financials.operatingLoss[i] || 0;
    return Number(((-loss / rev) * 100).toFixed(1));
  });

  const esopMarginPct = financials.years.map((_, i) => {
    const rev = financials.operatingRevenue[i] || 1;
    const netLoss = financials.totalNetLoss[i] || 0;
    return Number(((-netLoss / rev) * 100).toFixed(1));
  });

  const finData =
    finView === "scale"
      ? {
          labels: financials.years,
          datasets: [
            {
              label: "Operating Revenue (₹ Cr)",
              data: financials.operatingRevenue,
              backgroundColor: "#10b981",
              borderRadius: 6,
              barThickness: 24,
            },
            {
              label: "Operating Loss (₹ Cr)",
              data: financials.operatingLoss,
              backgroundColor: "#ef4444",
              borderRadius: 6,
              barThickness: 24,
            },
            {
              label: "Total Net Loss (₹ Cr - incl. ESOP)",
              data: financials.totalNetLoss,
              backgroundColor: "#64748b",
              borderRadius: 6,
              barThickness: 24,
            },
          ],
        }
      : {
          labels: financials.years,
          datasets: [
            {
              label: "Operating Margin (%)",
              data: operatingMarginPct,
              backgroundColor: "#38bdf8",
              borderRadius: 6,
              barThickness: 28,
            },
            {
              label: "Net Margin incl. ESOP (%)",
              data: esopMarginPct,
              backgroundColor: "#64748b",
              borderRadius: 6,
              barThickness: 28,
            },
          ],
        };

  const finOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: "easeOutQuart" },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#9ca3af",
          font: { family: "Plus Jakarta Sans", size: 11 },
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(14, 16, 22, 0.96)",
        borderColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        titleColor: "#f3f4f6",
        callbacks: {
          label: (ctx) =>
            finView === "scale"
              ? `${ctx.dataset.label}: ₹${ctx.parsed.y} Cr`
              : `${ctx.dataset.label}: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af", font: { family: "Plus Jakarta Sans", size: 11 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.06)" },
        title: {
          display: true,
          text: finView === "scale" ? "₹ in Crores (INR)" : "Operating Margin %",
          color: "#8a8f9e",
        },
        ticks: {
          color: "#9ca3af",
          font: { family: "JetBrains Mono", size: 11 },
          callback: (val) => (finView === "scale" ? `₹${val}` : `${val}%`),
        },
      },
    },
  };

  const arpuData = {
    labels: arpu.labels,
    datasets: [
      {
        label: "Annual ARPU (₹ / year)",
        data: arpu.values,
        backgroundColor: ["#10b981", "#38bdf8", "#a78bfa", "#d4af37", "#ef4444"],
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  const arpuOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(14, 16, 22, 0.96)",
        borderColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        callbacks: { label: (ctx) => `Annual ARPU: ₹${ctx.parsed.x} / year` },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.06)" },
        title: { display: true, text: "Annual Revenue Per User (INR ₹)", color: "#8a8f9e" },
        ticks: { color: "#9ca3af", font: { family: "JetBrains Mono", size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#f3f4f6", font: { family: "Plus Jakarta Sans", size: 12, weight: "600" } },
      },
    },
  };

  return (
    <section className="financials-section" id="financials">
      <div className="container">
        <Reveal className="section-head">
          <div className="editorial-kicker">
            <span>11</span>
            <span aria-hidden="true">·</span>
            <span>Financial Audit &amp; Unit Economics</span>
          </div>
          <h2>Accelerating Top-Line Growth Paired with 51% Burn Reduction</h2>
          <p>
            Audited financial trajectory (FY23&ndash;FY25), unit economics, and benchmark ARPU dominance.
          </p>
        </Reveal>

        <div className="fin-grid">
          <Reveal as="div" className="card fin-card">
            <div className="fin-card-head">
              <div>
                <h3>Revenue Trajectory vs. Operating Burn (FY23&ndash;FY25)</h3>
                <p className="desc">16% revenue growth alongside a 51.1% contraction in operating losses.</p>
              </div>
              <div className="fin-head-right">
                <div className="segmented-control compact" role="tablist" aria-label="Financial chart mode">
                  <button
                    role="tab"
                    aria-selected={finView === "scale"}
                    className={`seg-btn ${finView === "scale" ? "active" : ""}`}
                    onClick={() => setFinView("scale")}
                  >
                    INR Cr
                  </button>
                  <button
                    role="tab"
                    aria-selected={finView === "margin"}
                    className={`seg-btn ${finView === "margin" ? "active" : ""}`}
                    onClick={() => setFinView("margin")}
                  >
                    Margin %
                  </button>
                </div>
                <span className="fin-badge-highlight accent-green tabular-nums">
                  <ArrowDownRight size={14} /> 51.1% Loss Reduction
                </span>
              </div>
            </div>

            <div className="chart-box" style={{ height: 320 }}>
              <Bar data={finData} options={finOptions} />
            </div>

            <div className="fin-takeaway-box">
              <strong>Key Audit Insight:</strong> {financials.takeaway}
            </div>
          </Reveal>

          <Reveal as="div" delay={80} className="card fin-card">
            <div className="fin-card-head">
              <div>
                <h3>Indian FinTech ARPU Benchmark (₹ / year)</h3>
                <p className="desc">Gated prime cohort produces 22x higher ARPU than mass UPI utilities.</p>
              </div>
              <span className="fin-badge-highlight accent-gold tabular-nums">
                ₹2,150 Top Tier ARPU
              </span>
            </div>

            <div className="chart-box" style={{ height: 320 }}>
              <Bar data={arpuData} options={arpuOptions} />
            </div>

            <div className="fin-takeaway-box">
              <strong>Cohort Leverage:</strong> {arpu.takeaway}
            </div>
          </Reveal>
        </div>

        {unitEconomics && unitEconomics.length > 0 && (
          <Reveal as="div" delay={100} className="card unit-econ-card">
            <div className="unit-econ-head">
              <div className="unit-title-wrap">
                <Layers size={18} className="accent-cyan" />
                <h3>CRED Unit Economics vs. Mass FinTech Industry</h3>
              </div>
              <span className="unit-tagline">Why high-trust cohorts generate superior margin profiles</span>
            </div>

            <div className="unit-table-responsive">
              <table className="unit-table tabular-nums">
                <thead>
                  <tr>
                    <th>Unit Economic Metric</th>
                    <th>CRED Metric (Prime 750+)</th>
                    <th>Mass FinTech Benchmark</th>
                    <th>Structural Strategic Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  {unitEconomics.map((row) => (
                    <tr key={row.metric}>
                      <td className="metric-col"><strong>{row.metric}</strong></td>
                      <td className="cred-val-col"><span className="badge-cred-metric">{row.cred}</span></td>
                      <td className="ind-val-col">{row.industry}</td>
                      <td className="adv-col">{row.advantage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
