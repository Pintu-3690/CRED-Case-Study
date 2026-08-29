// High-Performance In-Memory Real-Time Trading & Market Data Engine
// Simulates institutional OTC secondary trading desk for unlisted tech shares (CRED / Dreamplug Technologies)
// and multi-asset fintech market feeds with tick generation, Level 2 Order Book, Time & Sales tape,
// Candlestick OHLCV aggregation, DCF valuation modeling, and financial news streaming.

class MarketEngine {
  constructor() {
    this.symbols = {
      "CRED:UNLST": {
        symbol: "CRED:UNLST",
        name: "CRED (Dreamplug Technologies)",
        assetClass: "Unlisted Secondary Equity / OTC Series H",
        basePrice: 284.50,
        price: 284.50,
        open24h: 280.65,
        high24h: 288.90,
        low24h: 279.80,
        prevClose: 280.65,
        volume24h: 428950,
        vwap: 284.12,
        volatility: 0.018,
        currency: "INR",
        tickSize: 0.05,
        lotSize: 50,
        impliedMarketCapUsd: 4.50, // Billion
        sharesOutstandingM: 1320.4,
      },
      "PAYTM:NSE": {
        symbol: "PAYTM:NSE",
        name: "One97 Communications Ltd.",
        assetClass: "NSE Listed Equities",
        basePrice: 684.20,
        price: 684.20,
        open24h: 672.00,
        high24h: 691.50,
        low24h: 668.10,
        prevClose: 672.00,
        volume24h: 3140500,
        vwap: 681.40,
        volatility: 0.024,
        currency: "INR",
        tickSize: 0.05,
      },
      "POLICYBZR:NSE": {
        symbol: "POLICYBZR:NSE",
        name: "PB Fintech Ltd.",
        assetClass: "NSE Listed Equities",
        basePrice: 1742.80,
        price: 1742.80,
        open24h: 1718.00,
        high24h: 1765.00,
        low24h: 1710.20,
        prevClose: 1718.00,
        volume24h: 980400,
        vwap: 1738.90,
        volatility: 0.021,
        currency: "INR",
        tickSize: 0.05,
      },
      "ZOMATO:NSE": {
        symbol: "ZOMATO:NSE",
        name: "Zomato Ltd. (Blinkit + District)",
        assetClass: "NSE Listed Equities",
        basePrice: 262.40,
        price: 262.40,
        open24h: 258.10,
        high24h: 265.80,
        low24h: 257.00,
        prevClose: 258.10,
        volume24h: 14820000,
        vwap: 261.90,
        volatility: 0.028,
        currency: "INR",
        tickSize: 0.05,
      },
      "NIFTY_FIN:INDEX": {
        symbol: "NIFTY_FIN:INDEX",
        name: "Nifty Financial Services Index",
        assetClass: "Index",
        basePrice: 24890.50,
        price: 24890.50,
        open24h: 24750.00,
        high24h: 24960.00,
        low24h: 24710.00,
        prevClose: 24750.00,
        volume24h: 89400000,
        vwap: 24840.00,
        volatility: 0.009,
        currency: "INR",
        tickSize: 0.5,
      },
      "USDINR:FOREX": {
        symbol: "USDINR:FOREX",
        name: "USD / INR Spot Reference",
        assetClass: "Currency",
        basePrice: 87.42,
        price: 87.42,
        open24h: 87.38,
        high24h: 87.48,
        low24h: 87.35,
        prevClose: 87.38,
        volume24h: 0,
        vwap: 87.41,
        volatility: 0.002,
        currency: "INR",
        tickSize: 0.0025,
      }
    };

    // In-memory trade tape buffer (recent 100 trades)
    this.tape = [];
    this.orderBooks = {};
    this.candles = {}; // resolution -> symbol -> array of OHLCV
    this.newsFeed = [];
    this.sseClients = new Set();
    this.tickCounter = 0;

    this.institutions = [
      "Tiger Global Secondary",
      "Peak XV Partners (OTC)",
      "Falcon Edge / Alpha Wave",
      "Coatue Tactical",
      "Sofina Capital",
      "Meta Strategic Equity Desk",
      "CRED Founder ESOP Trust",
      "GIC Sovereign Desk",
      "Dragoneer Investment Group",
      "Marshall Wace FinTech"
    ];

    this.newsTemplates = [
      {
        headline: "CRED reports FY25 TPV of ₹8.5 Lakh Cr, capturing 32% of all India credit card spend",
        source: "Bloomberg Quint Terminal",
        sentiment: 0.88,
        impact: "High / Positive",
        category: "Earnings & Volume"
      },
      {
        headline: "Kuvera integration powers ₹50,000 Cr+ in direct mutual fund AUM for CRED Money platform",
        source: "Reuters Financial Desk",
        sentiment: 0.74,
        impact: "Medium / Expansion",
        category: "M&A / Synergy"
      },
      {
        headline: "Meta closes $900M strategic 20% equity stake in Dreamplug Technologies at $4.5B baseline",
        source: "Financial Times Live",
        sentiment: 0.92,
        impact: "High / Valuation Re-rating",
        category: "Corporate Action"
      },
      {
        headline: "RBI updates BBPS payment aggregator framework; CRED registers record 99.998% routing uptime",
        source: "Mint Market Wire",
        sentiment: 0.58,
        impact: "Neutral / Compliance",
        category: "Regulatory"
      },
      {
        headline: "CRED Garage vehicle manager hits 6.2M registered vehicles, driving insurance & FASTag monetization",
        source: "The Economic Times",
        sentiment: 0.81,
        impact: "Medium / Monetization",
        category: "Product Growth"
      },
      {
        headline: "CRED Cash & Flash loan book reaches ₹22,000 Cr AUM with industry-low 0.8% 90+ DPD NPA",
        source: "Crisil / ICRA Credit Insights",
        sentiment: 0.85,
        impact: "High / Asset Quality",
        category: "Credit & Risk"
      },
      {
        headline: "Secondary OTC blocks in CRED shares surge as ESOP liquidity window clears at ₹284.50/sh",
        source: "UnlistedZone Desk",
        sentiment: 0.68,
        impact: "Medium / Liquidity",
        category: "OTC Markets"
      }
    ];

    this.initHistoricalCandles();
    this.initOrderBooks();
    this.initInitialTape();
    this.initInitialNews();
    this.startEngineLoops();
  }

