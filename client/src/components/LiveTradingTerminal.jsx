import { useState, useMemo, useRef, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, Activity, Zap, Shield, Clock, 
  BarChart3, RefreshCw, Layers, Sliders, ChevronDown, Check,
  Radio, Eye, AlertCircle, ArrowUpRight, ArrowDownRight, Compass
} from "lucide-react";
import Reveal from "./Reveal";

export default function LiveTradingTerminal({
  tradingState = {},
  onSelectSymbol
}) {
  const {
    selectedSymbol = "CRED:UNLST",
    changeSymbol = () => {},
    quote = {
      symbol: "CRED:UNLST",
      name: "CRED (Dreamplug Technologies)",
      assetClass: "Unlisted Secondary Equity / OTC Series H",
      price: 284.50,
      currency: "INR",
      change: +3.85,
      pctChange: +1.37,
      high24h: 288.90,
      low24h: 279.80,
      open24h: 280.65,
      prevClose: 280.65,
      volume24h: 428950,
      vwap: 284.12,
      impliedMarketCapUsd: 4.50,
      sharesOutstandingM: 1320.4,
      timestamp: Date.now()
    },
    peers = [],
    orderBook = {
      symbol: "CRED:UNLST",
      spread: 0.60,
      spreadBps: 21.1,
      bids: [],
      asks: [],
      totalBidVol: 45000,
      totalAskVol: 42000,
      imbalance: 0.034
    },
    tape = [],
    news = [],
    telemetry = {
      activeConnections: 1,
      engineLatencyMs: 0.8,
      ticksProcessed: 1420,
      matchingEngine: "V8 Real-Time L2 Order Router",
      settlementCycle: "T+1 OTC Escrow",
      dailyTpvCr: 2489.42,
      upiVelocityTps: 214,
      currentImpliedValuationB: 4.50
    },
    isConnected = false,
    lastTickSide = "neutral",
    tickFlash = false,
    candles = [],
    resolution = "1D",
    changeResolution = () => {},
    isLoadingCandles = false
  } = tradingState || {};

  const [chartMode, setChartMode] = useState("CANDLE"); // "CANDLE", "AREA", "DEPTH"
  const [activeIndicators, setActiveIndicators] = useState({
    sma20: true,
    ema50: false,
    bollinger: false,
    rsi: true,
    volume: true
  });
  const [newsFilter, setNewsFilter] = useState("ALL");
  const [hoveredCandle, setHoveredCandle] = useState(null);

  const canvasRef = useRef(null);

  const resolutionsList = [
    { id: "1s", label: "1s Live" },
    { id: "5s", label: "5s" },
    { id: "1m", label: "1m" },
    { id: "15m", label: "15m" },
    { id: "1D", label: "1D" },
    { id: "1W", label: "1W" },
    { id: "1Y", label: "1Y" },
    { id: "ALL", label: "ALL" }
  ];

  const toggleIndicator = (key) => {
    setActiveIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Technical Indicators Calculation (SMA, EMA, Bollinger, RSI)
  const computedData = useMemo(() => {
    if (!Array.isArray(candles) || candles.length === 0) {
      return { candles: [], sma20: [], ema: [], bUpper: [], bLower: [], rsi: [] };
    }

    const closes = candles.map((c) => c.close || c.price || 0);
    const n = closes.length;

    // SMA 20
    const sma20 = [];
    for (let i = 0; i < n; i++) {
      if (i < 19) {
        sma20.push(null);
      } else {
        const slice = closes.slice(i - 19, i + 1);
        const sum = slice.reduce((a, b) => a + b, 0);
        sma20.push(Number((sum / 20).toFixed(2)));
      }
    }

    // EMA 50 (or smaller if fewer candles)
    const emaPeriod = Math.min(20, Math.max(5, Math.floor(n / 3)));
    const k = 2 / (emaPeriod + 1);
    const ema = [];
    let prevEma = closes[0] || 0;
    for (let i = 0; i < n; i++) {
      if (i === 0) {
        ema.push(prevEma);
      } else {
        const currentEma = (closes[i] * k) + (prevEma * (1 - k));
        ema.push(Number(currentEma.toFixed(2)));
        prevEma = currentEma;
      }
    }

    // Bollinger Bands (20, 2)
    const bUpper = [];
    const bLower = [];
    for (let i = 0; i < n; i++) {
      if (i < 19 || !sma20[i]) {
        bUpper.push(null);
        bLower.push(null);
      } else {
        const slice = closes.slice(i - 19, i + 1);
        const mean = sma20[i];
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 20;
        const stdDev = Math.sqrt(variance);
        bUpper.push(Number((mean + 2 * stdDev).toFixed(2)));
        bLower.push(Number((mean - 2 * stdDev).toFixed(2)));
      }
    }

    // RSI 14
    const rsi = [];
    let gains = 0;
    let losses = 0;
    for (let i = 0; i < n; i++) {
      if (i === 0) {
        rsi.push(50);
        continue;
      }
      const change = closes[i] - closes[i - 1];
      if (i <= 14) {
        if (change >= 0) gains += change;
        else losses += Math.abs(change);
        if (i === 14) {
          const avgGain = gains / 14;
          const avgLoss = losses / 14;
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          rsi.push(Number((100 - (100 / (1 + rs))).toFixed(1)));
        } else {
          rsi.push(50);
        }
      } else {
        const currentGain = change >= 0 ? change : 0;
        const currentLoss = change < 0 ? Math.abs(change) : 0;
        gains = (gains * 13 + currentGain) / 14;
        losses = (losses * 13 + currentLoss) / 14;
        const rs = losses === 0 ? 100 : gains / losses;
        rsi.push(Number((100 - (100 / (1 + rs))).toFixed(1)));
      }
    }

    return { candles, sma20, ema, bUpper, bLower, rsi };
  }, [candles]);

  // High-Precision HTML5 Canvas Render Loop for Candlestick & Trading Overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI retina screens
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0c0d12";
    ctx.fillRect(0, 0, width, height);

    const data = computedData.candles;
    if (!data || data.length === 0) {
      ctx.fillStyle = "#656874";
      ctx.font = "13px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("Loading Real-Time Order Stream & Candlesticks...", width / 2, height / 2);
      return;
    }

    // Determine layout splits (Main chart 75%, RSI indicator subpanel 25% if active)
    const showRsi = activeIndicators.rsi;
    const mainHeight = showRsi ? height * 0.74 : height - 28;
    const rsiTop = showRsi ? height * 0.77 : height;
    const rsiHeight = height - rsiTop - 18;
    const rightMargin = 72; // for price axis
    const chartWidth = width - rightMargin;

    // Find price min/max
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    data.forEach((c) => {
      minPrice = Math.min(minPrice, c.low);
      maxPrice = Math.max(maxPrice, c.high);
      maxVolume = Math.max(maxVolume, c.volume);
    });

    if (computedData?.bUpper?.length > 0 && activeIndicators.bollinger) {
      computedData.bUpper.forEach((val) => { if (val) maxPrice = Math.max(maxPrice, val); });
      computedData.bLower.forEach((val) => { if (val) minPrice = Math.min(minPrice, val); });
    }

    // Add 4% padding top and bottom
    const priceRange = Math.max(1, maxPrice - minPrice);
    const paddedMin = minPrice - priceRange * 0.05;
    const paddedMax = maxPrice + priceRange * 0.05;
    const paddedRange = paddedMax - paddedMin;

    const getY = (price) => {
      return mainHeight - ((price - paddedMin) / paddedRange) * mainHeight;
    };

    // Draw Price Grid Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const priceLevel = paddedMin + (paddedRange / gridSteps) * i;
      const y = getY(priceLevel);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price Axis Label
      ctx.fillStyle = "#8a8d9a";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(priceLevel.toFixed(2), chartWidth + 8, y + 4);
    }

    // Horizontal Price Separator
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.moveTo(chartWidth, 0);
    ctx.lineTo(chartWidth, height);
    ctx.stroke();

    const n = data.length;
    const candleSlotWidth = chartWidth / n;
    const candleWidth = Math.max(2, Math.min(16, candleSlotWidth * 0.7));

    // Draw Volume Profile at bottom of main chart if enabled
    if (activeIndicators.volume && maxVolume > 0) {
      const maxVolHeight = mainHeight * 0.22;
      data.forEach((c, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const vHeight = (c.volume / maxVolume) * maxVolHeight;
        const vY = mainHeight - vHeight;
        const isGreen = c.close >= c.open;

        ctx.fillStyle = isGreen ? "rgba(0, 223, 130, 0.18)" : "rgba(255, 51, 85, 0.18)";
        ctx.fillRect(x - candleWidth / 2, vY, candleWidth, vHeight);
      });
    }

    // Draw Area Chart Mode
    if (chartMode === "AREA") {
      const gradient = ctx.createLinearGradient(0, 0, 0, mainHeight);
      gradient.addColorStop(0, "rgba(0, 223, 130, 0.35)");
      gradient.addColorStop(1, "rgba(0, 223, 130, 0.00)");

      ctx.beginPath();
      data.forEach((c, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      // Fill area
      ctx.lineTo((n - 1) * candleSlotWidth + candleSlotWidth / 2, mainHeight);
      ctx.lineTo(candleSlotWidth / 2, mainHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke line
      ctx.beginPath();
      data.forEach((c, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#00df82";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw Candlestick Mode
    if (chartMode === "CANDLE") {
      data.forEach((c, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);
        const isUp = c.close >= c.open;

        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

        ctx.strokeStyle = isUp ? "#00df82" : "#ff3355";
        ctx.fillStyle = isUp ? "#00df82" : "#ff3355";
        ctx.lineWidth = 1.2;

        // Wick line
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle Body
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    }

    // Draw SMA 20 Overlay
    if (activeIndicators.sma20 && computedData.sma20) {
      ctx.beginPath();
      let started = false;
      computedData.sma20.forEach((val, idx) => {
        if (val === null) return;
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(val);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = "#ffd700"; // Gold
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw EMA 50 Overlay
    if (activeIndicators.ema50 && computedData.ema) {
      ctx.beginPath();
      computedData.ema.forEach((val, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(val);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#00e5ff"; // Electric Cyan
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw Bollinger Bands (Upper/Lower)
    if (activeIndicators.bollinger && computedData.bUpper && computedData.bLower) {
      // Upper band
      ctx.beginPath();
      let sUp = false;
      computedData.bUpper.forEach((val, idx) => {
        if (!val) return;
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(val);
        if (!sUp) { ctx.moveTo(x, y); sUp = true; }
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "rgba(179, 136, 255, 0.7)";
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      // Lower band
      ctx.beginPath();
      let sLow = false;
      computedData.bLower.forEach((val, idx) => {
        if (!val) return;
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(val);
        if (!sLow) { ctx.moveTo(x, y); sLow = true; }
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "rgba(179, 136, 255, 0.7)";
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Current Price Pulse Line
    const currentPrice = quote.price;
    const currentY = getY(currentPrice);
    ctx.strokeStyle = lastTickSide === "up" ? "#00df82" : lastTickSide === "down" ? "#ff3355" : "#ffd700";
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current Price Badge on Right Axis
    ctx.fillStyle = lastTickSide === "up" ? "#00df82" : lastTickSide === "down" ? "#ff3355" : "#ffd700";
    ctx.fillRect(chartWidth, currentY - 10, rightMargin, 20);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(` ${currentPrice.toFixed(2)}`, chartWidth + 4, currentY + 4);

    // Render RSI Indicator Sub-panel
    if (showRsi && computedData.rsi) {
      // Subpanel background
      ctx.fillStyle = "#090a0e";
      ctx.fillRect(0, rsiTop, width, rsiHeight + 18);

      // Separator
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.moveTo(0, rsiTop);
      ctx.lineTo(width, rsiTop);
      ctx.stroke();

      // RSI Overbought (70) and Oversold (30) levels
      const rsiY70 = rsiTop + rsiHeight * 0.3;
      const rsiY30 = rsiTop + rsiHeight * 0.7;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, rsiY70);
      ctx.lineTo(chartWidth, rsiY70);
      ctx.moveTo(0, rsiY30);
      ctx.lineTo(chartWidth, rsiY30);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#8a8d9a";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("70 (OB)", chartWidth + 6, rsiY70 + 3);
      ctx.fillText("30 (OS)", chartWidth + 6, rsiY30 + 3);
      ctx.fillText("RSI(14)", 10, rsiTop + 14);

      // RSI Curve
      ctx.beginPath();
      computedData.rsi.forEach((rVal, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const rY = rsiTop + (1 - rVal / 100) * rsiHeight;
        if (idx === 0) ctx.moveTo(x, rY);
        else ctx.lineTo(x, rY);
      });
      ctx.strokeStyle = "#b388ff";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

  }, [computedData, chartMode, activeIndicators, quote.price, lastTickSide]);

  // Handle canvas mouse move for interactive crosshair & OHLC tooltip
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !computedData?.candles?.length) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const chartWidth = rect.width - 72;
    const slotWidth = chartWidth / computedData.candles.length;
    const idx = Math.floor(x / slotWidth);
    if (idx >= 0 && idx < computedData.candles.length) {
      setHoveredCandle(computedData.candles[idx]);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
  };

  const isPositive = quote.change >= 0;

  // Filter news
  const filteredNews = useMemo(() => {
    if (!news) return [];
    if (newsFilter === "ALL") return news;
    return news.filter((n) => n.category && n.category.toUpperCase().includes(newsFilter));
  }, [news, newsFilter]);

  return (
    <section id="trading-terminal" className="terminal-section">
      <div className="container">
        
        {/* Terminal Header & Real-Time Telemetry Bar */}
        <Reveal>
          <div className="terminal-masthead">
            <div className="masthead-left">
              <div className="terminal-badge">
                <span className="pulse-dot"></span>
                <span>INSTITUTIONAL OTC TRADING DESK</span>
              </div>
              <h2 className="terminal-title">
                Real-Time Market Terminal &amp; Price Action
              </h2>
              <p className="terminal-subtitle">
                Sub-second level tick streaming, Level 2 order book depth, Time &amp; Sales tape, and multi-asset fintech valuation comps for Dreamplug Technologies (CRED).
              </p>
            </div>

            <div className="masthead-right">
              <div className="engine-stat-pill">
                <Radio className={`icon-sm ${isConnected ? "text-green" : "text-red animate-pulse"}`} />
                <span>Engine: <strong>{telemetry.matchingEngine}</strong></span>
                <span className="divider">|</span>
                <span>Latency: <strong>{telemetry.engineLatencyMs} ms</strong></span>
                <span className="divider">|</span>
                <span className="badge-settle">{telemetry.settlementCycle}</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Multi-Asset Ticker Switcher Bar */}
        <Reveal delay={0.05}>
          <div className="ticker-switcher-bar">
            <div className="switcher-label">MARKET ASSETS:</div>
            <div className="ticker-scroll">
              {peers && peers.map((p) => {
                const isSelected = selectedSymbol === p.symbol;
                const isUp = p.change >= 0;
                return (
                  <button
                    key={p.symbol}
                    onClick={() => changeSymbol(p.symbol)}
                    className={`ticker-chip ${isSelected ? "active" : ""}`}
                  >
                    <div className="chip-header">
                      <span className="chip-symbol">{p.symbol}</span>
                      <span className={`chip-badge ${isUp ? "positive" : "negative"}`}>
                        {isUp ? "+" : ""}{p.pctChange}%
                      </span>
                    </div>
                    <div className="chip-price">
                      {p.currency === "INR" ? "₹" : "$"}{p.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Main Terminal Grid: Chart Center (Left/Center) + Order Book & Tape (Right) */}
        <Reveal delay={0.1}>
          <div className="terminal-grid">

            {/* Left Column: Primary Chart & Indicators */}
            <div className="terminal-main-deck">
              
              {/* Primary Quote Bar */}
              <div className="quote-bar">
                <div className="quote-primary">
                  <div className="quote-symbol-row">
                    <span className="quote-symbol">{quote.symbol}</span>
                    <span className="quote-asset-class">{quote.assetClass}</span>
                    {tickFlash && (
                      <span className={`tick-flash-badge ${lastTickSide === "up" ? "flash-green" : "flash-red"}`}>
                        {lastTickSide === "up" ? "▲ TICK UP" : "▼ TICK DOWN"}
                      </span>
                    )}
                  </div>
                  <div className="quote-price-row">
                    <span className={`quote-large-price ${lastTickSide === "up" ? "price-tick-green" : lastTickSide === "down" ? "price-tick-red" : ""}`}>
                      ₹{quote.price.toFixed(2)}
                    </span>
                    <div className={`quote-change-box ${isPositive ? "change-up" : "change-down"}`}>
                      {isPositive ? <ArrowUpRight className="icon-md" /> : <ArrowDownRight className="icon-md" />}
                      <span>{isPositive ? "+" : ""}{quote.change.toFixed(2)} ({isPositive ? "+" : ""}{quote.pctChange}%)</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Quick Ribbon */}
                <div className="quote-metrics-ribbon">
                  <div className="metric-cell">
                    <span className="cell-label">24H HIGH</span>
                    <span className="cell-val text-green">₹{quote.high24h.toFixed(2)}</span>
                  </div>
                  <div className="metric-cell">
                    <span className="cell-label">24H LOW</span>
                    <span className="cell-val text-red">₹{quote.low24h.toFixed(2)}</span>
                  </div>
                  <div className="metric-cell">
                    <span className="cell-label">VWAP</span>
                    <span className="cell-val text-cyan">₹{quote.vwap.toFixed(2)}</span>
                  </div>
                  <div className="metric-cell">
                    <span className="cell-label">OTC VOLUME</span>
                    <span className="cell-val font-mono">{quote.volume24h.toLocaleString("en-IN")} sh</span>
                  </div>
                  <div className="metric-cell highlight">
                    <span className="cell-label">IMPLIED MARKET CAP</span>
                    <span className="cell-val text-gold">${quote.impliedMarketCapUsd || 4.50}B (₹37,800 Cr)</span>
                  </div>
                </div>
              </div>

              {/* Chart Controls Bar */}
              <div className="chart-controls-bar">
                {/* Timeframe selector */}
                <div className="timeframe-group">
                  {resolutionsList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => changeResolution(r.id)}
                      className={`tf-btn ${resolution === r.id ? "active" : ""}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Chart Type Toggle */}
                <div className="chart-type-group">
                  <button
                    onClick={() => setChartMode("CANDLE")}
                    className={`type-btn ${chartMode === "CANDLE" ? "active" : ""}`}
                  >
                    <BarChart3 className="icon-xs" />
                    <span>Candles</span>
                  </button>
                  <button
                    onClick={() => setChartMode("AREA")}
                    className={`type-btn ${chartMode === "AREA" ? "active" : ""}`}
                  >
                    <Activity className="icon-xs" />
                    <span>Area</span>
                  </button>
                </div>

                {/* Indicators Toggles */}
                <div className="indicators-group">
                  <button
                    onClick={() => toggleIndicator("sma20")}
                    className={`ind-pill ${activeIndicators.sma20 ? "active-gold" : ""}`}
                  >
                    SMA 20
                  </button>
                  <button
                    onClick={() => toggleIndicator("ema50")}
                    className={`ind-pill ${activeIndicators.ema50 ? "active-cyan" : ""}`}
                  >
                    EMA 50
                  </button>
                  <button
                    onClick={() => toggleIndicator("bollinger")}
                    className={`ind-pill ${activeIndicators.bollinger ? "active-purple" : ""}`}
                  >
                    Bollinger
                  </button>
                  <button
                    onClick={() => toggleIndicator("rsi")}
                    className={`ind-pill ${activeIndicators.rsi ? "active-purple" : ""}`}
                  >
                    RSI (14)
                  </button>
                  <button
                    onClick={() => toggleIndicator("volume")}
                    className={`ind-pill ${activeIndicators.volume ? "active-green" : ""}`}
                  >
                    Volume
                  </button>
                </div>
              </div>

              {/* Live Canvas Viewport */}
              <div className="chart-viewport-wrapper">
                {/* Hovered Candle HUD overlay */}
                {hoveredCandle && (
                  <div className="candle-hud">
                    <span className="hud-time">{new Date(hoveredCandle.time).toLocaleTimeString()}</span>
                    <span>O: <strong className="font-mono">{hoveredCandle.open.toFixed(2)}</strong></span>
                    <span>H: <strong className="font-mono text-green">{hoveredCandle.high.toFixed(2)}</strong></span>
                    <span>L: <strong className="font-mono text-red">{hoveredCandle.low.toFixed(2)}</strong></span>
                    <span>C: <strong className="font-mono">{hoveredCandle.close.toFixed(2)}</strong></span>
                    <span>Vol: <strong className="font-mono text-cyan">{hoveredCandle.volume.toLocaleString()}</strong></span>
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="trading-canvas"
                />
              </div>

              {/* Terminal Legend & Status */}
              <div className="chart-footer-bar">
                <div className="legend-items">
                  <span className="legend-item"><span className="legend-dot green"></span> Bullish Candle</span>
                  <span className="legend-item"><span className="legend-dot red"></span> Bearish Candle</span>
                  {activeIndicators.sma20 && (
                    <span className="legend-item">
                      <span className="legend-dot gold"></span> 
                      SMA 20 ({computedData?.sma20?.length ? `₹${computedData.sma20[computedData.sma20.length - 1] || "..."}` : "..."})
                    </span>
                  )}
                  {activeIndicators.ema50 && <span className="legend-item"><span className="legend-dot cyan"></span> EMA 50</span>}
                  {activeIndicators.bollinger && <span className="legend-item"><span className="legend-dot purple"></span> BBands (20,2)</span>}
                </div>
                <div className="market-note">
                  Real-time algorithmic Brownian motion &amp; Poisson jump stream
                </div>
              </div>
            </div>

            {/* Right Column: Level 2 Order Book & Time and Sales (The Tape) */}
            <div className="terminal-side-deck">

              {/* Level 2 Order Book Section */}
              <div className="terminal-panel orderbook-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Layers className="icon-sm text-green" />
                    <span>LEVEL 2 ORDER BOOK</span>
                  </div>
                  <div className="spread-tag">
                    Spread: <strong>{orderBook.spread || 0.60}</strong> ({orderBook.spreadBps || 21.1} bps)
                  </div>
                </div>

                {/* Buy vs Sell Pressure Imbalance Meter */}
                <div className="pressure-meter-box">
                  <div className="pressure-labels">
                    <span className="text-green font-mono">Bids {(100 - (orderBook.imbalance > 0 ? (1 - orderBook.imbalance) * 50 : 50)).toFixed(0)}%</span>
                    <span className="text-muted">Order Imbalance</span>
                    <span className="text-red font-mono">Asks {(50 - (orderBook.imbalance || 0) * 50).toFixed(0)}%</span>
                  </div>
                  <div className="pressure-bar">
                    <div 
                      className="bar-bids" 
                      style={{ width: `${Math.min(90, Math.max(10, 50 + (orderBook.imbalance || 0) * 50))}%` }}
                    />
                  </div>
                </div>

                {/* Depth Table */}
                <div className="orderbook-table-container">
                  <div className="ob-table-header">
                    <span>PRICE (INR)</span>
                    <span>SIZE (SH)</span>
                    <span>TOTAL</span>
                  </div>

                  {/* Asks (Sells) in reverse order (red) */}
                  <div className="ob-rows asks-side">
                    {orderBook.asks && orderBook.asks.slice(0, 6).reverse().map((a, i) => {
                      const depthPct = Math.min(100, (a.total / (orderBook.totalAskVol || 1)) * 100);
                      return (
                        <div key={`ask-${i}`} className="ob-row ask-row">
                          <div className="depth-fill red-fill" style={{ width: `${depthPct}%` }} />
                          <span className="ob-price text-red font-mono">{a.price.toFixed(2)}</span>
                          <span className="ob-size font-mono">{a.size.toLocaleString()}</span>
                          <span className="ob-total font-mono text-muted">{a.total.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mid Price Separator Ribbon */}
                  <div className="ob-mid-ribbon">
                    <span className="mid-label">MID:</span>
                    <span className={`mid-price ${lastTickSide === "up" ? "text-green" : "text-red"}`}>
                      ₹{quote.price.toFixed(2)}
                    </span>
                    <span className="mid-delta">{quote.pctChange >= 0 ? "+" : ""}{quote.pctChange}%</span>
                  </div>

                  {/* Bids (Buys) in descending order (green) */}
                  <div className="ob-rows bids-side">
                    {orderBook.bids && orderBook.bids.slice(0, 6).map((b, i) => {
                      const depthPct = Math.min(100, (b.total / (orderBook.totalBidVol || 1)) * 100);
                      return (
                        <div key={`bid-${i}`} className="ob-row bid-row">
                          <div className="depth-fill green-fill" style={{ width: `${depthPct}%` }} />
                          <span className="ob-price text-green font-mono">{b.price.toFixed(2)}</span>
                          <span className="ob-size font-mono">{b.size.toLocaleString()}</span>
                          <span className="ob-total font-mono text-muted">{b.total.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time & Sales (The Tape) */}
              <div className="terminal-panel tape-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Activity className="icon-sm text-cyan" />
                    <span>TIME &amp; SALES (THE TAPE)</span>
                  </div>
                  <div className="tape-live-tag">
                    <span className="pulse-dot"></span> LIVE
                  </div>
                </div>

                <div className="tape-list-container">
                  <div className="tape-header">
                    <span>TIME</span>
                    <span>PRICE</span>
                    <span>QTY</span>
                    <span>INSTITUTION</span>
                  </div>
                  <div className="tape-rows">
                    {tape && tape.slice(0, 12).map((t, idx) => {
                      const isBuy = t.side === "BUY";
                      return (
                        <div key={t.id || idx} className={`tape-row ${idx === 0 ? "new-trade-flash" : ""}`}>
                          <span className="tape-time font-mono text-muted">{t.time}</span>
                          <span className={`tape-price font-mono ${isBuy ? "text-green" : "text-red"}`}>
                            ₹{t.price.toFixed(2)}
                          </span>
                          <span className="tape-size font-mono">
                            {t.size.toLocaleString()}
                          </span>
                          <span className="tape-inst truncate" title={t.institution}>
                            {t.institution.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </Reveal>

        {/* Live Financial Wire & Macro News Ticker */}
        <Reveal delay={0.15}>
          <div className="financial-news-terminal">
            <div className="news-header-bar">
              <div className="news-title">
                <Zap className="icon-sm text-gold" />
                <span>REAL-TIME FINANCIAL WIRE &amp; SENTIMENT FEED</span>
              </div>
              <div className="news-filters">
                {["ALL", "EARNINGS", "M&A", "REGULATORY", "CREDIT"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewsFilter(cat)}
                    className={`news-filter-btn ${newsFilter === cat ? "active" : ""}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="news-stream-grid">
              {filteredNews.slice(0, 4).map((n) => {
                const isBullish = n.sentiment > 0.65;
                return (
                  <div key={n.id} className="news-card">
                    <div className="news-card-meta">
                      <span className="news-source">{n.source}</span>
                      <span className="news-time font-mono">{n.timeAgo}</span>
                    </div>
                    <h4 className="news-headline">{n.headline}</h4>
                    <div className="news-card-footer">
                      <span className="news-category-badge">{n.category}</span>
                      <span className={`news-sentiment-badge ${isBullish ? "sentiment-bull" : "sentiment-neutral"}`}>
                        {isBullish ? "▲ Bullish" : "● Neutral"} ({(n.sentiment * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
