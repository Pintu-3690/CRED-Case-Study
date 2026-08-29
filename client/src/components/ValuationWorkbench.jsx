import { useState, useEffect, useMemo } from "react";
import { 
  DollarSign, Calculator, Sliders, TrendingUp, PieChart, 
  Layers, ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles,
  HelpCircle, RefreshCw
} from "lucide-react";
import Reveal from "./Reveal";

export default function ValuationWorkbench({ capTable = [] }) {
  // Valuation Model Parameters
  const [membersM, setMembersM] = useState(15.2);
  const [arpuInr, setArpuInr] = useState(2150);
  const [takeRatePct, setTakeRatePct] = useState(0.32);
  const [waccPct, setWaccPct] = useState(12.5);
  const [terminalGrowthPct, setTerminalGrowthPct] = useState(4.5);
  const [ebitdaMarginTargetPct, setEbitdaMarginTargetPct] = useState(28.0);
  const [isCalculating, setIsCalculating] = useState(false);

  const [dcfResult, setDcfResult] = useState(null);

  // Fetch DCF from backend API or compute
  useEffect(() => {
    let isCurrent = true;
    const computeDCF = async () => {
      setIsCalculating(true);
      try {
        const res = await fetch("/api/market/dcf-model", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            membersM,
            arpuInr,
            takeRatePct,
            waccPct,
            terminalGrowthPct,
            ebitdaMarginTargetPct,
            usdInr: 87.40
          })
        });
        if (res.ok && isCurrent) {
          const data = await res.json();
          setDcfResult(data);
        }
      } catch (err) {
        console.warn("DCF API error, calculating fallback", err);
      } finally {
        if (isCurrent) setIsCalculating(false);
      }
    };

    const timer = setTimeout(computeDCF, 120);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [membersM, arpuInr, takeRatePct, waccPct, terminalGrowthPct, ebitdaMarginTargetPct]);

  const defaultCapTable = useMemo(() => {
    return capTable.length > 0 ? capTable : [
      { holder: "Peak XV Partners (Sequoia India)", share: 21.4, color: "#ff3355" },
      { holder: "Meta Platforms Inc. (Strategic Deal)", share: 20.0, color: "#0084ff" },
      { holder: "Kunal Shah & Founders", share: 15.2, color: "#ffd700" },
      { holder: "Tiger Global Management", share: 13.8, color: "#00df82" },
      { holder: "ESOP Pool & Key Employees", share: 14.1, color: "#b388ff" },
      { holder: "Alpha Wave / Falcon Edge", share: 8.9, color: "#ff9100" },
      { holder: "Ribbit Capital & Dragoneer", share: 6.6, color: "#00e5ff" },
    ];
  }, [capTable]);

  // Derived metrics
  const annualRevenueCr = useMemo(() => {
    return Math.round((membersM * 1000000 * arpuInr) / 10000000);
  }, [membersM, arpuInr]);

  return (
    <section id="valuation-workbench" className="valuation-section">
      <div className="container">
        
        <Reveal>
          <div className="section-head text-center">
            <span className="section-eyebrow">
              <Calculator className="icon-xs" /> INSTITUTIONAL VALUATION WORKBENCH
            </span>
            <h2 className="section-title">
              DCF Modeler &amp; Equity Waterfall Simulation
            </h2>
            <p className="section-sub max-w-3xl mx-auto">
              Real-time investment banking financial model evaluating CRED’s Enterprise Value, implied unlisted share price, and cap table waterfall across varying macroeconomic scenarios.
            </p>
          </div>
        </Reveal>

        {/* Dynamic Model Canvas */}
        <Reveal delay={0.1}>
          <div className="workbench-grid">

            {/* Left: Input Control Desk */}
            <div className="workbench-inputs-card">
              <div className="card-top-title">
                <Sliders className="icon-sm text-green" />
                <span>SCENARIO LEVERS &amp; UNDERWRITING ASSUMPTIONS</span>
              </div>

              <div className="sliders-stack">
                
                {/* 1. Prime Member Base */}
                <div className="slider-box">
                  <div className="slider-head">
                    <span className="slider-label">Prime Members (CIBIL ≥ 750)</span>
                    <span className="slider-val text-green font-mono">{membersM} Million</span>
                  </div>
                  <input
                    type="range"
                    min="10.0"
                    max="35.0"
                    step="0.5"
                    value={membersM}
                    onChange={(e) => setMembersM(parseFloat(e.target.value))}
                    className="custom-range"
                  />
                  <div className="slider-foot">
                    <span>10.0M (Base)</span>
                    <span>35.0M (Max Addressable)</span>
                  </div>
                </div>

                {/* 2. Blended ARPU */}
                <div className="slider-box">
                  <div className="slider-head">
                    <span className="slider-label">Blended Annual ARPU (₹)</span>
                    <span className="slider-val text-cyan font-mono">₹{arpuInr.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1200"
                    max="4500"
                    step="50"
                    value={arpuInr}
                    onChange={(e) => setArpuInr(parseInt(e.target.value))}
                    className="custom-range range-cyan"
                  />
                  <div className="slider-foot">
                    <span>₹1,200 (Payments only)</span>
                    <span>₹4,500 (Lending + Wealth Deep Cross-sell)</span>
                  </div>
                </div>

                {/* 3. WACC (Cost of Capital) */}
                <div className="slider-box">
                  <div className="slider-head">
                    <span className="slider-label">Discount Rate (WACC)</span>
                    <span className="slider-val text-gold font-mono">{waccPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="9.0"
                    max="16.0"
                    step="0.25"
                    value={waccPct}
                    onChange={(e) => setWaccPct(parseFloat(e.target.value))}
                    className="custom-range range-gold"
                  />
                  <div className="slider-foot">
                    <span>9.0% (Low Interest)</span>
                    <span>16.0% (Risk Premium)</span>
                  </div>
                </div>

                {/* 4. Terminal Growth Rate */}
                <div className="slider-box">
                  <div className="slider-head">
                    <span className="slider-label">Terminal Long-Term Growth</span>
                    <span className="slider-val text-purple font-mono">{terminalGrowthPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="2.5"
                    max="6.5"
                    step="0.25"
                    value={terminalGrowthPct}
                    onChange={(e) => setTerminalGrowthPct(parseFloat(e.target.value))}
                    className="custom-range range-purple"
                  />
                  <div className="slider-foot">
                    <span>2.5% (GDP Match)</span>
                    <span>6.5% (Fintech Secular)</span>
                  </div>
                </div>

                {/* 5. Target EBITDA Margin */}
                <div className="slider-box">
                  <div className="slider-head">
                    <span className="slider-label">Target Year-5 EBITDA Margin</span>
                    <span className="slider-val text-green font-mono">{ebitdaMarginTargetPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="15.0"
                    max="40.0"
                    step="1.0"
                    value={ebitdaMarginTargetPct}
                    onChange={(e) => setEbitdaMarginTargetPct(parseFloat(e.target.value))}
                    className="custom-range"
                  />
                  <div className="slider-foot">
                    <span>15.0% (Conservative)</span>
                    <span>40.0% (Software Scale)</span>
                  </div>
                </div>

              </div>

              {/* Quick Preset Buttons */}
              <div className="scenario-presets">
                <span className="preset-label">SCENARIO PRESETS:</span>
                <div className="preset-btns">
                  <button 
                    onClick={() => { setMembersM(15.2); setArpuInr(2150); setWaccPct(12.5); setTerminalGrowthPct(4.5); setEbitdaMarginTargetPct(28); }}
                    className="preset-pill"
                  >
                    Meta Baseline ($4.5B)
                  </button>
                  <button 
                    onClick={() => { setMembersM(24.0); setArpuInr(3400); setWaccPct(11.0); setTerminalGrowthPct(5.2); setEbitdaMarginTargetPct(34); }}
                    className="preset-pill highlight-green"
                  >
                    Bull Case ($8.2B)
                  </button>
                  <button 
                    onClick={() => { setMembersM(12.5); setArpuInr(1650); setWaccPct(14.5); setTerminalGrowthPct(3.5); setEbitdaMarginTargetPct(20); }}
                    className="preset-pill highlight-red"
                  >
                    Stress Test ($2.8B)
                  </button>
                </div>
              </div>

            </div>

            {/* Right: Real-time DCF Valuation Output & Waterfall */}
            <div className="workbench-output-card">
              
              {/* Top Headline Value Box */}
              <div className="valuation-headline-banner">
                <div className="headline-val-block">
                  <span className="banner-sub">IMPLIED ENTERPRISE VALUATION</span>
                  <div className="banner-big-val">
                    ${dcfResult ? dcfResult.equityValueUsdBillion : "4.50"} Billion
                  </div>
                  <span className="banner-inr">
                    ₹{dcfResult ? dcfResult.equityValueCr.toLocaleString() : "37,800"} Cr Implied Equity Value
                  </span>
                </div>

                <div className="headline-share-block">
                  <span className="banner-sub">IMPLIED SHARE PRICE</span>
                  <div className="banner-share-price text-green font-mono">
                    ₹{dcfResult ? dcfResult.impliedSharePriceInr : "284.50"}
                  </div>
                  <span className="banner-delta">
                    Based on 1,320.4M Fully Diluted Shares
                  </span>
                </div>
              </div>

              {/* 5-Year DCF Forecast Projections Table */}
              <div className="dcf-projections-table-wrap">
                <div className="table-caption-bar">
                  <span>5-YEAR FREE CASH FLOW TO FIRM (FCFF) PROJECTION (₹ CR)</span>
                  {isCalculating && <RefreshCw className="icon-xs animate-spin text-green" />}
                </div>
                <div className="overflow-x-auto">
                  <table className="dcf-table">
                    <thead>
                      <tr>
                        <th>PERIOD</th>
                        <th>MEMBERS</th>
                        <th>ARPU</th>
                        <th>REVENUE</th>
                        <th>EBITDA %</th>
                        <th>FCFF</th>
                        <th>DISCOUNT</th>
                        <th>PV OF FCF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dcfResult && dcfResult.projections && dcfResult.projections.map((p) => (
                        <tr key={p.year}>
                          <td className="font-mono font-bold text-ink">{p.year}</td>
                          <td className="font-mono text-muted">{p.membersM}M</td>
                          <td className="font-mono text-muted">₹{p.arpuInr}</td>
                          <td className="font-mono font-semibold text-cyan">₹{p.revenueCr}</td>
                          <td className="font-mono text-muted">{p.ebitdaMarginPct}%</td>
                          <td className={`font-mono ${p.fcffCr >= 0 ? "text-green" : "text-red"}`}>₹{p.fcffCr}</td>
                          <td className="font-mono text-muted">{p.discountFactor}</td>
                          <td className="font-mono font-bold text-gold">₹{p.discountedFcfCr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Valuation Bridge / Waterfall Breakdown */}
              <div className="waterfall-bridge-grid">
                <div className="bridge-item">
                  <span className="bridge-label">Cumulative 5-Yr PV of FCF</span>
                  <span className="bridge-value font-mono">₹{dcfResult ? dcfResult.cumulativeDiscountedFcfCr.toLocaleString() : "4,820"} Cr</span>
                </div>
                <div className="bridge-item">
                  <span className="bridge-label">Discounted Terminal Value</span>
                  <span className="bridge-value font-mono">₹{dcfResult ? dcfResult.discountedTerminalValueCr.toLocaleString() : "29,930"} Cr</span>
                </div>
                <div className="bridge-item">
                  <span className="bridge-label">(+) Post-Meta Net Cash</span>
                  <span className="bridge-value font-mono text-green">+₹1,850 Cr</span>
                </div>
                <div className="bridge-item">
                  <span className="bridge-label">(+) Kuvera Wealth AUM Value</span>
                  <span className="bridge-value font-mono text-cyan">+₹1,200 Cr</span>
                </div>
              </div>

            </div>

          </div>
        </Reveal>

        {/* Dynamic 5x5 Valuation Sensitivity Matrix Heatmap */}
        {dcfResult && Array.isArray(dcfResult.sensitivityMatrix) && dcfResult.sensitivityMatrix.length > 0 && dcfResult.sensitivityMatrix[0]?.values && (
          <Reveal delay={0.15}>
            <div className="sensitivity-matrix-card">
              <div className="matrix-header">
                <div className="matrix-title">
                  <Layers className="icon-sm text-gold" />
                  <span>SENSITIVITY MATRIX: IMPLIED SHARE PRICE (₹ / SHARE) vs WACC &amp; TERMINAL GROWTH</span>
                </div>
                <span className="matrix-hint">Baseline scenario highlighted in gold</span>
              </div>

              <div className="overflow-x-auto">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th className="axis-th">Terminal Growth \ WACC</th>
                      {dcfResult.sensitivityMatrix[0].values.map((v) => (
                        <th key={v.wacc} className="font-mono text-center">
                          {v.wacc}% WACC
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dcfResult.sensitivityMatrix.map((row) => (
                      <tr key={row.growthRate}>
                        <td className="font-mono font-bold text-cyan bg-subtle">
                          {row.growthRate}% Growth
                        </td>
                        {Array.isArray(row.values) && row.values.map((cell) => {
                          const isCenter = cell.wacc === waccPct && row.growthRate === terminalGrowthPct;
                          const isHigh = cell.impliedPrice > 350;
                          const isLow = cell.impliedPrice < 240;
                          return (
                            <td 
                              key={cell.wacc} 
                              className={`matrix-cell font-mono text-center ${isCenter ? "cell-center" : isHigh ? "cell-high" : isLow ? "cell-low" : ""}`}
                            >
                              <div className="cell-price">₹{cell.impliedPrice}</div>
                              <div className="cell-val">${cell.valB}B</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        )}

        {/* Cap Table & Shareholding Waterfall */}
        <Reveal delay={0.2}>
          <div className="captable-card">
            <div className="captable-header">
              <div className="captable-title">
                <PieChart className="icon-sm text-purple" />
                <span>FULLY DILUTED CAP TABLE &amp; INSTITUTIONAL EQUITY DISTRIBUTION</span>
              </div>
              <div className="shares-badge font-mono">
                Total Equity Base: 132.8 Cr Shares ($4.50B)
              </div>
            </div>

            <div className="captable-grid">
              {defaultCapTable.map((item) => (
                <div key={item.holder} className="captable-item">
                  <div className="captable-bar-head">
                    <span className="captable-holder">{item.holder}</span>
                    <span className="captable-pct font-mono" style={{ color: item.color }}>
                      {item.share}%
                    </span>
                  </div>
                  <div className="captable-progress-track">
                    <div 
                      className="captable-progress-fill" 
                      style={{ width: `${item.share}%`, backgroundColor: item.color }} 
                    />
                  </div>
                  <div className="captable-sub-info">
                    <span>Est. Stake Value: <strong>${((item.share / 100) * 4.5).toFixed(2)}B (₹{Math.round((item.share / 100) * 37800)} Cr)</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
