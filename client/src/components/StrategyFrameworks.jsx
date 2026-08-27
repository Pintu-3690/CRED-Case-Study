import Swot from "./Swot";
import Pestle from "./Pestle";

export default function StrategyFrameworks({ swot, pestle }) {
  return (
    <section id="strategy">
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: 60 }}>
        <Swot swot={swot} />
        <Pestle pestle={pestle} />
      </div>
    </section>
  );
}