  initHistoricalCandles() {
    const resolutions = ["1s", "5s", "1m", "15m", "1D", "1W", "1Y", "ALL"];
    resolutions.forEach((res) => {
      this.candles[res] = {};
      Object.keys(this.symbols).forEach((sym) => {
        this.candles[res][sym] = this.generateHistoricalCandles(sym, res);
      });
    });
  }

  generateHistoricalCandles(symbol, resolution) {
    const s = this.symbols[symbol];
    const base = s ? s.basePrice : 284.50;
    const count = resolution === "1s" ? 60 : resolution === "5s" ? 60 : resolution === "1m" ? 60 : resolution === "15m" ? 48 : resolution === "1D" ? 30 : resolution === "1W" ? 52 : resolution === "1Y" ? 12 : 24;
    const now = Date.now();
    const intervalMs = resolution === "1s" ? 1000 : resolution === "5s" ? 5000 : resolution === "1m" ? 60000 : resolution === "15m" ? 900000 : resolution === "1D" ? 86400000 : resolution === "1W" ? 604800000 : 2592000000;

    let candles = [];
    let current = base * (resolution === "1Y" || resolution === "ALL" ? 0.72 : 0.98);

    for (let i = count; i >= 0; i--) {
      const time = now - i * intervalMs;
      const drift = (Math.random() - 0.46) * (base * s.volatility * (resolution === "1D" ? 1.2 : 0.4));
      const open = Number(current.toFixed(2));
      const close = Number(Math.max(base * 0.4, current + drift).toFixed(2));
      const high = Number((Math.max(open, close) + Math.random() * (base * 0.008)).toFixed(2));
      const low = Number((Math.min(open, close) - Math.random() * (base * 0.008)).toFixed(2));
      const volume = Math.floor(Math.random() * 8000 + 1200);

      candles.push({
        time,
        open,
        high,
        low,
        close,
        volume,
        vwap: Number(((high + low + close) / 3).toFixed(2))
      });
      current = close;
    }

    // Ensure the last candle closes at current price
    if (candles.length > 0) {
      candles[candles.length - 1].close = s.price;
      candles[candles.length - 1].high = Math.max(candles[candles.length - 1].high, s.price);
      candles[candles.length - 1].low = Math.min(candles[candles.length - 1].low, s.price);
    }

    return candles;
  }

  initOrderBooks() {
    Object.keys(this.symbols).forEach((sym) => {
      this.orderBooks[sym] = this.generateOrderBook(sym);
    });
  }

