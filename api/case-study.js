import * as data from '../data.js';

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  return response.status(200).json({
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
    sources: data.sources
  });
}