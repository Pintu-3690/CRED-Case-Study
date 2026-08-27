import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import * as data from "./data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Single endpoint returning the full structured case-study payload.
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

// Serve the built React client in production.
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`CRED case-study API running on http://localhost:${PORT}`);
});