  generateOrderBook(symbol) {
    const s = this.symbols[symbol];
    const mid = s ? s.price : 284.50;
    const spread = Number((mid * 0.0008).toFixed(2)); // ~8 bps spread

    const bids = [];
    const asks = [];

    let cumBidVol = 0;
    for (let i = 1; i <= 10; i++) {
      const p = Number((mid - (i * 0.15) - (spread / 2)).toFixed(2));
      const size = Math.floor(Math.random() * 2500 + 400);
      cumBidVol += size;
      bids.push({
        price: p,
        size,
        total: cumBidVol,
        orders: Math.floor(Math.random() * 8 + 1)
      });
    }

    let cumAskVol = 0;
    for (let i = 1; i <= 10; i++) {
      const p = Number((mid + (i * 0.15) + (spread / 2)).toFixed(2));
      const size = Math.floor(Math.random() * 2500 + 400);
      cumAskVol += size;
      asks.push({
        price: p,
        size,
        total: cumAskVol,
        orders: Math.floor(Math.random() * 8 + 1)
      });
    }

    const totalBidVol = bids[bids.length - 1].total;
    const totalAskVol = asks[asks.length - 1].total;
    const imbalance = Number(((totalBidVol - totalAskVol) / (totalBidVol + totalAskVol)).toFixed(4));

    return {
      symbol,
      timestamp: Date.now(),
      midPrice: mid,
      spread: Number((asks[0].price - bids[0].price).toFixed(2)),
      spreadBps: Number((((asks[0].price - bids[0].price) / mid) * 10000).toFixed(1)),
      bids,
      asks,
      totalBidVol,
      totalAskVol,
      imbalance // positive = buy pressure, negative = sell pressure
    };
  }

  initInitialTape() {
    const sym = "CRED:UNLST";
    const now = Date.now();
    for (let i = 25; i >= 0; i--) {
      const side = Math.random() > 0.44 ? "BUY" : "SELL";
      const size = Math.floor(Math.random() * 40 + 1) * 50;
      const priceOffset = (Math.random() - 0.5) * 0.6;
      const price = Number((this.symbols[sym].price + priceOffset).toFixed(2));
      this.tape.push({
        id: `TX-${now - i * 4000}-${Math.floor(Math.random() * 900 + 100)}`,
        symbol: sym,
        price,
        size,
        side,
        time: new Date(now - i * 4000).toLocaleTimeString("en-US", { hour12: false }),
        timestamp: now - i * 4000,
        institution: this.institutions[Math.floor(Math.random() * this.institutions.length)],
        type: size >= 1000 ? "BLOCK" : size >= 500 ? "INSTITUTIONAL" : "OTC_RETAIL"
      });
    }
  }

  initInitialNews() {
    const now = Date.now();
    this.newsFeed = this.newsTemplates.map((t, idx) => ({
      id: `NEWS-${now - idx * 600000}`,
      ...t,
      timestamp: now - idx * 600000,
      timeAgo: `${idx * 10 + 2}m ago`,
      relatedSymbols: ["CRED:UNLST", "PAYTM:NSE", "NIFTY_FIN:INDEX"]
    }));
  }

  startEngineLoops() {
    // 1. High-Frequency Market Tick Generator (runs every 600ms)
    setInterval(() => {
      this.generateTick();
    }, 600);

    // 2. Breaking News & Macro Events (runs every 35s)
    setInterval(() => {
      this.generateNewsEvent();
    }, 35000);
  }

