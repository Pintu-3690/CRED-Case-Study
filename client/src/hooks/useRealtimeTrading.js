import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_CRED_QUOTE = {
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
};

export default function useRealtimeTrading(defaultSymbol = "CRED:UNLST") {
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [quote, setQuote] = useState(DEFAULT_CRED_QUOTE);
  const [credQuote, setCredQuote] = useState(DEFAULT_CRED_QUOTE);
  const [usdInrRate, setUsdInrRate] = useState(87.42);

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
    matchingEngine: "OTC Secondary Order Router",
    settlementCycle: "T+1 OTC Escrow",
    dailyTpvCr: 2489.42,
    upiVelocityTps: 214,
    currentImpliedValuationB: 4.30,
    currentImpliedValuationInrCr: 37565
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastTickSide, setLastTickSide] = useState("neutral");
  const [tickFlash, setTickFlash] = useState(false);
  const [candles, setCandles] = useState([]);
  const [resolution, setResolution] = useState("1D");
  const [isLoadingCandles, setIsLoadingCandles] = useState(false);

  const prevPriceRef = useRef(DEFAULT_CRED_QUOTE.price);
  const selectedSymbolRef = useRef(selectedSymbol);
  const resolutionRef = useRef(resolution);
  const flashTimeoutRef = useRef(null);

  useEffect(() => {
    selectedSymbolRef.current = selectedSymbol;
  }, [selectedSymbol]);

  useEffect(() => {
    resolutionRef.current = resolution;
  }, [resolution]);

  const fetchCandles = useCallback(async (sym, res) => {
    try {
      setIsLoadingCandles(true);
      const resp = await fetch(
        `/api/market/candles?symbol=${encodeURIComponent(sym)}&resolution=${encodeURIComponent(res)}`
      );
      if (!resp.ok) throw new Error("Failed to load candles");
      const json = await resp.json();
      if (selectedSymbolRef.current === sym && resolutionRef.current === res) {
        setCandles(json.candles || []);
      }
    } catch (e) {
      console.warn("Candles fetch error:", e);
    } finally {
      setIsLoadingCandles(false);
    }
  }, []);

  const fetchSymbolSnapshot = useCallback(async (sym) => {
    try {
      const [quoteRes, obRes, tapeRes] = await Promise.all([
        fetch(`/api/market/quote?symbol=${encodeURIComponent(sym)}`),
        fetch(`/api/market/orderbook?symbol=${encodeURIComponent(sym)}`),
        fetch(`/api/market/tape?symbol=${encodeURIComponent(sym)}&limit=30`)
      ]);

      if (selectedSymbolRef.current !== sym) return;

      if (quoteRes.ok) {
        const q = await quoteRes.json();
        prevPriceRef.current = q.price;
        setQuote(q);
      }
      if (obRes.ok) {
        const ob = await obRes.json();
        setOrderBook(ob);
      }
      if (tapeRes.ok) {
        const t = await tapeRes.json();
        setTape(Array.isArray(t) ? t : []);
      }
    } catch (e) {
      console.warn("Snapshot fetch error:", e);
    }
  }, []);

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

  useEffect(() => {
    fetchBaselines();
    fetchCandles(selectedSymbolRef.current, resolutionRef.current);
    fetchSymbolSnapshot(selectedSymbolRef.current);

    let sse;
    let retryTimeout;
    let isUnmounted = false;

    const connectSSE = () => {
      if (isUnmounted) return;
      try {
        sse = new EventSource("/api/market/stream");

        sse.onopen = () => {
          if (!isUnmounted) setIsConnected(true);
        };

        sse.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const data = JSON.parse(event.data);
            const activeSym = selectedSymbolRef.current;

            if (data.type === "INIT") {
              if (data.quotes && data.quotes["CRED:UNLST"]) {
                setCredQuote(data.quotes["CRED:UNLST"]);
              } else if (data.quote) {
                setCredQuote(data.quote);
              }
              if (data.quotes && data.quotes["USDINR:FOREX"]) {
                setUsdInrRate(data.quotes["USDINR:FOREX"].price);
              }
              if (data.quotes && data.quotes[activeSym]) {
                setQuote(data.quotes[activeSym]);
                prevPriceRef.current = data.quotes[activeSym].price;
              } else if (data.quote) {
                setQuote(data.quote);
                prevPriceRef.current = data.quote.price;
              }
              if (data.orderBooks && data.orderBooks[activeSym]) {
                setOrderBook(data.orderBooks[activeSym]);
              } else if (data.orderBook) {
                setOrderBook(data.orderBook);
              }
              if (data.tape && activeSym === "CRED:UNLST") {
                setTape(data.tape);
              }
              if (data.peers) setPeers(data.peers);
              if (data.news) setNews(data.news);
              if (data.telemetry) setTelemetry(data.telemetry);
            } else if (data.type === "TICK") {
              if (data.quotes && data.quotes["CRED:UNLST"]) {
                setCredQuote(data.quotes["CRED:UNLST"]);
              }
              if (data.quotes && data.quotes["USDINR:FOREX"]) {
                setUsdInrRate(data.quotes["USDINR:FOREX"].price);
              }

              const activeQuote = data.quotes ? data.quotes[activeSym] : data.symbol === activeSym ? data : null;
              if (activeQuote) {
                const currentPrice = activeQuote.price;
                const prevPrice = prevPriceRef.current;

                if (currentPrice > prevPrice) {
                  setLastTickSide("up");
                } else if (currentPrice < prevPrice) {
                  setLastTickSide("down");
                }
                prevPriceRef.current = currentPrice;

                setTickFlash(true);
                if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
                flashTimeoutRef.current = setTimeout(() => setTickFlash(false), 280);

                setQuote(activeQuote);

                // Keep the rightmost live candle tracking the active quote smoothly
                setCandles((prevCandles) => {
                  if (!prevCandles || prevCandles.length === 0) return prevCandles;
                  const updated = [...prevCandles];
                  const last = { ...updated[updated.length - 1] };
                  last.close = currentPrice;
                  last.high = Math.max(last.high, currentPrice);
                  last.low = Math.min(last.low, currentPrice);
                  updated[updated.length - 1] = last;
                  return updated;
                });
              }

              const activeBook = data.orderBooks?.[activeSym] || (activeSym === "CRED:UNLST" ? data.orderBook : null);
              if (activeBook) setOrderBook(activeBook);

              const activeTrade = data.lastTrades?.[activeSym] || (activeSym === "CRED:UNLST" ? data.lastTrade : null);
              if (activeTrade) {
                setTape((prevTape) => {
                  const filtered = prevTape.filter((t) => t.id !== activeTrade.id);
                  return [activeTrade, ...filtered.slice(0, 49)];
                });
              }

              if (data.peers) setPeers(data.peers);
              if (data.telemetry) setTelemetry(data.telemetry);
            } else if (data.type === "NEWS" && data.news) {
              setNews((prevNews) => {
                const filtered = prevNews.filter((n) => n.id !== data.news.id);
                return [data.news, ...filtered.slice(0, 24)];
              });
            }
          } catch (err) {
            console.error("SSE parse error", err);
          }
        };

        sse.onerror = () => {
          if (isUnmounted) return;
          setIsConnected(false);
          sse.close();
          retryTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        if (!isUnmounted) {
          setIsConnected(false);
          retryTimeout = setTimeout(connectSSE, 4000);
        }
      }
    };

    connectSSE();

    return () => {
      isUnmounted = true;
      if (sse) sse.close();
      if (retryTimeout) clearTimeout(retryTimeout);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, [fetchBaselines, fetchCandles, fetchSymbolSnapshot]);

  const changeSymbol = useCallback((sym) => {
    setSelectedSymbol(sym);
    selectedSymbolRef.current = sym;
    setLastTickSide("neutral");
    fetchSymbolSnapshot(sym);
    fetchCandles(sym, resolutionRef.current);
  }, [fetchCandles, fetchSymbolSnapshot]);

  const changeResolution = useCallback((res) => {
    setResolution(res);
    resolutionRef.current = res;
    fetchCandles(selectedSymbolRef.current, res);
  }, [fetchCandles]);

  return {
    selectedSymbol,
    changeSymbol,
    quote,
    credQuote,
    usdInrRate,
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
