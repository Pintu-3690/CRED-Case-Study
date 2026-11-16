import { useState, useMemo, useRef, useEffect } from "react";
import {
  Activity, Zap, Layers, BarChart3, Radio,
  ArrowUpRight, ArrowDownRight, Briefcase, RotateCcw
} from "lucide-react";
import Reveal from "./Reveal";

export default function LiveTradingTerminal({ tradingState = {} }) {
  const {
    selectedSymbol = "CRED:UNLST",
    changeSymbol = () => {},
    quote = {
      symbol: "CRED:UNLST",
      name: "CRED (Dreamplug Technologies)",
      assetClass: "Unlisted Secondary Equity / OTC Series H",
      price: 284.50,
      currency: "INR",
      change: 3.85,
      pctChange: 1.37,
      high24h: 288.90,
      low24h: 279.80,
      open24h: 280.65,
      prevClose: 280.65,
      volume24h: 428950,
      vwap: 284.12,
      lotSize: 50,
      impliedMarketCapUsd: 4.30,
      impliedMarketCapInrCr: 37565,
      sharesOutstandingM: 1320.4,
      timestamp: Date.now()
    },
    credQuote = {
      price: 284.50,
      sharesOutstandingM: 1320.4
    },
    usdInrRate = 87.42,
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
      matchingEngine: "OTC Secondary Order Router",
      settlementCycle: "T+1 OTC Escrow",
      dailyTpvCr: 2489.42,
      upiVelocityTps: 214,
      currentImpliedValuationB: 4.30
    },
    isConnected = false,
    lastTickSide = "neutral",
    tickFlash = false,
    candles = [],
    resolution = "1D",
    changeResolution = () => {}
  } = tradingState || {};

  const [chartMode, setChartMode] = useState("CANDLE");
  const [activeIndicators, setActiveIndicators] = useState({
    sma20: true,
    ema50: false,
    bollinger: false,
    rsi: true,
    volume: true
  });
  const [newsFilter, setNewsFilter] = useState("ALL");
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 480 });

  // Interactive CRED OTC Order & Position Desk State
  const [orderSide, setOrderSide] = useState("BUY");
  const [orderType, setOrderType] = useState("MARKET");
  const [lotCount, setLotCount] = useState(2); // 1 Lot = 50 shares
  const [limitPrice, setLimitPrice] = useState(284.50);
  const [position, setPosition] = useState({ shares: 500, avgCost: 271.20 });
  const [orderNotice, setOrderNotice] = useState("");

  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const resolutionsList = [
    { id: "1s", label: "1s" },
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

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasSize({ width, height });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const computedData = useMemo(() => {
    if (!Array.isArray(candles) || candles.length === 0) {
      return { candles: [], sma20: [], ema: [], bUpper: [], bLower: [], rsi: [] };
    }

    const closes = candles.map((c) => c.close || c.price || 0);
    const n = closes.length;

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

    const emaPeriod = Math.min(20, Math.max(5, Math.floor(n / 3)));
    const k = 2 / (emaPeriod + 1);
    const ema = [];
    let prevEma = closes[0] || 0;
    for (let i = 0; i < n; i++) {
      if (i === 0) {
        ema.push(prevEma);
      } else {
        const currentEma = closes[i] * k + prevEma * (1 - k);
        ema.push(Number(currentEma.toFixed(2)));
        prevEma = currentEma;
      }
    }

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
          rsi.push(Number((100 - 100 / (1 + rs)).toFixed(1)));
        } else {
          rsi.push(50);
        }
      } else {
        const currentGain = change >= 0 ? change : 0;
        const currentLoss = change < 0 ? Math.abs(change) : 0;
        gains = (gains * 13 + currentGain) / 14;
        losses = (losses * 13 + currentLoss) / 14;
        const rs = losses === 0 ? 100 : gains / losses;
        rsi.push(Number((100 - 100 / (1 + rs)).toFixed(1)));
      }
    }

    return { candles, sma20, ema, bUpper, bLower, rsi };
  }, [candles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || canvasSize.width;
    const height = rect.height || canvasSize.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0a0c10";
    ctx.fillRect(0, 0, width, height);

    const data = computedData.candles;
    if (!data || data.length === 0) {
      ctx.fillStyle = "#8a8d9a";
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("Connecting to real-time market feed...", width / 2, height / 2);
      return;
    }

    const showRsi = activeIndicators.rsi;
    const timeAxisHeight = 24;
    const usableHeight = height - timeAxisHeight;
    const mainHeight = showRsi ? usableHeight * 0.74 : usableHeight - 8;
    const rsiTop = showRsi ? usableHeight * 0.77 : usableHeight;
    const rsiHeight = usableHeight - rsiTop - 8;
    const rightMargin = 78;
    const chartWidth = Math.max(100, width - rightMargin);

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    data.forEach((c) => {
      minPrice = Math.min(minPrice, c.low);
      maxPrice = Math.max(maxPrice, c.high);
      maxVolume = Math.max(maxVolume, c.volume);
    });

    if (computedData?.bUpper?.length > 0 && activeIndicators.bollinger) {
      computedData.bUpper.forEach((val) => {
        if (val) maxPrice = Math.max(maxPrice, val);
      });
      computedData.bLower.forEach((val) => {
        if (val) minPrice = Math.min(minPrice, val);
      });
    }

    const priceRange = Math.max(0.5, maxPrice - minPrice);
    const paddedMin = minPrice - priceRange * 0.08;
    const paddedMax = maxPrice + priceRange * 0.08;
    const paddedRange = paddedMax - paddedMin;

    const getY = (price) => mainHeight - ((price - paddedMin) / paddedRange) * mainHeight;

    // Horizontal Grid & Price Axis
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

      ctx.fillStyle = "#8a8f9e";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(priceLevel.toFixed(2), chartWidth + 8, y + 4);
    }

    // Right Price Axis Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(chartWidth, 0);
    ctx.lineTo(chartWidth, usableHeight);
    ctx.stroke();

    const n = data.length;
    const candleSlotWidth = chartWidth / n;
    const candleWidth = Math.max(2, Math.min(14, candleSlotWidth * 0.66));

    // Vertical Time Grid & Bottom Time Axis Labels
    const labelCount = Math.min(6, Math.max(3, Math.floor(chartWidth / 120)));
    const step = Math.max(1, Math.floor(n / labelCount));
    ctx.fillStyle = "#7a8090";
    ctx.font = "10.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";

    for (let idx = 0; idx < n; idx += step) {
      const x = idx * candleSlotWidth + candleSlotWidth / 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, usableHeight);
      ctx.stroke();

      const d = new Date(data[idx].time);
      const label =
        resolution === "1D" || resolution === "1W" || resolution === "1Y" || resolution === "ALL"
          ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
          : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      ctx.fillText(label, Math.min(chartWidth - 28, Math.max(28, x)), height - 7);
    }

    // Volume Bars
    if (activeIndicators.volume && maxVolume > 0) {
      const maxVolHeight = mainHeight * 0.2;
      data.forEach((c, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const vHeight = (c.volume / maxVolume) * maxVolHeight;
        const vY = mainHeight - vHeight;
        const isGreen = c.close >= c.open;
        ctx.fillStyle = isGreen ? "rgba(16, 185, 129, 0.18)" : "rgba(239, 68, 68, 0.18)";
        ctx.fillRect(x - candleWidth / 2, vY, candleWidth, vHeight);
      });
    }

    // Area Series
    if (chartMode === "AREA") {
      const gradient = ctx.createLinearGradient(0, 0, 0, mainHeight);
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.28)");
      gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

      ctx.beginPath();
      data.forEach((c, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo((n - 1) * candleSlotWidth + candleSlotWidth / 2, mainHeight);
      ctx.lineTo(candleSlotWidth / 2, mainHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      data.forEach((c, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Candlesticks
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

        ctx.strokeStyle = isUp ? "#10b981" : "#ef4444";
        ctx.fillStyle = isUp ? "#10b981" : "#ef4444";
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    }

    // Indicators
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
        } else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (activeIndicators.ema50 && computedData.ema) {
      ctx.beginPath();
      computedData.ema.forEach((val, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(val);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (activeIndicators.bollinger && computedData.bUpper && computedData.bLower) {
      ctx.beginPath();
      let sUp = false;
      computedData.bUpper.forEach((val, idx) => {
        if (!val) return;
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(val);
        if (!sUp) {
          ctx.moveTo(x, y);
          sUp = true;
        } else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "rgba(167, 139, 250, 0.7)";
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      ctx.beginPath();
      let sLow = false;
      computedData.bLower.forEach((val, idx) => {
        if (!val) return;
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const y = getY(val);
        if (!sLow) {
          ctx.moveTo(x, y);
          sLow = true;
        } else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Current Live Price Line
    const currentPrice = quote.price;
    const currentY = Math.min(mainHeight - 10, Math.max(10, getY(currentPrice)));
    const priceTagColor = lastTickSide === "up" ? "#10b981" : lastTickSide === "down" ? "#ef4444" : "#d4af37";
    ctx.strokeStyle = priceTagColor;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = priceTagColor;
    ctx.fillRect(chartWidth, currentY - 10, rightMargin, 20);
    ctx.fillStyle = "#08090c";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(` ${currentPrice.toFixed(2)}`, chartWidth + 6, currentY + 4);

    // Crosshair Overlay when hovering
    if (hoveredInfo && hoveredInfo.idx >= 0 && hoveredInfo.idx < n) {
      const cx = hoveredInfo.idx * candleSlotWidth + candleSlotWidth / 2;
      const cy = Math.min(mainHeight, Math.max(0, hoveredInfo.y));

      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, usableHeight);
      ctx.moveTo(0, cy);
      ctx.lineTo(chartWidth, cy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Bottom RSI Sub-chart
    if (showRsi && computedData.rsi) {
      ctx.fillStyle = "#08090d";
      ctx.fillRect(0, rsiTop, width, rsiHeight + 8);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(0, rsiTop);
      ctx.lineTo(width, rsiTop);
      ctx.stroke();

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

      ctx.fillStyle = "#8a8f9e";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("70 OB", chartWidth + 6, rsiY70 + 3);
      ctx.fillText("30 OS", chartWidth + 6, rsiY30 + 3);
      ctx.fillText("RSI(14)", 10, rsiTop + 14);

      ctx.beginPath();
      computedData.rsi.forEach((rVal, idx) => {
        const x = idx * candleSlotWidth + candleSlotWidth / 2;
        const rY = rsiTop + (1 - rVal / 100) * rsiHeight;
        if (idx === 0) ctx.moveTo(x, rY);
        else ctx.lineTo(x, rY);
      });
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // Time axis separator line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(0, usableHeight);
    ctx.lineTo(width, usableHeight);
    ctx.stroke();
  }, [computedData, chartMode, activeIndicators, quote.price, lastTickSide, canvasSize, hoveredInfo, resolution]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !computedData?.candles?.length) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const chartWidth = rect.width - 78;
    const slotWidth = chartWidth / computedData.candles.length;
    const idx = Math.floor(x / slotWidth);
    if (idx >= 0 && idx < computedData.candles.length) {
      setHoveredInfo({ idx, y, candle: computedData.candles[idx] });
    }
  };

  const handleMouseLeave = () => {
    setHoveredInfo(null);
  };

  const isPositive = quote.change >= 0;

  // Order book bid/ask imbalance percentages (always sum to 100%)
  const bidPct = Math.min(90, Math.max(10, Math.round(50 + (orderBook.imbalance || 0) * 50)));
  const askPct = 100 - bidPct;

  // Interactive CRED OTC Desk Calculations (linked directly to live CRED:UNLST price)
  const credLivePrice = credQuote?.price || 284.50;
  const lotSize = 50;
  const selectedSharesCount = Math.max(lotSize, lotCount * lotSize);
  const effectiveFillPrice = orderType === "LIMIT" ? Math.max(50, Number(limitPrice) || credLivePrice) : credLivePrice;
  const otcOrderInr = selectedSharesCount * effectiveFillPrice;
  const otcOrderUsd = otcOrderInr / usdInrRate;
  const credTotalShares = (credQuote?.sharesOutstandingM || 1320.4) * 1_000_000;
  const equityStakePct = (selectedSharesCount / credTotalShares) * 100;

  // Live Simulated Position P&L
  const positionMarketVal = position.shares * credLivePrice;
  const positionCostBasis = position.shares * position.avgCost;
  const positionPnlInr = positionMarketVal - positionCostBasis;
  const positionPnlPct = positionCostBasis > 0 ? (positionPnlInr / positionCostBasis) * 100 : 0;

  const handlePrefillLimitPrice = (price, side) => {
    setOrderType("LIMIT");
    setOrderSide(side);
    setLimitPrice(Number(price.toFixed(2)));
    setOrderNotice(`Loaded ₹${price.toFixed(2)} ${side === "BUY" ? "Bid" : "Ask"} level from Order Book.`);
  };

  const handleExecuteSimulatedOrder = () => {
    if (orderSide === "BUY") {
      const nextShares = position.shares + selectedSharesCount;
      const nextCost = (position.shares * position.avgCost + otcOrderInr) / nextShares;
      setPosition({ shares: nextShares, avgCost: nextCost });
      setOrderNotice(`Filled BUY ${selectedSharesCount.toLocaleString("en-IN")} CRED @ ₹${effectiveFillPrice.toFixed(2)}`);
    } else {
      if (position.shares === 0) {
        setOrderNotice("No simulated CRED shares held to sell.");
        return;
      }
      const sellQty = Math.min(position.shares, selectedSharesCount);
      setPosition((prev) => ({
        shares: prev.shares - sellQty,
        avgCost: prev.shares - sellQty === 0 ? 0 : prev.avgCost
      }));
      setOrderNotice(`Filled SELL ${sellQty.toLocaleString("en-IN")} CRED @ ₹${effectiveFillPrice.toFixed(2)}`);
    }
  };

  const filteredNews = useMemo(() => {
    if (!news) return [];
    if (newsFilter === "ALL") return news;
    return news.filter((n) => n.category && n.category.toUpperCase().includes(newsFilter));
  }, [news, newsFilter]);

  return (
    <section id="trading-terminal" className="terminal-section">
      <div className="container">
        <Reveal>
          <div className="terminal-masthead">
            <div className="masthead-left">
              <div className="editorial-kicker">
                <span>02</span>
                <span aria-hidden="true">·</span>
                <span>Institutional Secondary Market Desk</span>
              </div>
              <h2 className="terminal-title">
                Live CRED Market Price &amp; Multi-Asset Tape
              </h2>
              <p className="terminal-subtitle">
                Real-time OTC secondary feed for Dreamplug Technologies (CRED:UNLST) alongside listed Indian fintech benchmarks.
              </p>
            </div>

            <div className="masthead-right">
              <div className="engine-stat-bar tabular-nums">
                <span className={`live-indicator-dot ${isConnected ? "connected" : "disconnected"}`} />
                <Radio className={`icon-sm ${isConnected ? "text-green" : "text-red"}`} />
                <span>{isConnected ? "SSE Stream Active" : "Reconnecting"}</span>
                <span className="divider" aria-hidden="true">·</span>
                <span>{telemetry.engineLatencyMs} ms</span>
                <span className="divider" aria-hidden="true">·</span>
                <span>{telemetry.settlementCycle}</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Multi-Asset Ticker Switcher Bar */}
        <Reveal delay={40}>
          <div className="ticker-switcher-bar">
            <div className="switcher-label">Tracked Assets</div>
            <div className="ticker-scroll">
              {peers &&
                peers.map((p) => {
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
                        <span className={`chip-badge tabular-nums ${isUp ? "positive" : "negative"}`}>
                          {isUp ? "+" : ""}{p.pctChange.toFixed(2)}%
                        </span>
                      </div>
                      <div className="chip-price tabular-nums">
                        {p.currency === "INR" ? "₹" : "$"}
                        {p.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </Reveal>

        {/* Main Terminal Grid */}
        <Reveal delay={80}>
          <div className="terminal-grid">
            {/* Left: Chart & Live Quote */}
            <div className="terminal-main-deck">
              <div className="quote-bar">
                <div className="quote-primary">
                  <div className="quote-symbol-row">
                    <span className="quote-symbol">{quote.symbol}</span>
                    <span className="quote-asset-name">{quote.name}</span>
                    {tickFlash && (
                      <span className={`tick-flash-badge ${lastTickSide === "up" ? "flash-green" : "flash-red"}`}>
                        {lastTickSide === "up" ? "UP" : "DOWN"}
                      </span>
                    )}
                  </div>
                  <div className="quote-price-row">
                    <span
                      className={`quote-large-price tabular-nums ${
                        lastTickSide === "up" ? "price-tick-green" : lastTickSide === "down" ? "price-tick-red" : ""
                      }`}
                    >
                      ₹{quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                    <div className={`quote-change-box tabular-nums ${isPositive ? "change-up" : "change-down"}`}>
                      {isPositive ? <ArrowUpRight className="icon-md" /> : <ArrowDownRight className="icon-md" />}
                      <span>
                        {isPositive ? "+" : ""}{quote.change.toFixed(2)} ({isPositive ? "+" : ""}
                        {quote.pctChange.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="quote-metrics-ribbon tabular-nums">
                  <div className="metric-cell">
                    <span className="cell-label">24H High</span>
                    <span className="cell-val text-green">₹{quote.high24h.toFixed(2)}</span>
                  </div>
                  <div className="metric-cell">
                    <span className="cell-label">24H Low</span>
                    <span className="cell-val text-red">₹{quote.low24h.toFixed(2)}</span>
                  </div>
                  <div className="metric-cell">
                    <span className="cell-label">VWAP</span>
                    <span className="cell-val text-cyan">₹{quote.vwap.toFixed(2)}</span>
                  </div>
                  {quote.volume24h > 0 && (
                    <div className="metric-cell">
                      <span className="cell-label">24H Volume</span>
                      <span className="cell-val font-mono">{quote.volume24h.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {quote.impliedMarketCapUsd > 0 && (
                    <div className="metric-cell highlight">
                      <span className="cell-label">Live Market Cap</span>
                      <span className="cell-val text-gold">
                        ${quote.impliedMarketCapUsd.toFixed(2)}B (₹{(quote.impliedMarketCapInrCr || 37565).toLocaleString("en-IN")} Cr)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Controls Bar */}
              <div className="chart-controls-bar">
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
                    BBands
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
              <div className="chart-viewport-wrapper" ref={wrapperRef}>
                {hoveredInfo?.candle && (
                  <div className="candle-hud tabular-nums">
                    <span className="hud-time">
                      {new Date(hoveredInfo.candle.time).toLocaleString([], {
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                    <span>O: <strong className="font-mono">{hoveredInfo.candle.open.toFixed(2)}</strong></span>
                    <span>H: <strong className="font-mono text-green">{hoveredInfo.candle.high.toFixed(2)}</strong></span>
                    <span>L: <strong className="font-mono text-red">{hoveredInfo.candle.low.toFixed(2)}</strong></span>
                    <span>C: <strong className="font-mono">{hoveredInfo.candle.close.toFixed(2)}</strong></span>
                    <span>Vol: <strong className="font-mono text-cyan">{hoveredInfo.candle.volume.toLocaleString()}</strong></span>
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="trading-canvas"
                />
              </div>

              <div className="chart-footer-bar">
                <div className="legend-items">
                  <span className="legend-item"><span className="legend-dot green" /> Bullish</span>
                  <span className="legend-item"><span className="legend-dot red" /> Bearish</span>
                  {activeIndicators.sma20 && (
                    <span className="legend-item tabular-nums">
                      <span className="legend-dot gold" />
                      SMA 20 ({computedData?.sma20?.length ? `₹${computedData.sma20[computedData.sma20.length - 1] || "..."}` : "..."})
                    </span>
                  )}
                  {activeIndicators.ema50 && <span className="legend-item"><span className="legend-dot cyan" /> EMA 50</span>}
                  {activeIndicators.bollinger && <span className="legend-item"><span className="legend-dot purple" /> BBands (20,2)</span>}
                </div>
                <div className="market-note">
                  {quote.assetClass} · Click any Order Book level to load price
                </div>
              </div>
            </div>

            {/* Right: Level 2 Order Book, Time & Sales, and Interactive OTC Order & Portfolio Desk */}
            <div className="terminal-side-deck">
              <div className="terminal-panel orderbook-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Layers className="icon-sm text-green" />
                    <span>Level 2 Order Book</span>
                  </div>
                  <div className="spread-tag tabular-nums">
                    Spread: <strong>{orderBook.spread || 0.60}</strong> ({orderBook.spreadBps || 21.1} bps)
                  </div>
                </div>

                <div className="pressure-meter-box">
                  <div className="pressure-labels tabular-nums">
                    <span className="text-green font-mono">Bids {bidPct}%</span>
                    <span className="text-muted">Book Imbalance</span>
                    <span className="text-red font-mono">Asks {askPct}%</span>
                  </div>
                  <div className="pressure-bar">
                    <div className="bar-bids" style={{ width: `${bidPct}%` }} />
                  </div>
                </div>

                <div className="orderbook-table-container">
                  <div className="ob-table-header">
                    <span>Price (INR)</span>
                    <span>Size</span>
                    <span>Cumul.</span>
                  </div>

                  <div className="ob-rows asks-side tabular-nums">
                    {orderBook.asks &&
                      orderBook.asks
                        .slice(0, 5)
                        .reverse()
                        .map((a, i) => {
                          const depthPct = Math.min(100, (a.total / (orderBook.totalAskVol || 1)) * 100);
                          return (
                            <button
                              type="button"
                              key={`ask-${i}`}
                              onClick={() => handlePrefillLimitPrice(a.price, "BUY")}
                              className="ob-row ob-row-btn ask-row"
                              title="Click to populate Limit Buy price"
                            >
                              <div className="depth-fill red-fill" style={{ width: `${depthPct}%` }} />
                              <span className="ob-price text-red font-mono">{a.price.toFixed(2)}</span>
                              <span className="ob-size font-mono">{a.size.toLocaleString()}</span>
                              <span className="ob-total font-mono text-muted">{a.total.toLocaleString()}</span>
                            </button>
                          );
                        })}
                  </div>

                  <div className="ob-mid-ribbon tabular-nums">
                    <span className="mid-label">Mid</span>
                    <span className={`mid-price ${lastTickSide === "up" ? "text-green" : lastTickSide === "down" ? "text-red" : ""}`}>
                      ₹{quote.price.toFixed(2)}
                    </span>
                    <span className={`mid-delta ${isPositive ? "text-green" : "text-red"}`}>
                      {isPositive ? "+" : ""}{quote.pctChange.toFixed(2)}%
                    </span>
                  </div>

                  <div className="ob-rows bids-side tabular-nums">
                    {orderBook.bids &&
                      orderBook.bids.slice(0, 5).map((b, i) => {
                        const depthPct = Math.min(100, (b.total / (orderBook.totalBidVol || 1)) * 100);
                        return (
                          <button
                            type="button"
                            key={`bid-${i}`}
                            onClick={() => handlePrefillLimitPrice(b.price, "SELL")}
                            className="ob-row ob-row-btn bid-row"
                            title="Click to populate Limit Sell price"
                          >
                            <div className="depth-fill green-fill" style={{ width: `${depthPct}%` }} />
                            <span className="ob-price text-green font-mono">{b.price.toFixed(2)}</span>
                            <span className="ob-size font-mono">{b.size.toLocaleString()}</span>
                            <span className="ob-total font-mono text-muted">{b.total.toLocaleString()}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Interactive CRED OTC Order & Position Desk */}
              <div className="terminal-panel lot-calc-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Briefcase className="icon-sm text-gold" />
                    <span>CRED OTC Order &amp; Position Desk</span>
                  </div>
                  <span className="spread-tag">1 Lot = 50 sh</span>
                </div>

                <div className="lot-calc-body">
                  {/* Buy / Sell + Market / Limit Switchers */}
                  <div className="order-desk-controls">
                    <div className="side-switch" role="group" aria-label="Order side">
                      <button
                        type="button"
                        onClick={() => setOrderSide("BUY")}
                        className={`side-btn ${orderSide === "BUY" ? "active-buy" : ""}`}
                      >
                        Buy OTC
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderSide("SELL")}
                        className={`side-btn ${orderSide === "SELL" ? "active-sell" : ""}`}
                      >
                        Sell OTC
                      </button>
                    </div>

                    <div className="type-switch" role="group" aria-label="Order execution type">
                      <button
                        type="button"
                        onClick={() => setOrderType("MARKET")}
                        className={`otype-btn ${orderType === "MARKET" ? "active" : ""}`}
                      >
                        Market
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderType("LIMIT");
                          setLimitPrice(Number(credLivePrice.toFixed(2)));
                        }}
                        className={`otype-btn ${orderType === "LIMIT" ? "active" : ""}`}
                      >
                        Limit
                      </button>
                    </div>
                  </div>

                  {/* Lots Stepper */}
                  <div className="lot-input-row">
                    <label htmlFor="cred-lot-input" className="lot-label">
                      Lots ({selectedSharesCount.toLocaleString("en-IN")} shares)
                    </label>
                    <div className="lot-stepper">
                      <button
                        type="button"
                        className="lot-step-btn"
                        onClick={() => setLotCount((c) => Math.max(1, c - 1))}
                        aria-label="Decrease lots"
                      >
                        −
                      </button>
                      <input
                        id="cred-lot-input"
                        type="number"
                        min={1}
                        max={2000}
                        value={lotCount}
                        onChange={(e) => setLotCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="lot-number-input tabular-nums"
                      />
                      <button
                        type="button"
                        className="lot-step-btn"
                        onClick={() => setLotCount((c) => Math.min(2000, c + 1))}
                        aria-label="Increase lots"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {orderType === "LIMIT" && (
                    <div className="lot-input-row">
                      <label htmlFor="cred-limit-input" className="lot-label">Limit Price (₹)</label>
                      <input
                        id="cred-limit-input"
                        type="number"
                        step="0.50"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                        className="limit-price-input tabular-nums"
                      />
                    </div>
                  )}

                  <div className="lot-summary-grid tabular-nums">
                    <div>
                      <span className="lot-sum-label">Ticket Value (INR)</span>
                      <strong className="lot-sum-val text-green">
                        ₹{Math.round(otcOrderInr).toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div>
                      <span className="lot-sum-label">USD Equivalent</span>
                      <strong className="lot-sum-val">${Math.round(otcOrderUsd).toLocaleString("en-US")}</strong>
                    </div>
                    <div>
                      <span className="lot-sum-label">Company Equity %</span>
                      <strong className="lot-sum-val text-cyan">{equityStakePct.toFixed(6)}%</strong>
                    </div>
                    <div>
                      <span className="lot-sum-label">Vs. Series F (₹342)</span>
                      <strong className="lot-sum-val text-gold">
                        {(((effectiveFillPrice - 342) / 342) * 100).toFixed(1)}%
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteSimulatedOrder}
                    className={`execute-order-btn ${orderSide === "BUY" ? "btn-buy" : "btn-sell"}`}
                  >
                    {orderSide === "BUY" ? "Simulate Buy" : "Simulate Sell"} {selectedSharesCount} CRED @ ₹{effectiveFillPrice.toFixed(2)}
                  </button>

                  {orderNotice && <div className="order-notice-line">{orderNotice}</div>}

                  {/* Live Simulated Position Tracker */}
                  <div className="sim-position-box tabular-nums">
                    <div className="sim-pos-head">
                      <span>Paper Position: <strong>{position.shares.toLocaleString("en-IN")} sh</strong></span>
                      <button
                        type="button"
                        className="pos-reset-btn"
                        onClick={() => {
                          setPosition({ shares: 500, avgCost: 271.20 });
                          setOrderNotice("Reset paper position to 500 shares.");
                        }}
                        title="Reset simulated position"
                      >
                        <RotateCcw size={12} /> Reset
                      </button>
                    </div>
                    <div className="sim-pos-metrics">
                      <div>
                        <span className="lot-sum-label">Avg Cost</span>
                        <span>₹{position.avgCost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="lot-sum-label">Live Value</span>
                        <span>₹{Math.round(positionMarketVal).toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="lot-sum-label">Unrealized P&amp;L</span>
                        <span className={positionPnlInr >= 0 ? "text-green" : "text-red"}>
                          {positionPnlInr >= 0 ? "+" : ""}₹{Math.round(positionPnlInr).toLocaleString("en-IN")} ({positionPnlPct >= 0 ? "+" : ""}{positionPnlPct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time & Sales */}
              <div className="terminal-panel tape-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Activity className="icon-sm text-cyan" />
                    <span>Time &amp; Sales Tape</span>
                  </div>
                  <div className="tape-live-tag">
                    <span className="pulse-dot" /> Live
                  </div>
                </div>

                <div className="tape-list-container">
                  <div className="tape-header">
                    <span>Time</span>
                    <span>Price</span>
                    <span>Qty</span>
                    <span>Desk</span>
                  </div>
                  <div className="tape-rows tabular-nums">
                    {tape &&
                      tape.slice(0, 7).map((t, idx) => {
                        const isBuy = t.side === "BUY";
                        return (
                          <div key={t.id || idx} className={`tape-row ${idx === 0 ? "new-trade-flash" : ""}`}>
                            <span className="tape-time font-mono text-muted">{t.time}</span>
                            <span className={`tape-price font-mono ${isBuy ? "text-green" : "text-red"}`}>
                              ₹{t.price.toFixed(2)}
                            </span>
                            <span className="tape-size font-mono">{t.size.toLocaleString()}</span>
                            <span className="tape-inst truncate" title={t.institution}>
                              {t.institution?.split(" ")[0] || "OTC"}
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

        {/* Financial Wire & Macro News */}
        <Reveal delay={120}>
          <div className="financial-news-terminal">
            <div className="news-header-bar">
              <div className="news-title">
                <Zap className="icon-sm text-gold" />
                <span>Financial Wire &amp; Deal Intelligence</span>
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
                      <span className="news-category-text">{n.category}</span>
                      <span className={`news-sentiment-badge ${isBullish ? "sentiment-bull" : "sentiment-neutral"}`}>
                        {isBullish ? "Bullish" : "Neutral"} ({(n.sentiment * 100).toFixed(0)}%)
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
