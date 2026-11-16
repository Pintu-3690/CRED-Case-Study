import { useState, useMemo } from "react";
import { PieChart, Layers, ArrowUpRight, ArrowDownRight, Search, Download, TrendingUp } from "lucide-react";
import Reveal from "./Reveal";

const HOLDER_FILTERS = ["All", "Institutional VC", "Strategic", "Founders & ESOP"];

const ENTRY_ROUNDS = [
  { id: "seed", label: "Seed / Series A (2018)", priceInr: 18.50 },
  { id: "seriesC", label: "Series C Unicorn (2021)", priceInr: 142.00 },
  { id: "seriesF", label: "Series F Peak $6.4B (2022)", priceInr: 342.00 },
  { id: "liveOtc", label: "Current Live OTC", priceInr: null }
];

export default function CompanySharesRegistry({
  marketData = {},
  credQuote = { price: 284.50, change: 3.85, pctChange: 1.37, sharesOutstandingM: 1320.4 },
  usdInrRate = 87.42
}) {
  const [viewMode, setViewMode] = useState("holders");
  const [holderFilter, setHolderFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedHolder, setHighlightedHolder] = useState(null);

  // Interactive Exit & IPO Return Modeler state
  const [selectedEntryId, setSelectedEntryId] = useState("liveOtc");
  const [investmentLakh, setInvestmentLakh] = useState(10); // ₹10 Lakh
  const [targetExitUsdB, setTargetExitUsdB] = useState(8.5); // $8.5B IPO target

  const livePrice = credQuote?.price || marketData?.currentPriceINR || 284.50;
  const totalSharesM = marketData?.sharesOutstandingM || credQuote?.sharesOutstandingM || 1320.4;
  const liveMarketCapInrCr = (livePrice * totalSharesM) / 10;
  const liveMarketCapUsdB = (liveMarketCapInrCr * 10) / (usdInrRate * 1000);
  const isUp = (credQuote?.change ?? 0) >= 0;

  const capTable = useMemo(() => {
    const base = marketData?.capTable || [];
    return base.map((item) => {
      const sharesM = item.sharesM || Number(((item.share / 100) * totalSharesM).toFixed(2));
      const sharesCr = Number((sharesM / 10).toFixed(2));
      const liveValueInrCr = (sharesM * livePrice) / 10;
      const liveValueUsdM = (liveValueInrCr * 10) / usdInrRate;
      return {
        ...item,
        sharesM,
        sharesCr,
        liveValueInrCr,
        liveValueUsdM
      };
    });
  }, [marketData?.capTable, totalSharesM, livePrice, usdInrRate]);

  const filteredHolders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return capTable.filter((h) => {
      const matchesCat = holderFilter === "All" || h.category === holderFilter;
      const matchesSearch =
        !q ||
        h.holder.toLowerCase().includes(q) ||
        (h.votingRights && h.votingRights.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [capTable, holderFilter, searchQuery]);

  const shareClasses = useMemo(() => {
    const base = marketData?.shareClasses || [];
    const q = searchQuery.trim().toLowerCase();
    return base
      .filter(
        (sc) =>
          !q ||
          sc.className.toLowerCase().includes(q) ||
          sc.instrument.toLowerCase().includes(q) ||
          sc.status.toLowerCase().includes(q)
      )
      .map((sc) => {
        const sharesCr = Number((sc.sharesM / 10).toFixed(2));
        const liveValueInrCr = (sc.sharesM * livePrice) / 10;
        const multipleVsIssue = sc.issuePriceInr > 0 ? livePrice / sc.issuePriceInr : 0;
        return {
          ...sc,
          sharesCr,
          liveValueInrCr,
          multipleVsIssue
        };
      });
  }, [marketData?.shareClasses, livePrice, searchQuery]);

  const filteredTotals = useMemo(() => {
    return filteredHolders.reduce(
      (acc, h) => ({
        share: acc.share + h.share,
        sharesM: acc.sharesM + h.sharesM,
        sharesCr: acc.sharesCr + h.sharesCr,
        liveValueInrCr: acc.liveValueInrCr + h.liveValueInrCr,
        liveValueUsdM: acc.liveValueUsdM + h.liveValueUsdM
      }),
      { share: 0, sharesM: 0, sharesCr: 0, liveValueInrCr: 0, liveValueUsdM: 0 }
    );
  }, [filteredHolders]);

  // Exit & MOIC calculations
  const activeEntry = ENTRY_ROUNDS.find((r) => r.id === selectedEntryId) || ENTRY_ROUNDS[3];
  const entryPrice = activeEntry.priceInr ?? livePrice;
  const acquiredShares = (investmentLakh * 100000) / entryPrice;
  const targetExitInrCr = (targetExitUsdB * 1000 * usdInrRate) / 10;
  const impliedExitSharePrice = (targetExitInrCr * 10) / totalSharesM;
  const projectedValueInr = acquiredShares * impliedExitSharePrice;
  const projectedMoic = entryPrice > 0 ? impliedExitSharePrice / entryPrice : 1;

  const handleExportCsv = () => {
    const headers =
      viewMode === "holders"
        ? ["Stakeholder", "Category", "Instrument", "Shares (Cr)", "Shares (M)", "Ownership %", "Avg Entry (INR)", "Live Value (INR Cr)", "Live Value ($M)"]
        : ["Share Class", "Instrument", "Shares (Cr)", "Shares (M)", "Equity %", "Issue Price (INR)", "Live Multiple", "Live Value (INR Cr)", "Status"];

    const rows =
      viewMode === "holders"
        ? filteredHolders.map((h) => [
            `"${h.holder}"`,
            `"${h.category || ""}"`,
            `"${h.votingRights || ""}"`,
            h.sharesCr.toFixed(2),
            h.sharesM.toFixed(2),
            h.share.toFixed(1),
            (h.avgEntryInr || 0).toFixed(2),
            Math.round(h.liveValueInrCr),
            Math.round(h.liveValueUsdM)
          ])
        : shareClasses.map((sc) => [
            `"${sc.className}"`,
            `"${sc.instrument}"`,
            sc.sharesCr.toFixed(2),
            sc.sharesM.toFixed(2),
            sc.pct.toFixed(1),
            sc.issuePriceInr.toFixed(2),
            sc.multipleVsIssue.toFixed(2),
            Math.round(sc.liveValueInrCr),
            `"${sc.status}"`
          ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CRED-${viewMode === "holders" ? "cap-table" : "share-classes"}-${livePrice.toFixed(2)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="shares-captable" className="shares-registry-section">
      <div className="container">
        <Reveal className="section-head">
          <div className="editorial-kicker">
            <span>03</span>
            <span aria-hidden="true">·</span>
            <span>Equity Registry &amp; Share Capital</span>
          </div>
          <h2>All Shares of CRED (Dreamplug Technologies)</h2>
          <p>
            Complete fully diluted equity ledger across 132.04 Crore shares — live mark-to-market valuation by
            institutional stakeholder and share class, updated with every secondary market tick.
          </p>
        </Reveal>

        {/* Live Capitalization Summary Strip */}
        <Reveal delay={40}>
          <div className="cap-summary-strip">
            <div className="cap-summary-cell">
              <span className="cap-sum-label">Live OTC Share Price</span>
              <div className="cap-sum-val-row">
                <strong className="cap-sum-val tabular-nums">₹{livePrice.toFixed(2)}</strong>
                <span className={`cap-sum-delta tabular-nums ${isUp ? "text-green" : "text-red"}`}>
                  {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {isUp ? "+" : ""}{(credQuote?.pctChange ?? 1.37).toFixed(2)}%
                </span>
              </div>
              <span className="cap-sum-sub">{marketData?.isin || "INE02XY01014 (Unlisted)"}</span>
            </div>

            <div className="cap-summary-cell">
              <span className="cap-sum-label">Live Implied Equity Value</span>
              <strong className="cap-sum-val text-gold tabular-nums">
                ₹{Math.round(liveMarketCapInrCr).toLocaleString("en-IN")} Cr
              </strong>
              <span className="cap-sum-sub tabular-nums">
                ${liveMarketCapUsdB.toFixed(2)}B USD (@ ₹{usdInrRate.toFixed(2)}/$)
              </span>
            </div>

            <div className="cap-summary-cell">
              <span className="cap-sum-label">Total Diluted Shares</span>
              <strong className="cap-sum-val tabular-nums">
                {(totalSharesM / 10).toFixed(2)} Cr
              </strong>
              <span className="cap-sum-sub tabular-nums">
                {totalSharesM.toLocaleString("en-IN")}M shares · FV ₹{(marketData?.faceValueINR || 1).toFixed(2)}
              </span>
            </div>

            <div className="cap-summary-cell">
              <span className="cap-sum-label">52-Week OTC Range &amp; Lot</span>
              <strong className="cap-sum-val tabular-nums">
                ₹{marketData?.range52w?.low || 185} – ₹{marketData?.range52w?.high || 342}
              </strong>
              <span className="cap-sum-sub">
                Min OTC Lot: {marketData?.lotSize || 50} shares · T+1 Escrow
              </span>
            </div>
          </div>
        </Reveal>

        {/* Main Registry Surface */}
        <Reveal delay={80}>
          <div className="registry-panel">
            <div className="registry-toolbar">
              <div className="registry-toolbar-left">
                <div className="segmented-control" role="tablist" aria-label="Share breakdown view">
                  <button
                    role="tab"
                    aria-selected={viewMode === "holders"}
                    className={`seg-btn ${viewMode === "holders" ? "active" : ""}`}
                    onClick={() => setViewMode("holders")}
                  >
                    <PieChart size={14} />
                    <span>By Stakeholder ({capTable.length})</span>
                  </button>
                  <button
                    role="tab"
                    aria-selected={viewMode === "classes"}
                    className={`seg-btn ${viewMode === "classes" ? "active" : ""}`}
                    onClick={() => setViewMode("classes")}
                  >
                    <Layers size={14} />
                    <span>By Share Class ({(marketData?.shareClasses || []).length})</span>
                  </button>
                </div>

                {viewMode === "holders" && (
                  <div className="registry-filters" role="group" aria-label="Filter stakeholders by type">
                    {HOLDER_FILTERS.map((cat) => (
                      <button
                        key={cat}
                        className={`reg-filter-btn ${holderFilter === cat ? "active" : ""}`}
                        onClick={() => setHolderFilter(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="registry-toolbar-right">
                <div className="reg-search-box">
                  <Search size={14} className="text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter entity or class..."
                    className="reg-search-input"
                    aria-label="Filter cap table rows"
                  />
                </div>
                <button type="button" onClick={handleExportCsv} className="reg-export-btn">
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {viewMode === "holders" && (
              <div className="registry-bar-block">
                <div className="cap-stacked-bar">
                  {capTable.map((item) => {
                    const isActive = !highlightedHolder || highlightedHolder === item.holder;
                    return (
                      <div
                        key={item.holder}
                        className="cap-bar-segment"
                        style={{
                          width: `${item.share}%`,
                          backgroundColor: item.color,
                          opacity: isActive ? 1 : 0.3
                        }}
                        onMouseEnter={() => setHighlightedHolder(item.holder)}
                        onMouseLeave={() => setHighlightedHolder(null)}
                        title={`${item.holder}: ${item.share}% (${item.sharesCr} Cr shares)`}
                      />
                    );
                  })}
                </div>
                <div className="registry-legend">
                  {capTable.map((item) => (
                    <button
                      key={item.holder}
                      className={`reg-legend-item ${highlightedHolder === item.holder ? "active" : ""}`}
                      onMouseEnter={() => setHighlightedHolder(item.holder)}
                      onMouseLeave={() => setHighlightedHolder(null)}
                      onClick={() => setHighlightedHolder(highlightedHolder === item.holder ? null : item.holder)}
                    >
                      <span className="cap-color-dot" style={{ backgroundColor: item.color }} />
                      <span>{item.holder.split(" (")[0]}</span>
                      <span className="tabular-nums text-muted">{item.share}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "holders" ? (
              <div className="overflow-x-auto">
                <table className="registry-table">
                  <thead>
                    <tr>
                      <th>Stakeholder / Entity</th>
                      <th>Category</th>
                      <th>Instrument</th>
                      <th className="num-col">Shares (Cr)</th>
                      <th className="num-col">Shares (M)</th>
                      <th className="num-col">Ownership</th>
                      <th className="num-col">Avg Entry (₹)</th>
                      <th className="num-col">Live Value (₹ Cr)</th>
                      <th className="num-col">Live Value ($M)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHolders.length > 0 ? (
                      filteredHolders.map((h) => (
                        <tr
                          key={h.holder}
                          className={highlightedHolder === h.holder ? "row-highlighted" : ""}
                          onMouseEnter={() => setHighlightedHolder(h.holder)}
                          onMouseLeave={() => setHighlightedHolder(null)}
                        >
                          <td>
                            <div className="holder-cell">
                              <span className="cap-color-dot" style={{ backgroundColor: h.color }} />
                              <span className="holder-name">{h.holder}</span>
                            </div>
                          </td>
                          <td className="text-muted">{h.category || "Institutional"}</td>
                          <td className="font-mono text-muted">{h.votingRights || "CCPS 1:1"}</td>
                          <td className="num-col font-mono tabular-nums">{h.sharesCr.toFixed(2)} Cr</td>
                          <td className="num-col font-mono tabular-nums text-muted">{h.sharesM.toFixed(2)}M</td>
                          <td className="num-col font-mono tabular-nums font-bold" style={{ color: h.color }}>
                            {h.share.toFixed(1)}%
                          </td>
                          <td className="num-col font-mono tabular-nums text-muted">
                            ₹{(h.avgEntryInr || 0).toFixed(2)}
                          </td>
                          <td className="num-col font-mono tabular-nums font-bold text-ink">
                            ₹{Math.round(h.liveValueInrCr).toLocaleString("en-IN")} Cr
                          </td>
                          <td className="num-col font-mono tabular-nums text-green">
                            ${Math.round(h.liveValueUsdM).toLocaleString("en-IN")}M
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="registry-empty-cell">
                          No stakeholders matched &ldquo;{searchQuery}&rdquo;.{" "}
                          <button type="button" onClick={() => { setSearchQuery(""); setHolderFilter("All"); }} className="text-green underline">
                            Clear filters
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="registry-total-row">
                      <td colSpan={3}>
                        <strong>
                          {holderFilter === "All" && !searchQuery
                            ? "Total Fully Diluted Capital"
                            : `Filtered Subtotal (${filteredHolders.length})`}
                        </strong>
                      </td>
                      <td className="num-col font-mono tabular-nums">
                        <strong>{filteredTotals.sharesCr.toFixed(2)} Cr</strong>
                      </td>
                      <td className="num-col font-mono tabular-nums text-muted">
                        <strong>{filteredTotals.sharesM.toFixed(2)}M</strong>
                      </td>
                      <td className="num-col font-mono tabular-nums text-gold">
                        <strong>{filteredTotals.share.toFixed(1)}%</strong>
                      </td>
                      <td className="num-col font-mono text-muted">—</td>
                      <td className="num-col font-mono tabular-nums text-ink">
                        <strong>₹{Math.round(filteredTotals.liveValueInrCr).toLocaleString("en-IN")} Cr</strong>
                      </td>
                      <td className="num-col font-mono tabular-nums text-green">
                        <strong>${Math.round(filteredTotals.liveValueUsdM).toLocaleString("en-IN")}M</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="registry-table">
                  <thead>
                    <tr>
                      <th>Share Class</th>
                      <th>Legal Instrument</th>
                      <th className="num-col">Shares (Cr)</th>
                      <th className="num-col">Shares (M)</th>
                      <th className="num-col">Equity %</th>
                      <th className="num-col">Issue Price</th>
                      <th className="num-col">Current Multiple</th>
                      <th className="num-col">Live Value (₹ Cr)</th>
                      <th>Status &amp; Liquidity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shareClasses.map((sc) => (
                      <tr key={sc.className}>
                        <td><strong className="holder-name">{sc.className}</strong></td>
                        <td className="text-muted">{sc.instrument}</td>
                        <td className="num-col font-mono tabular-nums">{sc.sharesCr.toFixed(2)} Cr</td>
                        <td className="num-col font-mono tabular-nums text-muted">{sc.sharesM.toFixed(2)}M</td>
                        <td className="num-col font-mono tabular-nums font-bold text-cyan">{sc.pct.toFixed(1)}%</td>
                        <td className="num-col font-mono tabular-nums text-muted">₹{sc.issuePriceInr.toFixed(2)}</td>
                        <td className="num-col font-mono tabular-nums text-green">
                          {sc.multipleVsIssue.toFixed(2)}x
                        </td>
                        <td className="num-col font-mono tabular-nums font-bold text-ink">
                          ₹{Math.round(sc.liveValueInrCr).toLocaleString("en-IN")} Cr
                        </td>
                        <td className="text-muted">{sc.status} · {sc.liquidity}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="registry-total-row">
                      <td colSpan={2}><strong>Total Paid-Up &amp; Diluted Equity Base</strong></td>
                      <td className="num-col font-mono tabular-nums"><strong>132.04 Cr</strong></td>
                      <td className="num-col font-mono tabular-nums text-muted"><strong>1,320.40M</strong></td>
                      <td className="num-col font-mono tabular-nums text-gold"><strong>100.0%</strong></td>
                      <td className="num-col font-mono text-muted">FV ₹1.00</td>
                      <td className="num-col font-mono text-muted">—</td>
                      <td className="num-col font-mono tabular-nums text-ink">
                        <strong>₹{Math.round(liveMarketCapInrCr).toLocaleString("en-IN")} Cr</strong>
                      </td>
                      <td className="text-muted">Authorized: {marketData?.authorizedCapitalINR || "₹150 Cr"}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* IPO / Exit Scenario Return Analyzer */}
            <div className="ipo-exit-analyzer">
              <div className="exit-analyzer-head">
                <div className="exit-head-left">
                  <TrendingUp size={16} className="text-gold" />
                  <div>
                    <h3>Shareholder Exit &amp; IPO Return Modeler</h3>
                    <p>Simulate MOIC and projected equity return from historical funding rounds or live OTC entry.</p>
                  </div>
                </div>
                <div className="entry-round-tabs" role="group" aria-label="Select entry round benchmark">
                  {ENTRY_ROUNDS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedEntryId(r.id)}
                      className={`reg-filter-btn ${selectedEntryId === r.id ? "active" : ""}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="exit-analyzer-body">
                <div className="exit-controls">
                  <div className="exit-slider-group">
                    <div className="slider-head">
                      <span>Capital Invested (₹ Lakh)</span>
                      <strong className="font-mono text-ink tabular-nums">₹{investmentLakh} Lakh</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="500"
                      step="1"
                      value={investmentLakh}
                      onChange={(e) => setInvestmentLakh(parseInt(e.target.value, 10))}
                      className="custom-range"
                      aria-label="Capital invested in lakhs"
                    />
                    <div className="slider-foot">
                      <span>₹1 Lakh</span>
                      <span>₹5 Cr (₹500L)</span>
                    </div>
                  </div>

                  <div className="exit-slider-group">
                    <div className="slider-head">
                      <span>Target Exit / IPO Valuation ($B)</span>
                      <strong className="font-mono text-gold tabular-nums">${targetExitUsdB.toFixed(1)}B</strong>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="15.0"
                      step="0.5"
                      value={targetExitUsdB}
                      onChange={(e) => setTargetExitUsdB(parseFloat(e.target.value))}
                      className="custom-range range-gold"
                      aria-label="Target IPO exit valuation in billions"
                    />
                    <div className="slider-foot">
                      <span>$3.0B Bear</span>
                      <span>$15.0B Long-Term</span>
                    </div>
                  </div>
                </div>

                <div className="exit-results-strip tabular-nums">
                  <div>
                    <span className="cap-sum-label">Entry Share Price</span>
                    <strong className="exit-metric-val">₹{entryPrice.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="cap-sum-label">CRED Shares Allocated</span>
                    <strong className="exit-metric-val text-cyan">{Math.round(acquiredShares).toLocaleString("en-IN")} sh</strong>
                  </div>
                  <div>
                    <span className="cap-sum-label">Target Exit Price / Share</span>
                    <strong className="exit-metric-val text-gold">₹{impliedExitSharePrice.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="cap-sum-label">Projected Exit Value &amp; MOIC</span>
                    <strong className={`exit-metric-val ${projectedMoic >= 1 ? "text-green" : "text-red"}`}>
                      ₹{(projectedValueInr / 100000).toFixed(2)}L ({projectedMoic.toFixed(2)}x)
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
