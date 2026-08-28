import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import * as data from "./data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API Endpoints
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

app.get("/api/health", (req, res) => res.json({ ok: true }));

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
