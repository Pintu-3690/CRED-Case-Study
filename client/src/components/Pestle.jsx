import Reveal from "./Reveal";

export default function Pestle({ pestle = [] }) {
  return (
    <div className="pestle-section-wrapper">
      <Reveal className="section-head">
        <div className="editorial-kicker">
          <span>15</span>
          <span aria-hidden="true">·</span>
          <span>Macro-Environment (PESTLE)</span>
        </div>
        <h2>PESTLE Analysis</h2>
        <p>The external regulatory, macroeconomic, and technological forces shaping CRED&rsquo;s execution.</p>
      </Reveal>

      <div className="pestle-grid">
        {pestle.map((p, i) => (
          <Reveal as="div" key={p.factor} delay={i * 40} className="card pestle-card">
            <span className="pestle-index font-mono">0{i + 1}</span>
            <h4>{p.factor}</h4>
            <p>{p.detail}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
