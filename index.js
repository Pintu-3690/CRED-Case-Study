import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import * as data from "./data.js";
import { marketEngine } from "./api/marketEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API Endpoints: Core Case Study Dataset
app.get("/api/case-study", (req, res) => {
  res.json({
    meta: data.meta,
    liveTelemetryInitial: data.liveTelemetryInitial,
    kpis: data.kpis,
    founder: data.founder,
    unlistedShareMarket: data.unlistedShareMarket,
    howCredWorks: data.howCredWorks,
    gatingMechanics: data.gatingMechanics,
    businessModel: data.businessModel,
    productEcosystem: data.productEcosystem,
    valuationTimeline: data.valuationTimeline,
    totalCapitalRaised: data.totalCapitalRaised,
    financials: data.financials,
    arpuBenchmark: data.arpuBenchmark,
    unitEconomics: data.unitEconomics,
    swot: data.swot,
    pestle: data.pestle,
    competitors: data.competitors,
    strategicOutlook: data.strategicOutlook,
    keyLessons: data.keyLessons,
    intelFAQ: data.intelFAQ,
    sources: data.sources,
  });
});

// Real-Time High-Frequency Market Trading Desk APIs
// 1. Server-Sent Events (SSE) Live Feed (Ticks, Order Book Depth, Tape, Telemetry)
app.get("/api/market/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  marketEngine.addSSEClient(res);

  req.on("close", () => {
    marketEngine.removeSSEClient(res);
  });
});

// 2. Real-Time Consolidated Quote
app.get("/api/market/quote", (req, res) => {
  const symbol = req.query.symbol || "CRED:UNLST";
  res.json(marketEngine.getQuote(symbol));
});

// 3. Real-Time & Historical OHLCV Candlestick Data
app.get("/api/market/candles", (req, res) => {
  const symbol = req.query.symbol || "CRED:UNLST";
  const resolution = req.query.resolution || "1D";
  res.json({
    symbol,
    resolution,
    candles: marketEngine.getCandles(symbol, resolution),
    timestamp: Date.now()
  });
});

// 4. Real-Time Level 2 Order Book Depth
app.get("/api/market/orderbook", (req, res) => {
  const symbol = req.query.symbol || "CRED:UNLST";
  res.json(marketEngine.getOrderBook(symbol));
});

// 5. Real-Time Time & Sales Tape (Executed Orders)
app.get("/api/market/tape", (req, res) => {
  const symbol = req.query.symbol || "CRED:UNLST";
  const limit = parseInt(req.query.limit) || 40;
  res.json(marketEngine.getTape(symbol, limit));
});

// 6. Real-Time Peer Multiples & Benchmark Tickers
app.get("/api/market/peers", (req, res) => {
  res.json({
    peers: marketEngine.getPeersSnapshot(),
    telemetry: marketEngine.getTelemetrySnapshot(),
    timestamp: Date.now()
  });
});

// 7. Live Financial Wire & Macro News
app.get("/api/market/news", (req, res) => {
  const limit = parseInt(req.query.limit) || 15;
  res.json({
    news: marketEngine.getNews(limit),
    timestamp: Date.now()
  });
});

// 8. Institutional DCF & Scenario Valuation Engine
app.post("/api/market/dcf-model", (req, res) => {
  const params = req.body || {};
  const result = marketEngine.calculateDCFModel(params);
  res.json(result);
});

app.get("/api/health", (req, res) => res.json({ ok: true, status: "active", marketEngine: "running" }));

// Setup Vite dev middleware or static serving
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    configFile: path.resolve(__dirname, "vite.config.js"),
    server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CRED case-study server running on http://0.0.0.0:${PORT}`);
});

export default app;
