import Reveal from "./Reveal";

export default function Pestle({ pestle = [] }) {
  return (
    <div>
      <Reveal className="section-head">
        <span className="eyebrow">Macro-Environment</span>
        <h2>PESTLE analysis</h2>
        <p>The external forces shaping CRED's strategic execution.</p>
      </Reveal>

      <div className="pestle-grid">
        {pestle.map((p, i) => (
          <Reveal as="div" key={p.factor} delay={i * 50} className="card pestle-card">
            <h4>{p.factor}</h4>
            <p>{p.detail}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
