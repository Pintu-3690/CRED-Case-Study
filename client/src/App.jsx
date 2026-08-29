import { useState, useCallback } from "react";
import useCaseStudy from "./hooks/useCaseStudy";
import useRealtimeTrading from "./hooks/useRealtimeTrading";
import LiveTelemetryBar from "./components/LiveTelemetryBar";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LiveTradingTerminal from "./components/LiveTradingTerminal";
import ValuationWorkbench from "./components/ValuationWorkbench";
import PeerComparisonMatrix from "./components/PeerComparisonMatrix";
import ExecutiveSummary from "./components/ExecutiveSummary";
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

export default function App() {
  const { data } = useCaseStudy();
  const tradingState = useRealtimeTrading("CRED:UNLST");
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Subtle web-audio synthesizer click for optional audio feedback
  const playClickSound = useCallback(() => {
    if (!isAudioEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      // Audio not supported or blocked
    }
  }, [isAudioEnabled]);

  const toggleAudio = () => {
    setIsAudioEnabled((prev) => !prev);
  };

  const d = data;

  return (
    <div className="app-root" onClick={playClickSound}>
      <LiveTelemetryBar 
        initialData={d.liveTelemetryInitial} 
        realTimeTelemetry={tradingState.telemetry}
        liveQuote={tradingState.quote}
      />
      <Navbar isAudioEnabled={isAudioEnabled} toggleAudio={toggleAudio} />
      <main id="main-content">
        <Hero meta={d.meta} founder={d.founder} />
        <ExecutiveSummary />
        
        {/* Flagship Real-Time Financial Trading Terminal */}
        <LiveTradingTerminal 
          tradingState={tradingState}
          onSelectSymbol={tradingState.changeSymbol}
        />

        {/* Institutional DCF Modeler, Waterfall & Cap Table Studio */}
        <ValuationWorkbench capTable={d.unlistedShareMarket?.capTable || []} />

        {/* Multi-Asset Peer Multiples & Comp Matrix */}
        <PeerComparisonMatrix 
          peers={tradingState.peers}
          selectedSymbol={tradingState.selectedSymbol}
          onSelectSymbol={tradingState.changeSymbol}
        />

        <KpiDashboard kpis={d.kpis} />
        <FounderAndGating founder={d.founder} gating={d.gatingMechanics} />
        <HowCredWorks steps={d.howCredWorks} />
        <MonetizationEcosystem products={d.productEcosystem} />
        <FinancialPerformance financials={d.financials} arpu={d.arpuBenchmark} unitEconomics={d.unitEconomics} />
        <ValuationTimeline timeline={d.valuationTimeline} totalRaised={d.totalCapitalRaised} />
        <BusinessModel model={d.businessModel} />
        <StrategyFrameworks swot={d.swot} pestle={d.pestle} />
        <Competition competitors={d.competitors} outlook={d.strategicOutlook} />
        <CredIntelligenceExplorer faqList={d.intelFAQ} />
        <KeyLessons lessons={d.keyLessons} />
        <Sources sources={d.sources} updated={d.meta?.updated} />
      </main>
      <Footer updated={d.meta?.updated} />
    </div>
  );
}