  generateTick() {
    this.tickCounter++;
    const mainSym = "CRED:UNLST";
    const cred = this.symbols[mainSym];

    // Jump-diffusion + mean-reverting random walk
    const isJump = Math.random() < 0.05; // 5% chance of institutional block jump
    const jumpMagnitude = isJump ? (Math.random() - 0.42) * 1.2 : 0;
    const normalDelta = (Math.random() - 0.48) * (cred.basePrice * cred.volatility * 0.06);
    const delta = normalDelta + jumpMagnitude;

    const newPrice = Number(Math.max(200.0, cred.price + delta).toFixed(2));
    cred.price = newPrice;
    cred.high24h = Math.max(cred.high24h, newPrice);
    cred.low24h = Math.min(cred.low24h, newPrice);
    cred.volume24h += Math.floor(Math.random() * 300 + 50);

    // Recompute VWAP
    cred.vwap = Number(((cred.vwap * 0.98) + (newPrice * 0.02)).toFixed(2));

    // Update other peer symbols mildly correlated
    Object.keys(this.symbols).forEach((sym) => {
      if (sym === mainSym) return;
      const s = this.symbols[sym];
      const sDelta = (Math.random() - 0.49) * (s.basePrice * s.volatility * 0.04);
      s.price = Number((s.price + sDelta).toFixed(2));
      s.high24h = Math.max(s.high24h, s.price);
      s.low24h = Math.min(s.low24h, s.price);
    });

    // Update real-time candle aggregations
    this.updateCandlesWithLatestPrice(mainSym, newPrice);

    // Generate trade execution on tape
    const side = delta >= 0 ? "BUY" : "SELL";
    const tradeSize = isJump ? Math.floor(Math.random() * 20 + 10) * 100 : Math.floor(Math.random() * 15 + 1) * 50;
    const tradeId = `TX-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const trade = {
      id: tradeId,
      symbol: mainSym,
      price: newPrice,
      size: tradeSize,
      side,
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      timestamp: Date.now(),
      institution: this.institutions[Math.floor(Math.random() * this.institutions.length)],
      type: tradeSize >= 1000 ? "BLOCK" : tradeSize >= 500 ? "INSTITUTIONAL" : "OTC_RETAIL"
    };

    this.tape.unshift(trade);
    if (this.tape.length > 100) this.tape.pop();

    // Re-generate Order Book based on new mid
    this.orderBooks[mainSym] = this.generateOrderBook(mainSym);

    // Broadcast to SSE clients if any
    const packet = {
      type: "TICK",
      symbol: mainSym,
      price: newPrice,
      change: Number((newPrice - cred.prevClose).toFixed(2)),
      pctChange: Number((((newPrice - cred.prevClose) / cred.prevClose) * 100).toFixed(2)),
      high24h: cred.high24h,
      low24h: cred.low24h,
      vwap: cred.vwap,
      volume24h: cred.volume24h,
      lastTrade: trade,
      orderBook: this.orderBooks[mainSym],
      peers: this.getPeersSnapshot(),
      telemetry: this.getTelemetrySnapshot(),
      timestamp: Date.now()
    };

    this.broadcastSSE(packet);
  }

  updateCandlesWithLatestPrice(symbol, price) {
    const resolutions = ["1s", "5s", "1m", "15m", "1D"];
    const now = Date.now();

    resolutions.forEach((res) => {
      const arr = this.candles[res] && this.candles[res][symbol];
      if (!arr || arr.length === 0) return;

      const last = arr[arr.length - 1];
      const intervalMs = res === "1s" ? 1000 : res === "5s" ? 5000 : res === "1m" ? 60000 : res === "15m" ? 900000 : 86400000;

      if (now - last.time > intervalMs) {
        // Roll to new candle
        arr.push({
          time: now,
          open: last.close,
          high: Math.max(last.close, price),
          low: Math.min(last.close, price),
          close: price,
          volume: Math.floor(Math.random() * 500 + 100),
          vwap: price
        });
        if (arr.length > 120) arr.shift();
      } else {
        // Update current candle
        last.high = Math.max(last.high, price);
        last.low = Math.min(last.low, price);
        last.close = price;
        last.volume += Math.floor(Math.random() * 10 + 2);
        last.vwap = Number(((last.high + last.low + last.close) / 3).toFixed(2));
      }
    });
  }

  generateNewsEvent() {
    const template = this.newsTemplates[Math.floor(Math.random() * this.newsTemplates.length)];
    const event = {
      id: `NEWS-${Date.now()}`,
      ...template,
      timestamp: Date.now(),
      timeAgo: "Just now",
      relatedSymbols: ["CRED:UNLST", "PAYTM:NSE", "NIFTY_FIN:INDEX"]
    };

    this.newsFeed.unshift(event);
    if (this.newsFeed.length > 30) this.newsFeed.pop();

    this.broadcastSSE({
      type: "NEWS",
      news: event,
      timestamp: Date.now()
    });
  }

  getPeersSnapshot() {
    return Object.values(this.symbols).map((s) => {
      const diff = Number((s.price - s.prevClose).toFixed(2));
      const pct = Number(((diff / s.prevClose) * 100).toFixed(2));
      return {
        symbol: s.symbol,
        name: s.name,
        assetClass: s.assetClass,
        price: s.price,
        currency: s.currency,
        change: diff,
        pctChange: pct,
        high24h: s.high24h,
        low24h: s.low24h,
        volume24h: s.volume24h,
        vwap: s.vwap
      };
    });
  }

  getTelemetrySnapshot() {
    const cred = this.symbols["CRED:UNLST"];
    return {
      activeConnections: this.sseClients.size || 1,
      engineLatencyMs: Number((Math.random() * 0.4 + 0.6).toFixed(2)),
      ticksProcessed: this.tickCounter,
      matchingEngine: "V8 Real-Time L2 Order Router",
      settlementCycle: "T+1 OTC Escrow",
      dailyTpvCr: Number((2489.42 + (this.tickCounter * 0.05)).toFixed(2)),
      upiVelocityTps: Math.floor(Math.random() * 45 + 195),
      currentImpliedValuationB: Number(((cred.price * cred.sharesOutstandingM) / (cred.price > 250 ? 83.5 : 84) / 1000).toFixed(2)),
      lastUpdated: new Date().toISOString()
    };
  }

  // SSE Management
  addSSEClient(res) {
    this.sseClients.add(res);
    // Send immediate snapshot on connect
    const initialPayload = {
      type: "INIT",
      quote: this.getQuote("CRED:UNLST"),
      orderBook: this.orderBooks["CRED:UNLST"] || this.generateOrderBook("CRED:UNLST"),
      tape: this.tape.slice(0, 30),
      peers: this.getPeersSnapshot(),
      news: this.newsFeed.slice(0, 10),
      telemetry: this.getTelemetrySnapshot(),
      timestamp: Date.now()
    };
    res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);
  }

  removeSSEClient(res) {
    this.sseClients.delete(res);
  }

  broadcastSSE(data) {
    if (this.sseClients.size === 0) return;
    const msg = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(msg);
      } catch (e) {
        this.sseClients.delete(client);
      }
    }
  }

  getQuote(symbol = "CRED:UNLST") {
    const s = this.symbols[symbol] || this.symbols["CRED:UNLST"];
    const diff = Number((s.price - s.prevClose).toFixed(2));
    const pct = Number(((diff / s.prevClose) * 100).toFixed(2));
    return {
      symbol: s.symbol,
      name: s.name,
      assetClass: s.assetClass,
      price: s.price,
      currency: s.currency,
      change: diff,
      pctChange: pct,
      high24h: s.high24h,
      low24h: s.low24h,
      open24h: s.open24h,
      prevClose: s.prevClose,
      volume24h: s.volume24h,
      vwap: s.vwap,
      impliedMarketCapUsd: s.impliedMarketCapUsd || 4.50,
      sharesOutstandingM: s.sharesOutstandingM || 1320.4,
      timestamp: Date.now()
    };
  }

  getCandles(symbol = "CRED:UNLST", resolution = "1D") {
    if (this.candles[resolution] && this.candles[resolution][symbol]) {
      return this.candles[resolution][symbol];
    }
    return this.generateHistoricalCandles(symbol, resolution);
  }

  getOrderBook(symbol = "CRED:UNLST") {
    return this.orderBooks[symbol] || this.generateOrderBook(symbol);
  }

  getTape(symbol = "CRED:UNLST", limit = 50) {
    return this.tape.slice(0, limit);
  }

  getNews(limit = 20) {
    return this.newsFeed.slice(0, limit);
  }

  // Institutional Discounted Cash Flow (DCF) Valuation Engine & Sensitivity Analysis
  calculateDCFModel({
    membersM = 15.2,
    arpuInr = 2150,
    takeRatePct = 0.32,
    waccPct = 12.5,
    terminalGrowthPct = 4.5,
    ebitdaMarginTargetPct = 28.0,
    projectionYears = 5,
    usdInr = 87.40
  }) {
    // 1. Projections over next 5 years
    const projections = [];
    let currentMembers = Number(membersM);
    let currentArpu = Number(arpuInr);
    let cumulativeDiscountedFcf = 0;

    for (let yr = 1; yr <= projectionYears; yr++) {
      // Compounding members & ARPU growth
      const memberGrowth = yr === 1 ? 0.18 : yr === 2 ? 0.15 : yr === 3 ? 0.12 : yr === 4 ? 0.10 : 0.08;
      const arpuGrowth = yr === 1 ? 0.14 : yr === 2 ? 0.12 : yr === 3 ? 0.10 : 0.08;

      currentMembers = currentMembers * (1 + memberGrowth);
      currentArpu = currentArpu * (1 + arpuGrowth);

      // Gross Revenue in Cr (Members * ARPU / 10^7)
      const revenueCr = (currentMembers * 1000000 * currentArpu) / 10000000;
      
      // EBITDA Margin ramp from current ~-10% to target margin
      const marginProgress = yr / projectionYears;
      const ebitdaMargin = (-10.8 + (ebitdaMarginTargetPct - (-10.8)) * marginProgress) / 100;
      const ebitdaCr = revenueCr * ebitdaMargin;

      // Free Cash Flow to Firm (FCFF) = EBITDA - Tax (25% once positive) - Reinvestment/Capex (3% of rev)
      const taxCr = ebitdaCr > 0 ? ebitdaCr * 0.25 : 0;
      const capexCr = revenueCr * 0.035;
      const fcffCr = ebitdaCr - taxCr - capexCr;

      // Discount Factor
      const discountFactor = 1 / Math.pow(1 + waccPct / 100, yr);
      const discountedFcfCr = fcffCr * discountFactor;
      cumulativeDiscountedFcf += discountedFcfCr;

      projections.push({
        year: `FY${25 + yr}`,
        membersM: Number(currentMembers.toFixed(1)),
        arpuInr: Math.round(currentArpu),
        revenueCr: Math.round(revenueCr),
        ebitdaMarginPct: Number((ebitdaMargin * 100).toFixed(1)),
        ebitdaCr: Math.round(ebitdaCr),
        fcffCr: Math.round(fcffCr),
        discountFactor: Number(discountFactor.toFixed(4)),
        discountedFcfCr: Math.round(discountedFcfCr)
      });
    }

    // 2. Terminal Value Calculation (Gordon Growth Model)
    const finalYearFcff = projections[projections.length - 1].fcffCr;
    const terminalFcff = Math.max(100, finalYearFcff * (1 + terminalGrowthPct / 100));
    const terminalValueCr = terminalFcff / ((waccPct - terminalGrowthPct) / 100);
    const discountedTerminalValueCr = terminalValueCr / Math.pow(1 + waccPct / 100, projectionYears);

    // 3. Enterprise Value & Implied Equity Value
    const enterpriseValueCr = cumulativeDiscountedFcf + discountedTerminalValueCr;
    const netCashCr = 1850; // Cash on balance sheet post-Meta $900M injection
    const kuveraAumValueCr = 1200; // Value attributed to ₹50k Cr wealth AUM
    const equityValueCr = Math.max(1000, enterpriseValueCr + netCashCr + kuveraAumValueCr);

    const equityValueUsdBillion = Number((equityValueCr / (usdInr * 100)).toFixed(2));
    const sharesOutstandingM = 1320.4;
    const impliedSharePriceInr = Number(((equityValueCr * 10000000) / (sharesOutstandingM * 1000000)).toFixed(2));

    // 4. Sensitivity Matrix: WACC vs Terminal Growth Rate
    const waccSteps = [waccPct - 2, waccPct - 1, waccPct, waccPct + 1, waccPct + 2];
    const growthSteps = [terminalGrowthPct - 1.5, terminalGrowthPct - 0.75, terminalGrowthPct, terminalGrowthPct + 0.75, terminalGrowthPct + 1.5];

    const sensitivityMatrix = growthSteps.map((g) => {
      return {
        growthRate: Number(g.toFixed(2)),
        values: waccSteps.map((w) => {
          if (w <= g) return { wacc: Number(w.toFixed(2)), impliedPrice: 0, valB: 0 };
          const tv = terminalFcff / ((w - g) / 100);
          const dtv = tv / Math.pow(1 + w / 100, projectionYears);
          const ev = cumulativeDiscountedFcf + dtv;
          const eqVal = ev + netCashCr + kuveraAumValueCr;
          const price = ((eqVal * 10000000) / (sharesOutstandingM * 1000000));
          return {
            wacc: Number(w.toFixed(2)),
            impliedPrice: Number(price.toFixed(2)),
            valB: Number((eqVal / (usdInr * 100)).toFixed(2))
          };
        })
      };
    });

    return {
      inputs: { membersM, arpuInr, takeRatePct, waccPct, terminalGrowthPct, ebitdaMarginTargetPct, usdInr },
      projections,
      cumulativeDiscountedFcfCr: Math.round(cumulativeDiscountedFcf),
      terminalValueCr: Math.round(terminalValueCr),
      discountedTerminalValueCr: Math.round(discountedTerminalValueCr),
      enterpriseValueCr: Math.round(enterpriseValueCr),
      equityValueCr: Math.round(equityValueCr),
      equityValueUsdBillion,
      impliedSharePriceInr,
      sensitivityMatrix,
      timestamp: Date.now()
    };
  }
}

export const marketEngine = new MarketEngine();
