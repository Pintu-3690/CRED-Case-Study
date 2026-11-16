import { useState, useEffect, useMemo } from "react";
import { Sliders, Layers, PieChart, RefreshCw } from "lucide-react";
import Reveal from "./Reveal";

const TOTAL_SHARES_M = 1320.4;

export default function ValuationWorkbench({
  capTable = [],
  credQuote = { price: 284.50 },
  usdInrRate = 87.42
}) {
  const [membersM, setMembersM] = useState(15.2);
  const [arpuInr, setArpuInr] = useState(2150);
  const [takeRatePct] = useState(0.32);
  const [waccPct, setWaccPct] = useState(12.5);
  const [terminalGrowthPct, setTerminalGrowthPct] = useState(4.5);
  const [ebitdaMarginTargetPct, setEbitdaMarginTargetPct] = useState(28.0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [dcfResult, setDcfResult] = useState(null);

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
            usdInr: Number(usdInrRate.toFixed(2))
          })
        });
        if (res.ok && isCurrent) {
          const data = await res.json();
          setDcfResult(data);
        }
      } catch (err) {
        console.warn("DCF API error, using baseline fallback", err);
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
    return capTable.length > 0
      ? capTable
      : [
          { holder: "Peak XV Partners (Sequoia India)", share: 21.4, color: "#ff3355" },
          { holder: "Meta Platforms Inc. (Strategic Deal)", share: 20.0, color: "#0084ff" },
          { holder: "Kunal Shah & Founders", share: 15.2, color: "#ffd700" },
          { holder: "Tiger Global Management", share: 13.8, color: "#00df82" },
          { holder: "ESOP Pool & Key Employees", share: 14.1, color: "#b388ff" },
          { holder: "Alpha Wave / Falcon Edge", share: 8.9, color: "#ff9100" },
          { holder: "Ribbit Capital & Dragoneer", share: 6.6, color: "#00e5ff" },
        ];
  }, [capTable]);

  const liveOtcPrice = credQuote?.price || 284.50;
  const modeledEquityUsdB = dcfResult ? dcfResult.equityValueUsdBillion : 4.50;
  const modeledEquityInrCr = dcfResult ? dcfResult.equityValueCr : Math.round((liveOtcPrice * TOTAL_SHARES_M) / 10);
  const modeledSharePrice = dcfResult ? dcfResult.impliedSharePriceInr : liveOtcPrice.toFixed(2);

  return (
    <section id="valuation-workbench" className="valuation-section">
      <div className="container">
        <Reveal className="section-head">
          <div className="editorial-kicker">
            <span>04</span>
            <span aria-hidden="true">·</span>
            <span>Institutional Valuation Workbench</span>
          </div>
          <h2>DCF Modeler &amp; Equity Waterfall Simulation</h2>
          <p>
            Interactive five-year Free Cash Flow to Firm (FCFF) model testing CRED&rsquo;s Enterprise Value,
            implied per-share value across 132.04 Crore diluted shares, and stakeholder equity waterfall.
          </p>
        </Reveal>

        <Reveal delay={60}>
          <div className="workbench-grid">
            {/* Left: Input Control Desk */}
            <div className="workbench-inputs-card">
              <div className="card-top-title">
                <Sliders className="icon-sm text-green" />
                <span>Scenario Levers &amp; Underwriting Assumptions</span>
              </div>

              <div className="sliders-stack">
                <div className="slider-box">
                  <div className="slider-head">
                    <span className="slider-label">Prime Members (CIBIL ≥ 750)</span>
                    <span className="slider-val text-green font-mono tabular-nums">{membersM}M</span>
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
                    <span>35.0M (Addressable)</span>
                  </div>
                </div>

                <div className="slider-box">
                  <div className="slider-head">
                    <span className="slider-label">Blended Annual ARPU (₹)</span>
                    <span className="slider-val text-cyan font-mono tabular-nums">
                      ₹{arpuInr.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1200"
                    max="4500"
                    step="50"
                    value={arpuInr}
                    onChange={(e) => setArpuInr(parseInt(e.target.value, 10))}
                    className="custom-range range-cyan"
                  />
                  <div className="slider-foot">
                    <span>₹1,200 (Payments)</span>
                    <span>₹4,500 (Lending + Wealth)</span>
                  </div>
                </div>

                <div className="slider-box">
                  <div className="slider-head">
                    <span className="slider-label">Discount Rate (WACC)</span>
                    <span className="slider-val text-gold font-mono tabular-nums">{waccPct}%</span>
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
                    <span>9.0% (Lower Cost)</span>
                    <span>16.0% (Risk Premium)</span>
                  </div>
                </div>

                <div className="slider-box">
                  <div className="slider-head">
                    <span className="slider-label">Terminal Long-Term Growth</span>
                    <span className="slider-val text-purple font-mono tabular-nums">{terminalGrowthPct}%</span>
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
                    <span>2.5% (Conservative)</span>
                    <span>6.5% (Secular Growth)</span>
                  </div>
                </div>

                <div className="slider-box">
                  <div className="slider-head">
                    <span className="slider-label">Target Year-5 EBITDA Margin</span>
                    <span className="slider-val text-green font-mono tabular-nums">{ebitdaMarginTargetPct}%</span>
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
                    <span>40.0% (Operating Leverage)</span>
                  </div>
                </div>
              </div>

              <div className="scenario-presets">
                <span className="preset-label">Scenario Presets</span>
                <div className="preset-btns">
                  <button
                    onClick={() => {
                      setMembersM(15.2);
                      setArpuInr(2150);
                      setWaccPct(12.5);
                      setTerminalGrowthPct(4.5);
                      setEbitdaMarginTargetPct(28);
                    }}
                    className="preset-pill"
                  >
                    FY25 Base Case
                  </button>
                  <button
                    onClick={() => {
                      setMembersM(24.0);
                      setArpuInr(3400);
                      setWaccPct(11.0);
                      setTerminalGrowthPct(5.2);
                      setEbitdaMarginTargetPct(34);
                    }}
                    className="preset-pill highlight-green"
                  >
                    Lending + Wealth Bull
                  </button>
                  <button
                    onClick={() => {
                      setMembersM(12.5);
                      setArpuInr(1650);
                      setWaccPct(14.5);
                      setTerminalGrowthPct(3.5);
                      setEbitdaMarginTargetPct(20);
                    }}
                    className="preset-pill highlight-red"
                  >
                    Macro Stress Test
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Real-time DCF Valuation Output & Waterfall */}
            <div className="workbench-output-card">
              <div className="valuation-headline-banner">
                <div className="headline-val-block">
                  <span className="banner-sub">Modeled Equity Valuation</span>
                  <div className="banner-big-val tabular-nums">
                    ${Number(modeledEquityUsdB).toFixed(2)} Billion
                  </div>
                  <span className="banner-inr tabular-nums">
                    ₹{modeledEquityInrCr.toLocaleString("en-IN")} Cr Implied Equity Value
                  </span>
                </div>

                <div className="headline-share-block">
                  <span className="banner-sub">DCF Implied Share Price (vs. ₹{liveOtcPrice.toFixed(2)} Live OTC)</span>
                  <div className="banner-share-price text-green font-mono tabular-nums">
                    ₹{modeledSharePrice}
                  </div>
                  <span className="banner-delta tabular-nums">
                    Across 1,320.4M (132.04 Cr) Diluted Shares
                  </span>
                </div>
              </div>

              <div className="dcf-projections-table-wrap">
                <div className="table-caption-bar">
                  <span>5-Year Free Cash Flow to Firm (FCFF) Projection (₹ Cr)</span>
                  {isCalculating && <RefreshCw className="icon-xs animate-spin text-green" />}
                </div>
                <div className="overflow-x-auto">
                  <table className="dcf-table tabular-nums">
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Members</th>
                        <th>ARPU</th>
                        <th>Revenue</th>
                        <th>EBITDA %</th>
                        <th>FCFF</th>
                        <th>Discount</th>
                        <th>PV of FCF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dcfResult &&
                        dcfResult.projections &&
                        dcfResult.projections.map((p) => (
                          <tr key={p.year}>
                            <td className="font-mono font-bold text-ink">{p.year}</td>
                            <td className="font-mono text-muted">{p.membersM}M</td>
                            <td className="font-mono text-muted">₹{p.arpuInr}</td>
                            <td className="font-mono font-semibold text-cyan">₹{p.revenueCr}</td>
                            <td className="font-mono text-muted">{p.ebitdaMarginPct}%</td>
                            <td className={`font-mono ${p.fcffCr >= 0 ? "text-green" : "text-red"}`}>
                              ₹{p.fcffCr}
                            </td>
                            <td className="font-mono text-muted">{p.discountFactor}</td>
                            <td className="font-mono font-bold text-gold">₹{p.discountedFcfCr}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="waterfall-bridge-grid tabular-nums">
                <div className="bridge-item">
                  <span className="bridge-label">Cumulative 5-Yr PV of FCF</span>
                  <span className="bridge-value font-mono">
                    ₹{dcfResult ? dcfResult.cumulativeDiscountedFcfCr.toLocaleString("en-IN") : "4,820"} Cr
                  </span>
                </div>
                <div className="bridge-item">
                  <span className="bridge-label">Discounted Terminal Value</span>
                  <span className="bridge-value font-mono">
                    ₹{dcfResult ? dcfResult.discountedTerminalValueCr.toLocaleString("en-IN") : "29,930"} Cr
                  </span>
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

        {dcfResult &&
          Array.isArray(dcfResult.sensitivityMatrix) &&
          dcfResult.sensitivityMatrix.length > 0 &&
          dcfResult.sensitivityMatrix[0]?.values && (
            <Reveal delay={100}>
              <div className="sensitivity-matrix-card">
                <div className="matrix-header">
                  <div className="matrix-title">
                    <Layers className="icon-sm text-gold" />
                    <span>Sensitivity Matrix: Implied Share Price (₹ / Share) vs. WACC &amp; Terminal Growth</span>
                  </div>
                  <span className="matrix-hint">Baseline scenario highlighted in gold</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="matrix-table tabular-nums">
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
                          {Array.isArray(row.values) &&
                            row.values.map((cell) => {
                              const isCenter = cell.wacc === waccPct && row.growthRate === terminalGrowthPct;
                              const isHigh = cell.impliedPrice > 350;
                              const isLow = cell.impliedPrice < 240;
                              return (
                                <td
                                  key={cell.wacc}
                                  className={`matrix-cell font-mono text-center ${
                                    isCenter ? "cell-center" : isHigh ? "cell-high" : isLow ? "cell-low" : ""
                                  }`}
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

        {/* Modeled Stakeholder Waterfall */}
        <Reveal delay={140}>
          <div className="captable-card">
            <div className="captable-header">
              <div className="captable-title">
                <PieChart className="icon-sm text-purple" />
                <span>Scenario-Modeled Stakeholder Equity Waterfall</span>
              </div>
              <div className="shares-badge font-mono tabular-nums">
                132.04 Cr Shares · Modeled EV: ${Number(modeledEquityUsdB).toFixed(2)}B
              </div>
            </div>

            <div className="captable-grid">
              {defaultCapTable.map((item) => (
                <div key={item.holder} className="captable-item">
                  <div className="captable-bar-head">
                    <span className="captable-holder">{item.holder}</span>
                    <span className="captable-pct font-mono tabular-nums" style={{ color: item.color }}>
                      {item.share}%
                    </span>
                  </div>
                  <div className="captable-progress-track">
                    <div
                      className="captable-progress-fill"
                      style={{ width: `${item.share}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <div className="captable-sub-info tabular-nums">
                    <span>
                      Modeled Stake:{" "}
                      <strong>
                        ${((item.share / 100) * Number(modeledEquityUsdB)).toFixed(2)}B (₹
                        {Math.round((item.share / 100) * modeledEquityInrCr).toLocaleString("en-IN")} Cr)
                      </strong>
                    </span>
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
