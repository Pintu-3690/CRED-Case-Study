import Reveal from "./Reveal";

export default function Sources({ sources, updated }) {
  if (!sources) return null;
  return (
    <section id="sources">
      <div className="container">
        <Reveal as="div" className="card sources">
          <span className="eyebrow">Sources &amp; Disclaimer</span>
          <p style={{ marginTop: 14, fontSize: "0.88rem", color: "var(--ink-dim)", maxWidth: "72ch" }}>
            {sources.intro}
          </p>

          <div className="sources__cols">
            <div className="sources__col verified">
              <h4>Verified facts</h4>
              <ul>
                {sources.verifiedFacts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="sources__col estimate">
              <h4>Estimates &amp; analysis</h4>
              <ul>
                {sources.estimatesAndAnalysis.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="disclaimer">{sources.disclaimer}</div>
          <p style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-faint)" }}>
            Research updated on: {updated}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
