import useCaseStudy from "./hooks/useCaseStudy";
import useRealtimeTrading from "./hooks/useRealtimeTrading";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LiveTradingTerminal from "./components/LiveTradingTerminal";
import CompanySharesRegistry from "./components/CompanySharesRegistry";
import ValuationWorkbench from "./components/ValuationWorkbench";
import ExecutiveSummary from "./components/ExecutiveSummary";
import PeerComparisonMatrix from "./components/PeerComparisonMatrix";
import KpiDashboard from "./components/KpiDashboard";
import FounderAndGating from "./components/FounderAndGating";
import HowCredWorks from "./components/HowCredWorks";
import MonetizationEcosystem from "./components/MonetizationEcosystem";
import FinancialPerformance from "./components/FinancialPerformance";
import ValuationTimeline from "./components/ValuationTimeline";
import BusinessModel from "./components/BusinessModel";
import StrategyFrameworks from "./components/StrategyFrameworks";
import Competition from "./components/Competition";
import CredIntelligenceExplorer from "./components/CredIntelligenceExplorer";
import KeyLessons from "./components/KeyLessons";
import Sources from "./components/Sources";
import Footer from "./components/Footer";
import CredAssistantWidget from "./components/CredAssistantWidget";

export default function App() {
  const { data } = useCaseStudy();
  const tradingState = useRealtimeTrading("CRED:UNLST");
  const d = data;

  return (
    <div className="app-root">
      <Navbar credQuote={tradingState.credQuote} />
      <main id="main-content">
        <Hero
          meta={d.meta}
          founder={d.founder}
          credQuote={tradingState.credQuote}
          usdInrRate={tradingState.usdInrRate}
        />

        <LiveTradingTerminal
          tradingState={tradingState}
          onSelectSymbol={tradingState.changeSymbol}
        />

        <CompanySharesRegistry
          marketData={d.unlistedShareMarket}
          credQuote={tradingState.credQuote}
          usdInrRate={tradingState.usdInrRate}
        />

        <ValuationWorkbench
          capTable={d.unlistedShareMarket?.capTable || []}
          credQuote={tradingState.credQuote}
          usdInrRate={tradingState.usdInrRate}
        />

        <ExecutiveSummary />

        <PeerComparisonMatrix
          peers={tradingState.peers}
          selectedSymbol={tradingState.selectedSymbol}
          onSelectSymbol={tradingState.changeSymbol}
        />

        <KpiDashboard kpis={d.kpis} />
        <FounderAndGating founder={d.founder} gating={d.gatingMechanics} />
        <HowCredWorks steps={d.howCredWorks} />
        <MonetizationEcosystem products={d.productEcosystem} />
        <FinancialPerformance
          financials={d.financials}
          arpu={d.arpuBenchmark}
          unitEconomics={d.unitEconomics}
        />
        <ValuationTimeline
          timeline={d.valuationTimeline}
          totalRaised={d.totalCapitalRaised}
        />
        <BusinessModel model={d.businessModel} />
        <StrategyFrameworks swot={d.swot} pestle={d.pestle} />
        <Competition competitors={d.competitors} outlook={d.strategicOutlook} />
        <CredIntelligenceExplorer faqList={d.intelFAQ} />
        <KeyLessons lessons={d.keyLessons} />
        <Sources sources={d.sources} updated={d.meta?.updated} />
      </main>
      <Footer updated={d.meta?.updated} />
      <CredAssistantWidget credQuote={tradingState.credQuote} />
    </div>
  );
}

