import { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Sliders, Shield, Zap, Sparkles, Activity, Clock } from "lucide-react";
import Reveal from "./Reveal";
import "../chartSetup";

// Generate realistic simulated price series for different timeframes
function generateHistory(timeframe, basePrice = 284.50) {
  let points = 24;
  let labels = [];
  let data = [];
  let current = basePrice;

  if (timeframe === "1D") {
    points = 16;
    labels = ["09:15", "09:45", "10:30", "11:15", "12:00", "12:45", "13:30", "14:15", "15:00", "15:30"];
    current = basePrice - 3.2;
    data = labels.map((_, i) => {
      const step = (Math.random() - 0.44) * 1.8;
      current = Number((current + step).toFixed(2));
      return current;
    });
    data[data.length - 1] = basePrice;
  } else if (timeframe === "1W") {
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Today"];
    current = basePrice - 9.4;
    data = labels.map(() => {
      current = Number((current + (Math.random() - 0.42) * 4.5).toFixed(2));
      return current;
    });
    data[data.length - 1] = basePrice;
  } else if (timeframe === "1M") {
    labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Live"];
    current = basePrice - 18.0;
    data = labels.map(() => {
      current = Number((current + (Math.random() - 0.38) * 8).toFixed(2));
      return current;
    });
    data[data.length - 1] = basePrice;
  } else if (timeframe === "1Y") {
    labels = ["Sep 25", "Nov 25", "Jan 26", "Mar 26", "May 26", "Jul 26", "Aug 26 (Meta Deal)"];
    data = [210.0, 224.5, 238.0, 245.0, 252.0, 268.0, basePrice];
  } else {
    // ALL / 5Y
    labels = ["2019 (B)", "2020 (C)", "2021 (D)", "2021 (E)", "2022 (F)", "2024 (Kuvera)", "2026 (Meta Deal)"];
    data = [42.0, 68.0, 160.0, 240.0, 342.0, 235.0, basePrice];
  }

  return { labels, data };
}

