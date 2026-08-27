import * as data from '../data.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  res.status(200).json({
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
}
