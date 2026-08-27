import { useState } from "react";
import { ChevronRight, ShieldCheck, CreditCard, CheckCircle2, Award, Zap, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

export default function HowCredWorks({ steps = [] }) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="how-cred-works-section" id="how-it-works">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow-pill">
            <Zap size={14} className="accent-gold" />
            <span>THE 5-STAGE MEMBER LIFECYCLE</span>
          </div>
          <h2>How the CRED Loop Engages &amp; Monetizes</h2>
          <p>
            From the initial CIBIL 750 gate check to multi-product lending and wealth cross-sell.
          </p>
        </Reveal>

        {/* Steps Flow Grid */}
        <div className="flow-grid-interactive">
          {steps.map((s, i) => (
            <Reveal
              as="div"
              key={s.step}
              delay={i * 60}
              className={`card flow-step-card ${activeStep === i ? "active-step" : ""}`}
              onClick={() => setActiveStep(i)}
            >
              <div className="step-top-badge">
                <span className="step-num-pill">0{i + 1}</span>
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