export default function LiveShareTracker({ marketData = {}, capTable = [] }) {
  const [timeframe, setTimeframe] = useState("1D");
  const [livePrice, setLivePrice] = useState(marketData.currentPriceINR || 284.50);
  const [priceChange, setPriceChange] = useState(+3.85);
  const [percentChange, setPercentChange] = useState(+1.37);
  const [isLiveTicking, setIsLiveTicking] = useState(true);
  const [ticksCount, setTicksCount] = useState(0);

  // Valuation Simulator state
  const [simMembers, setSimMembers] = useState(15.2);
  const [simArpu, setSimArpu] = useState(2150);
  const [simMultiple, setSimMultiple] = useState(14);

  // Dynamic calculation for simulated company valuation
  const simRevenueCr = useMemo(() => {
    // (members in M * ARPU in INR) / 100 to get Cr
    // 15.2M * 2150 INR = 32,680,000,000 INR = 3,268 Cr
    return Number(((simMembers * 1000000 * simArpu) / 10000000).toFixed(0));
  }, [simMembers, simArpu]);

  const simValuationUsd = useMemo(() => {
    // Revenue in Cr * Multiple / 84 (USD/INR conversion)
    return ((simRevenueCr * simMultiple) / 8400).toFixed(2);
  }, [simRevenueCr, simMultiple]);

  // Real-time live random-walk ticks
  useEffect(() => {
    if (!isLiveTicking) return;
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.47) * 0.45;
      setLivePrice((prev) => {
        const next = Number((prev + delta).toFixed(2));
        const diff = Number((next - 280.65).toFixed(2));
        const pct = Number(((diff / 280.65) * 100).toFixed(2));
        setPriceChange(diff);
        setPercentChange(pct);
        return next;
      });
      setTicksCount((c) => c + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveTicking]);

  // Chart data setup
  const chartHistory = useMemo(() => {
    const hist = generateHistory(timeframe, livePrice);
    return hist;
  }, [timeframe, ticksCount]);

  const chartData = {
    labels: chartHistory.labels,
    datasets: [
      {
        label: "CRED Secondary Share Price (INR)",
        data: chartHistory.data,
        borderColor: "#00df82",
        borderWidth: 2.5,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 320);
          gradient.addColorStop(0, "rgba(0, 223, 130, 0.35)");
          gradient.addColorStop(0.7, "rgba(0, 223, 130, 0.04)");
          gradient.addColorStop(1, "rgba(0, 223, 130, 0)");
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#00df82",
        pointBorderColor: "#08080a",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(18, 20, 26, 0.95)",
        titleColor: "#f3f2ee",
        bodyColor: "#00df82",
        borderColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        displayColors: false,
        callbacks: {
          label: (ctx) => `Share Price: ₹${ctx.parsed.y.toFixed(2)} INR`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.03)" },
        ticks: { color: "#8a8a92", font: { family: "Inter", size: 11 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: {
          color: "#8a8a92",
          font: { family: "JetBrains Mono", size: 11 },
          callback: (val) => `₹${val}`,
        },
      },
    },
  };

  const capTableList = marketData.capTable || capTable || [];

  return (
    <section className="live-share-section" id="live-share">
      <div className="container">
        <Reveal className="section-head">
          <div className="live-badge-inline">
            <span className="live-pulse-dot" />
            <span>REAL-TIME MARKET INTELLIGENCE</span>
          </div>
          <h2>Live Unlisted Share &amp; Implied Valuation</h2>
          <p>
            Track real-time secondary market prints for Dreamplug Technologies (CRED), institutional cap table distribution,
            and interact with the live valuation sensitivity simulator.
          </p>
        </Reveal>

        <div className="share-terminal-grid">
          {/* Main Price & Chart Card */}
          <Reveal as="div" className="card share-main-card">
            <div className="share-header">
              <div className="share-title-group">
                <div className="share-ticker">
                  <span className="ticker-code">CRED-UNLTD</span>
                  <span className="ticker-market">PRE-IPO SECONDARY MARKET</span>
                  <span className="ticker-lot">LOT: 100 SHARES</span>
                </div>
                <h3 className="company-legal">Dreamplug Technologies Private Limited</h3>
              </div>

              <div className="share-price-display">
                <div className="price-primary">
                  ₹{livePrice.toFixed(2)} <span className="currency-tag">INR</span>
                </div>
                <div className={`price-change-tag ${priceChange >= 0 ? "positive" : "negative"}`}>
                  {priceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{priceChange >= 0 ? `+₹${priceChange.toFixed(2)}` : `-₹${Math.abs(priceChange).toFixed(2)}`}</span>
                  <span>({percentChange >= 0 ? `+${percentChange.toFixed(2)}%` : `${percentChange.toFixed(2)}%`})</span>
                  <span className="live-tick-label">● LIVE</span>
                </div>
              </div>
            </div>

            {/* Timeframe Controls */}
            <div className="timeframe-bar">
              <div className="tf-buttons">
                {["1D", "1W", "1M", "1Y", "ALL"].map((tf) => (
                  <button
                    key={tf}
                    className={`tf-btn ${timeframe === tf ? "active" : ""}`}
                    onClick={() => setTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="tf-status">
                <button
                  className={`live-toggle-btn ${isLiveTicking ? "active" : ""}`}
                  onClick={() => setIsLiveTicking((v) => !v)}
                  title="Toggle real-time streaming market ticks"
                >
                  <Activity size={14} className={isLiveTicking ? "pulse-spin" : ""} />
                  <span>{isLiveTicking ? "Live Feed: Active" : "Live Feed: Paused"}</span>
                </button>
              </div>
            </div>

            {/* Live Chart Container */}
            <div className="share-chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>

            {/* Market Stats Strip */}
            <div className="market-stats-strip">
              <div className="stat-pill">
                <span className="stat-label">Implied Enterprise Value</span>
                <span className="stat-val highlight-green">$4.50 Billion (₹37,800 Cr)</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">52-Week Range</span>
                <span className="stat-val">₹185.00 – ₹342.00</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">Shares Outstanding</span>
                <span className="stat-val">132.8 Cr (Fully Diluted)</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">Latest Institutional Round</span>
                <span className="stat-val">Series H ($900M Meta Strategic)</span>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Cap Table & Order Book */}
          <Reveal as="div" delay={100} className="share-side-stack">
            {/* Cap Table Card */}
            <div className="card cap-table-card">
              <div className="card-mini-head">
                <PieChart size={18} className="accent-cyan" />
                <h3>Institutional Cap Table Breakdown</h3>
              </div>
              <p className="card-sub-txt">Fully diluted equity ownership post-Series H ($900M Meta investment).</p>

              <div className="cap-bar-wrapper">
                <div className="cap-stacked-bar">
                  {capTableList.map((item) => (
                    <div
                      key={item.holder}
                      className="cap-bar-segment"
                      style={{ width: `${item.share}%`, backgroundColor: item.color }}
                      title={`${item.holder}: ${item.share}%`}
                    />
                  ))}
                </div>
              </div>

              <div className="cap-list">
                {capTableList.map((item) => (
                  <div className="cap-item" key={item.holder}>
                    <div className="cap-left">
                      <span className="cap-color-dot" style={{ backgroundColor: item.color }} />
                      <span className="cap-holder-name">{item.holder}</span>
                    </div>
                    <span className="cap-share-pct">{item.share}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Order Book Card */}
            <div className="card order-book-card">
              <div className="card-mini-head">
                <Clock size={18} className="accent-gold" />
                <h3>Secondary Market Order Book</h3>
              </div>
              <div className="order-book-table">
                <div className="ob-col">
                  <div className="ob-head green">BID (BUYERS)</div>
                  <div className="ob-row"><span>₹284.20</span><span className="qty">15,000</span></div>
                  <div className="ob-row"><span>₹283.80</span><span className="qty">32,000</span></div>
                  <div className="ob-row"><span>₹283.00</span><span className="qty">50,000</span></div>
                </div>
                <div className="ob-col">
                  <div className="ob-head red">ASK (SELLERS)</div>
                  <div className="ob-row"><span>₹284.80</span><span className="qty">12,000</span></div>
                  <div className="ob-row"><span>₹285.50</span><span className="qty">28,000</span></div>
                  <div className="ob-row"><span>₹286.00</span><span className="qty">45,000</span></div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Interactive Live Valuation Simulator */}
        <Reveal as="div" delay={150} className="card valuation-simulator-card">
          <div className="sim-head">
            <div className="sim-title">
              <Sliders size={20} className="accent-gold" />
              <h3>Interactive Valuation Sensitivity Simulator</h3>
            </div>
            <p>
              Model CRED's enterprise valuation based on projected transacting member expansion, ARPU growth, and EV/Sales multiples.
            </p>
          </div>

          <div className="sim-controls-grid">
            {/* Control 1: Members */}
            <div className="sim-control">
              <div className="control-label">
                <span>Active Prime Members</span>
                <strong>{simMembers.toFixed(1)} Million</strong>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                step="0.5"
                value={simMembers}
                onChange={(e) => setSimMembers(parseFloat(e.target.value))}
                className="sim-slider"
              />
              <div className="slider-limits">
                <span>10M</span>
                <span>Current: 15.2M</span>
                <span>35M</span>
              </div>
            </div>

            {/* Control 2: ARPU */}
            <div className="sim-control">
              <div className="control-label">
                <span>Annualized ARPU</span>
                <strong>₹{simArpu.toLocaleString("en-IN")} / year</strong>
              </div>
              <input
                type="range"
                min="1200"
                max="5000"
                step="50"
                value={simArpu}
                onChange={(e) => setSimArpu(parseInt(e.target.value, 10))}
                className="sim-slider"
              />
              <div className="slider-limits">
                <span>₹1,200</span>
                <span>Current: ₹2,150</span>
                <span>₹5,000</span>
              </div>
            </div>

            {/* Control 3: Multiple */}
            <div className="sim-control">
              <div className="control-label">
                <span>EV / Revenue Multiple</span>
                <strong>{simMultiple}x</strong>
              </div>
              <input
                type="range"
                min="6"
                max="25"
                step="1"
                value={simMultiple}
                onChange={(e) => setSimMultiple(parseInt(e.target.value, 10))}
                className="sim-slider"
              />
              <div className="slider-limits">
                <span>6x (Conservative)</span>
                <span>14x (Fintech Median)</span>
                <span>25x (Bull)</span>
              </div>
            </div>
          </div>

          <div className="sim-result-banner">
            <div className="res-block">
              <span className="res-label">Projected Annual Operating Revenue</span>
              <span className="res-value">₹{simRevenueCr.toLocaleString("en-IN")} Cr</span>
            </div>
            <div className="res-divider" />
            <div className="res-block">
              <span className="res-label">Projected Implied Enterprise Valuation</span>
              <span className="res-value accent-green">${simValuationUsd} Billion</span>
            </div>
            <div className="res-divider" />
            <div className="res-block">
              <span className="res-label">Implied Share Price (Fully Diluted)</span>
              <span className="res-value accent-gold">
                ₹{((parseFloat(simValuationUsd) * 8400) / 132.8).toFixed(2)}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
