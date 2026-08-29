import { useState, useEffect, useRef, useCallback } from "react";

export default function useRealtimeTrading(defaultSymbol = "CRED:UNLST") {
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [quote, setQuote] = useState({
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
  });

  const [peers, setPeers] = useState([]);
  const [orderBook, setOrderBook] = useState({
    symbol: "CRED:UNLST",
    spread: 0.60,
    spreadBps: 21.1,
    bids: [],
    asks: [],
    totalBidVol: 45000,
    totalAskVol: 42000,
    imbalance: 0.034
  });
  const [tape, setTape] = useState([]);
  const [news, setNews] = useState([]);
  const [telemetry, setTelemetry] = useState({
    activeConnections: 1,
    engineLatencyMs: 0.8,
    ticksProcessed: 1420,
    matchingEngine: "V8 Real-Time L2 Order Router",
    settlementCycle: "T+1 OTC Escrow",
    dailyTpvCr: 2489.42,
    upiVelocityTps: 214,
    currentImpliedValuationB: 4.50
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastTickSide, setLastTickSide] = useState("neutral"); // "up", "down", "neutral"
  const [tickFlash, setTickFlash] = useState(false);
  const [candles, setCandles] = useState([]);
  const [resolution, setResolution] = useState("1D");
  const [isLoadingCandles, setIsLoadingCandles] = useState(false);

  const prevPriceRef = useRef(quote.price);
  const eventSourceRef = useRef(null);

  // Fetch initial quote and candles
  const fetchCandles = useCallback(async (sym, res) => {
    try {
      setIsLoadingCandles(true);
      const resp = await fetch(`/api/market/candles?symbol=${encodeURIComponent(sym)}&resolution=${encodeURIComponent(res)}`);
      if (!resp.ok) throw new Error("Failed to load candles");
      const json = await resp.json();
      setCandles(json.candles || []);
    } catch (e) {
      console.warn("Candles fetch error:", e);
    } finally {
      setIsLoadingCandles(false);
    }
  }, []);

  // Fetch peers & news baseline
  const fetchBaselines = useCallback(async () => {
    try {
      const [peersRes, newsRes] = await Promise.all([
        fetch("/api/market/peers"),
        fetch("/api/market/news?limit=15")
      ]);
      if (peersRes.ok) {
        const pData = await peersRes.json();
        if (pData.peers) setPeers(pData.peers);
        if (pData.telemetry) setTelemetry(pData.telemetry);
      }
      if (newsRes.ok) {
        const nData = await newsRes.json();
        if (nData.news) setNews(nData.news);
      }
    } catch (e) {
      console.warn("Baseline fetch error:", e);
    }
  }, []);

  // Server-Sent Events (SSE) Live Feed Subscription
  useEffect(() => {
    let sse;
    let retryTimeout;

    const connectSSE = () => {
      try {
        sse = new EventSource("/api/market/stream");
        eventSourceRef.current = sse;

        sse.onopen = () => {
          setIsConnected(true);
        };

        sse.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "INIT") {
              if (data.quote) setQuote(data.quote);
              if (data.orderBook) setOrderBook(data.orderBook);
              if (data.tape) setTape(data.tape);
              if (data.peers) setPeers(data.peers);
              if (data.news) setNews(data.news);
              if (data.telemetry) setTelemetry(data.telemetry);
            } else if (data.type === "TICK") {
              // Update live quote
              if (data.symbol === "CRED:UNLST") {
                const currentPrice = data.price;
                const prevPrice = prevPriceRef.current;

                if (currentPrice > prevPrice) {
                  setLastTickSide("up");
                } else if (currentPrice < prevPrice) {
                  setLastTickSide("down");
                }
                prevPriceRef.current = currentPrice;

                // Trigger brief visual flash
                setTickFlash(true);
                setTimeout(() => setTickFlash(false), 300);

                setQuote((prev) => ({
                  ...prev,
                  price: data.price,
                  change: data.change,
                  pctChange: data.pctChange,
                  high24h: data.high24h,
                  low24h: data.low24h,
                  vwap: data.vwap,
                  volume24h: data.volume24h,
                  timestamp: data.timestamp
                }));

                // Update order book & tape
                if (data.orderBook) setOrderBook(data.orderBook);
                if (data.lastTrade) {
                  setTape((prevTape) => [data.lastTrade, ...prevTape.slice(0, 49)]);
                }
                if (data.peers) setPeers(data.peers);
                if (data.telemetry) setTelemetry(data.telemetry);
              }
            } else if (data.type === "NEWS") {
              if (data.news) {
                setNews((prevNews) => [data.news, ...prevNews.slice(0, 24)]);
              }
            }
          } catch (err) {
            console.error("SSE parse error", err);
          }
        };

        sse.onerror = () => {
          setIsConnected(false);
          sse.close();
          // Auto reconnect after 3 seconds
          retryTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        setIsConnected(false);
        retryTimeout = setTimeout(connectSSE, 4000);
      }
    };

    fetchBaselines();
    fetchCandles(selectedSymbol, resolution);
    connectSSE();

    return () => {
      if (sse) sse.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [fetchBaselines, fetchCandles, selectedSymbol, resolution]);

  // Handle symbol or resolution changes
  const changeSymbol = (sym) => {
    setSelectedSymbol(sym);
    fetchCandles(sym, resolution);
  };

  const changeResolution = (res) => {
    setResolution(res);
    fetchCandles(selectedSymbol, res);
  };

  return {
    selectedSymbol,
    changeSymbol,
    quote,
    peers,
    orderBook,
    tape,
    news,
    telemetry,
    isConnected,
    lastTickSide,
    tickFlash,
    candles,
    resolution,
    changeResolution,
    isLoadingCandles,
    fetchCandles
  };
}
