import { useState } from "react";
import Reveal from "./Reveal";

export default function HowCredWorks({ steps = [] }) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="how-cred-works-section" id="how-it-works">
      <div className="container">
        <Reveal className="section-head">
          <div className="editorial-kicker">
            <span>09</span>
            <span aria-hidden="true">·</span>
            <span>The 5-Stage Member Lifecycle</span>
          </div>
          <h2>How the CRED Loop Engages &amp; Monetizes</h2>
          <p>
            From the initial CIBIL 750 gate check to multi-product lending and wealth cross-sell.
          </p>
        </Reveal>

        <div className="flow-grid-interactive">
          {steps.map((s, i) => (
            <Reveal
              as="div"
              key={s.step}
              delay={i * 50}
              className={`card flow-step-card ${activeStep === i ? "active-step" : ""}`}
              onClick={() => setActiveStep(i)}
            >
              <div className="step-top-badge">
                <span className="step-num-pill tabular-nums">0{i + 1}</span>
                {s.badge && <span className="step-sub-badge">{s.badge}</span>}
              </div>

              <h4>{s.step}</h4>
              <p className="step-detail-text">{s.detail}</p>

              {s.metric && (
                <div className="step-metric-footer">
                  <span className="step-metric-tag">{s.metric}</span>
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
