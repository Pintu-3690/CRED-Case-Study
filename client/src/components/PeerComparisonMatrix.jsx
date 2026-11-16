import { useMemo } from "react";
import { BarChart2 } from "lucide-react";
import Reveal from "./Reveal";

export default function PeerComparisonMatrix({ peers = [], onSelectSymbol }) {
  const peerComps = useMemo(() => {
    const liveBySymbol = Object.fromEntries(peers.map((p) => [p.symbol, p]));

    const credLive = liveBySymbol["CRED:UNLST"];
    const paytmLive = liveBySymbol["PAYTM:NSE"];
    const pbLive = liveBySymbol["POLICYBZR:NSE"];
    const zomatoLive = liveBySymbol["ZOMATO:NSE"];

    return [
      {
        symbol: "CRED:UNLST",
        name: "CRED (Dreamplug)",
        market: "Unlisted OTC / Series H",
        price: credLive ? `₹${credLive.price.toFixed(2)}` : "₹284.50",
        marketCapUsd: credLive?.impliedMarketCapUsd ? `$${credLive.impliedMarketCapUsd.toFixed(2)}B` : "$4.30B",
        revenueCr: "₹2,735 Cr",
        revGrowthYoY: "+16.0%",
        evRevenue: credLive?.impliedMarketCapUsd ? `${((credLive.impliedMarketCapUsd * 8742) / 2735).toFixed(1)}x` : "13.7x",
        arpuInr: "₹2,150",
        grossMargin: "74.6%",
        ltvCac: "25.4x",
        cibilGate: "750+ Prime",
        isTarget: true,
        trackable: true
      },
      {
        symbol: "PAYTM:NSE",
        name: "One97 Communications",
        market: "NSE / BSE Listed",
        price: paytmLive ? `₹${paytmLive.price.toFixed(2)}` : "₹684.20",
        marketCapUsd: "$5.10B",
        revenueCr: "₹6,150 Cr",
        revGrowthYoY: "-8.5%",
        evRevenue: "6.9x",
        arpuInr: "₹310",
        grossMargin: "48.2%",
        ltvCac: "1.8x",
        cibilGate: "Mass Market (All)",
        isTarget: false,
        trackable: true
      },
      {
        symbol: "POLICYBZR:NSE",
        name: "PB Fintech Ltd.",
        market: "NSE / BSE Listed",
        price: pbLive ? `₹${pbLive.price.toFixed(2)}` : "₹1,742.80",
        marketCapUsd: "$9.40B",
        revenueCr: "₹3,880 Cr",
        revGrowthYoY: "+38.4%",
        evRevenue: "20.2x",
        arpuInr: "₹1,650",
        grossMargin: "68.5%",
        ltvCac: "4.2x",
        cibilGate: "Insurance Buyers",
        isTarget: false,
        trackable: true
      },
      {
        symbol: "ZOMATO:NSE",
        name: "Zomato Ltd. (Blinkit + District)",
        market: "NSE / BSE Listed",
        price: zomatoLive ? `₹${zomatoLive.price.toFixed(2)}` : "₹262.40",
        marketCapUsd: "$27.50B",
        revenueCr: "₹15,200 Cr",
        revGrowthYoY: "+68.0%",
        evRevenue: "15.1x",
        arpuInr: "₹820",
        grossMargin: "56.0%",
        ltvCac: "6.8x",
        cibilGate: "Affluent Urban",
        isTarget: false,
        trackable: true
      },
      {
        symbol: "GROWW:UNLST",
        name: "Groww (Nextbillion Tech)",
        market: "Unlisted Benchmark",
        price: "Private",
        marketCapUsd: "$3.00B",
        revenueCr: "₹3,140 Cr",
        revGrowthYoY: "+118.0%",
        evRevenue: "7.9x",
        arpuInr: "₹1,250",
        grossMargin: "82.0%",
        ltvCac: "3.5x",
        cibilGate: "Retail Broking",
        isTarget: false,
        trackable: false
      },
      {
        symbol: "NU:NYSE",
        name: "Nu Holdings (Nubank LatAm)",
        market: "NYSE Listed Global",
        price: "$14.80",
        marketCapUsd: "$71.00B",
        revenueCr: "₹68,000 Cr ($8.0B)",
        revGrowthYoY: "+56.0%",
        evRevenue: "8.8x",
        arpuInr: "₹9,800 ($112)",
        grossMargin: "45.0%",
        ltvCac: "30.0x+",
        cibilGate: "Credit + Digital Bank",
        isTarget: false,
        trackable: false
      }
    ];
  }, [peers]);

  return (
    <section id="peer-matrix" className="peers-section">
      <div className="container">
        <Reveal className="section-head">
          <div className="editorial-kicker">
            <span>06</span>
            <span aria-hidden="true">·</span>
            <span>Institutional Equity Benchmarking</span>
          </div>
          <h2>FinTech Peer Multiples &amp; Operating Scorecard</h2>
          <p>
            Comparing CRED against listed Indian fintech comparables (Paytm, PB Fintech, Zomato) and global scale
            benchmarks on live EV/Revenue multiples, ARPU density, and LTV/CAC efficiency.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="peers-table-card">
            <div className="table-top-bar">
              <div className="table-title">
                <BarChart2 className="icon-sm text-cyan" />
                <span>Valuation &amp; Operating Comp Matrix (INR &amp; USD Normalized)</span>
              </div>
              <div className="table-legend-inline">
                <span className="legend-inline-item text-green">Case Study Subject</span>
                <span aria-hidden="true">·</span>
                <span className="legend-inline-item">Click any tracked ticker to inspect live chart</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="peer-comp-table tabular-nums">
                <thead>
                  <tr>
                    <th>Company &amp; Symbol</th>
                    <th>Market / Asset</th>
                    <th>Share Price</th>
                    <th>EV / Cap (USD)</th>
                    <th>Annual Rev</th>
                    <th>YoY Growth</th>
                    <th>EV / Rev</th>
                    <th>Annual ARPU</th>
                    <th>Gross Margin</th>
                    <th>LTV / CAC</th>
                    <th>Audience Gate</th>
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
                            {comp.trackable && onSelectSymbol ? (
                              <a
                                href="#trading-terminal"
                                onClick={() => onSelectSymbol(comp.symbol)}
                                className="comp-ticker comp-ticker-link font-mono"
                              >
                                {comp.symbol} ↗
                              </a>
                            ) : (
                              <span className="comp-ticker font-mono">{comp.symbol}</span>
                            )}
                          </div>
                        </td>
                        <td className="font-mono text-muted">{comp.market}</td>
                        <td className="font-mono font-semibold text-ink">{comp.price}</td>
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

            <div className="peer-matrix-footer">
              <div className="insight-grid">
                <div className="insight-box">
                  <div className="insight-title text-green">ARPU Asymmetry (₹2,150)</div>
                  <p className="insight-desc">
                    CRED&rsquo;s gated model delivers an annual ARPU <strong>7x higher than Paytm (₹310)</strong> and{" "}
                    <strong>22x higher than generic UPI apps</strong>, demonstrating the yield of prime transactors.
                  </p>
                </div>
                <div className="insight-box">
                  <div className="insight-title text-gold">Multiple Realignment (~13.7x EV/Rev)</div>
                  <p className="insight-desc">
                    Following Meta&rsquo;s $900M Series H, CRED&rsquo;s EV/Revenue multiple trades at a premium over
                    pure-play payments while remaining below PB Fintech (20.2x) and Zomato (15.1x).
                  </p>
                </div>
                <div className="insight-box">
                  <div className="insight-title text-cyan">LTV / CAC Superiority (25.4x)</div>
                  <p className="insight-desc">
                    With high-trust borrowers cross-selling into CRED Cash and Kuvera Direct MFs, CRED&rsquo;s 25.4x
                    LTV/CAC approaches global neo-banking benchmark Nubank (30x+).
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
