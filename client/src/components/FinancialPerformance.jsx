import { Bar } from "react-chartjs-2";
import { TrendingUp, TrendingDown, DollarSign, Percent, ShieldCheck, ArrowDownRight, Layers } from "lucide-react";
import Reveal from "./Reveal";
import "../chartSetup";

export default function FinancialPerformance({ financials, arpu, unitEconomics = [] }) {
  if (!financials || !arpu) return null;

  const finData = {
    labels: financials.years,
    datasets: [
      {
        label: "Operating Revenue (₹ Cr)",
        data: financials.operatingRevenue,
        backgroundColor: "#00df82",
        borderRadius: 6,
        barThickness: 24,
      },
      {
        label: "Operating Loss (₹ Cr)",
        data: financials.operatingLoss,
        backgroundColor: "#ff3355",
        borderRadius: 6,
        barThickness: 24,
      },
      {
        label: "Total Net Loss (₹ Cr - incl. ESOP)",
        data: financials.totalNetLoss,
        backgroundColor: "#5c5c66",
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };

  const finOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#a7a7ad", font: { family: "Inter", size: 11 }, boxWidth: 12, padding: 16 },
      },
      tooltip: {
        backgroundColor: "rgba(18, 20, 26, 0.95)",
        borderColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        titleColor: "#f3f2ee",
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ₹${ctx.parsed.y} Cr`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#a7a7ad", font: { family: "Inter", size: 11 } } },
      y: {
        grid: { color: "rgba(255,255,255,0.06)" },
        title: { display: true, text: "₹ in Crores (INR)", color: "#8a8a92" },
        ticks: { color: "#a7a7ad", font: { family: "JetBrains Mono", size: 11 } },
      },
    },
  };

  const arpuData = {
    labels: arpu.labels,
    datasets: [
      {
        label: "Annual ARPU (₹ / year)",
        data: arpu.values,
        backgroundColor: ["#00df82", "#00e5ff", "#b388ff", "#ffd700", "#ff3355"],
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  const arpuOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(18, 20, 26, 0.95)",
        borderColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        callbacks: { label: (ctx) => `Annual ARPU: ₹${ctx.parsed.x} / year` },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.06)" },
        title: { display: true, text: "Annual Revenue Per User (INR ₹)", color: "#8a8a92" },
        ticks: { color: "#a7a7ad", font: { family: "JetBrains Mono", size: 11 } },
      },
      y: { grid: { display: false }, ticks: { color: "#f3f2ee", font: { family: "Inter", size: 12, weight: "600" } } },
    },
  };

  return (
    <section className="financials-section" id="financials">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow-pill">
            <DollarSign size={14} className="accent-gold" />
            <span>FINANCIAL AUDIT &amp; UNIT ECONOMICS</span>
          </div>
          <h2>Accelerating Top-Line Growth Paired with 51% Burn Reduction</h2>
          <p>
            Detailed analysis of CRED&rsquo;s audited trajectory (FY23–FY25), unit economics, and benchmark ARPU dominance.
          </p>
        </Reveal>

        {/* Charts Grid */}
        <div className="fin-grid">
          {/* Financial Trajectory Bar Chart */}
          <Reveal as="div" className="card fin-card">
            <div className="fin-card-head">
              <div>
                <h3>Revenue Trajectory vs. Operating Loss (FY23&ndash;FY25)</h3>
                <p className="desc">16% revenue growth alongside a 51.1% contraction in operating losses.</p>
              </div>
              <span className="fin-badge-highlight accent-green">
                <ArrowDownRight size={14} /> 51.1% Loss Reduction
              </span>
            </div>

            <div className="chart-box" style={{ height: 320 }}>
              <Bar data={finData} options={finOptions} />
            </div>

            <div className="fin-takeaway-box">
              <strong>Key Audit Insight:</strong> {financials.takeaway}
            </div>
          </Reveal>

          {/* ARPU Benchmark Chart */}
          <Reveal as="div" delay={100} className="card fin-card">
            <div className="fin-card-head">
              <div>
                <h3>Indian FinTech ARPU Benchmark (₹ / year)</h3>
                <p className="desc">Gated prime cohort produces 22x higher ARPU than mass UPI utilities.</p>
              </div>
              <span className="fin-badge-highlight accent-gold">
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

        {/* Unit Economics Deep Dive Table */}
        {unitEconomics && unitEconomics.length > 0 && (
          <Reveal as="div" delay={120} className="card unit-econ-card">
            <div className="unit-econ-head">
              <div className="unit-title-wrap">
                <Layers size={18} className="accent-cyan" />
                <h3>CRED Unit Economics vs. Mass FinTech Industry</h3>
              </div>
              <span className="unit-tagline">Why high-trust cohorts generate superior margin profiles</span>
            </div>

            <div className="unit-table-responsive">
              <table className="unit-table">
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
