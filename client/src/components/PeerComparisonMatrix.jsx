import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Layers, ShieldCheck, ArrowUpRight, BarChart2, CheckCircle2, Sliders } from "lucide-react";
import Reveal from "./Reveal";

export default function PeerComparisonMatrix({ peers = [], selectedSymbol, onSelectSymbol }) {
  const [sortKey, setSortKey] = useState("evRevenue");
  const [sortOrder, setSortOrder] = useState("desc");

  const peerComps = useMemo(() => {
    return [
      {
        symbol: "CRED:UNLST",
        name: "CRED (Dreamplug)",
        market: "Unlisted OTC / Series H",
        price: "₹284.50",
        marketCapUsd: "$4.50B",
        tpvAnnualCr: "₹8.5 Lakh Cr",
        revenueCr: "₹2,735 Cr",
        revGrowthYoY: "+16.0%",
        evRevenue: "13.8x",
        evTpv: "0.44%",
        arpuInr: "₹2,150",
        grossMargin: "74.6%",
        ebitdaMargin: "-10.8%",
        ruleOf40: "5.2%",
        ltvCac: "25.4x",
        cibilGate: "750+ Prime",
        status: "Target Case Study",
        isTarget: true
      },
      {
        symbol: "PAYTM:NSE",
        name: "One97 Communications",
        market: "NSE / BSE Listed",
        price: "₹684.20",
        marketCapUsd: "$5.10B",
        tpvAnnualCr: "₹18.2 Lakh Cr",
        revenueCr: "₹6,150 Cr",
        revGrowthYoY: "-8.5%",
        evRevenue: "6.9x",
        evTpv: "0.23%",
        arpuInr: "₹310",
        grossMargin: "48.2%",
        ebitdaMargin: "2.4%",
        ruleOf40: "-6.1%",
        ltvCac: "1.8x",
        cibilGate: "Mass Market (All)",
        status: "Listed Comparable",
        isTarget: false
      },
      {
        symbol: "POLICYBZR:NSE",
        name: "PB Fintech Ltd.",
        market: "NSE / BSE Listed",
        price: "₹1,742.80",
        marketCapUsd: "$9.40B",
        tpvAnnualCr: "₹22,000 Cr Premium",
        revenueCr: "₹3,880 Cr",
        revGrowthYoY: "+38.4%",
        evRevenue: "20.2x",
        evTpv: "3.55%",
        arpuInr: "₹1,650",
        grossMargin: "68.5%",
        ebitdaMargin: "14.2%",
        ruleOf40: "52.6%",
        ltvCac: "4.2x",
        cibilGate: "Insurance Buyers",
        status: "Listed Comparable",
        isTarget: false
      },
      {
        symbol: "ZOMATO:NSE",
        name: "Zomato Ltd. (Blinkit + District)",
        market: "NSE / BSE Listed",
        price: "₹262.40",
        marketCapUsd: "$27.5B",
        tpvAnnualCr: "₹45,000 Cr GOV",
        revenueCr: "₹15,200 Cr",
        revGrowthYoY: "+68.0%",
        evRevenue: "15.1x",
        evTpv: "5.10%",
        arpuInr: "₹820",
        grossMargin: "56.0%",
        ebitdaMargin: "8.5%",
        ruleOf40: "76.5%",
        ltvCac: "6.8x",
        cibilGate: "Affluent Urban",
        status: "Consumer Tech Benchmark",
        isTarget: false
      },
      {
        symbol: "GROWW:UNLST",
        name: "Groww (Nextbillion Tech)",
        market: "Unlisted Benchmark",
        price: "Private",
        marketCapUsd: "$3.00B",
        tpvAnnualCr: "₹12.0 Lakh Cr",
        revenueCr: "₹3,140 Cr",
        revGrowthYoY: "+118%",
        evRevenue: "7.9x",
        evTpv: "0.21%",
        arpuInr: "₹1,250",
        grossMargin: "82.0%",
        ebitdaMargin: "18.0%",
        ruleOf40: "136.0%",
        ltvCac: "3.5x",
        cibilGate: "Retail Broking",
        status: "Wealth Benchmark",
        isTarget: false
      },
      {
        symbol: "NU:NYSE",
        name: "Nu Holdings (Nubank LatAm)",
        market: "NYSE Listed Global",
        price: "$14.80",
        marketCapUsd: "$71.0B",
        tpvAnnualCr: "$110B+ Volume",
        revenueCr: "₹68,000 Cr ($8.0B)",
        revGrowthYoY: "+56.0%",
        evRevenue: "8.8x",
        evTpv: "0.64%",
        arpuInr: "₹9,800 ($112)",
        grossMargin: "45.0%",
        ebitdaMargin: "38.0%",
        ruleOf40: "94.0%",
        ltvCac: "30.0x+",
        cibilGate: "Credit + Digital Bank",
        status: "Global Gold Standard",
        isTarget: false
      }
    ];
  }, []);

  return (
    <section id="peer-matrix" className="peers-section">
      <div className="container">
        
        <Reveal>
          <div className="section-head text-center">
            <span className="section-eyebrow">
              <Layers className="icon-xs" /> INSTITUTIONAL EQUITY BENCHMARKING
            </span>
            <h2 className="section-title">
              FinTech Peer Multiples &amp; Operating Scorecard
            </h2>
            <p className="section-sub max-w-3xl mx-auto">
              Comparing CRED against listed public market peers (Paytm, PB Fintech, Zomato) and unlisted scale benchmarks on EV/Revenue multiples, Rule of 40 scorecard, ARPU density, and unit economics.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="peers-table-card">
            <div className="table-top-bar">
              <div className="table-title">
                <BarChart2 className="icon-sm text-cyan" />
                <span>VALUATION &amp; OPERATING COMP MATRIX (INR &amp; USD NORMALIZED)</span>
              </div>
              <div className="table-legend-pills">
                <span className="legend-chip highlight-target">Target Case Study</span>
                <span className="legend-chip">Listed Comparables</span>
                <span className="legend-chip">Global Benchmarks</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="peer-comp-table">
                <thead>
                  <tr>
                    <th>COMPANY &amp; SYMBOL</th>
                    <th>MARKET / ASSET</th>
                    <th>EV / CAP (USD)</th>
                    <th>ANNUAL REV</th>
                    <th>YOY GROWTH</th>
                    <th>EV / REV</th>
                    <th>ANNUAL ARPU</th>
                    <th>GROSS MARGIN</th>
                    <th>LTV / CAC</th>
                    <th>AUDIENCE GATE</th>
                  </tr>
                </thead>
                <tbody>
                  {peerComps.map((comp) => {
                    const isTarget = comp.isTarget;
                    return (
                      <tr key={comp.symbol} className={isTarget ? "target-row" : ""}>
                        <td className="company-cell">
                          <div className="comp-name-box">
                            <span className="comp-title">{comp.name}</span>
                            <span className="comp-ticker font-mono">{comp.symbol}</span>
                          </div>
                        </td>
                        <td className="font-mono text-muted">{comp.market}</td>
                        <td className="font-mono font-bold text-gold">{comp.marketCapUsd}</td>
                        <td className="font-mono text-cyan">{comp.revenueCr}</td>
                        <td className="font-mono text-green">{comp.revGrowthYoY}</td>
                        <td className="font-mono font-bold text-ink">{comp.evRevenue}</td>
                        <td className={`font-mono font-bold ${isTarget ? "text-green highlight-text" : "text-muted"}`}>
                          {comp.arpuInr}
                        </td>
                        <td className="font-mono text-muted">{comp.grossMargin}</td>
                        <td className="font-mono text-purple">{comp.ltvCac}</td>
                        <td>
                          <span className={`gate-badge ${isTarget ? "gate-prime" : ""}`}>
                            {comp.cibilGate}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Strategic Takeaway footer inside table card */}
            <div className="peer-matrix-footer">
              <div className="insight-grid">
                <div className="insight-box">
                  <div className="insight-title text-green">ARPU Asymmetry (₹2,150)</div>
                  <p className="insight-desc">
                    CRED's gated model delivers an annual ARPU that is <strong>7x higher than Paytm (₹310)</strong> and <strong>22x higher than generic UPI apps</strong>, proving the economic power of gating for prime transactors.
                  </p>
                </div>
                <div className="insight-box">
                  <div className="insight-title text-gold">Multiple Realignment (13.8x EV/Rev)</div>
                  <p className="insight-desc">
                    Following Meta’s $900M Series H, CRED’s 13.8x EV/Revenue multiple trades at a premium over pure-play payments while maintaining parity with high-growth platforms like Zomato (15.1x) and PB Fintech (20.2x).
                  </p>
                </div>
                <div className="insight-box">
                  <div className="insight-title text-cyan">LTV / CAC Superiority (25.4x)</div>
                  <p className="insight-desc">
                    With high-trust borrowers driving cross-sell into CRED Cash and Kuvera Direct MFs, CRED's LTV/CAC ratio of 25.4x rivals global neo-banking gold standard Nubank (30x+).
                  </p>
                </div>
              </div>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}
