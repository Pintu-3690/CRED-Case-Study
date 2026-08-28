import express from "express";
import cors from "cors";
import * as data from "./data.js";

const app = express();

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

// ONLY run app.listen when developing locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`CRED case-study API running on http://localhost:${PORT}`);
  });
}

// Export default app for Vercel Serverless Function engine
export default app;