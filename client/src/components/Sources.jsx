import Reveal from "./Reveal";

export default function Sources({ sources, updated }) {
  if (!sources) return null;
  return (
    <section id="sources" className="sources-section">
      <div className="container">
        <Reveal as="div" className="card sources-card">
          <div className="editorial-kicker">
            <span>19</span>
            <span aria-hidden="true">·</span>
            <span>Methodology &amp; Primary Sources</span>
          </div>
          <h2>Sources &amp; Analytical Disclosures</h2>
          <p className="sources-intro">{sources.intro}</p>

          <div className="sources-grid">
            <div className="sources-col verified">
              <h4>Verified Facts &amp; Filings</h4>
              <ul>
                {sources.verifiedFacts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="sources-col estimate">
              <h4>Estimates &amp; Modeling</h4>
              <ul>
                {sources.estimatesAndAnalysis.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sources-disclaimer">{sources.disclaimer}</div>
          <p className="sources-updated font-mono">Research updated: {updated}</p>
        </Reveal>
      </div>
    </section>
  );
}
