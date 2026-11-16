import { Sparkles } from "lucide-react";
import Reveal from "./Reveal";

export default function KeyLessons({ lessons = [] }) {
  return (
    <section className="lessons-section" id="lessons">
      <div className="container">
        <Reveal className="section-head">
          <div className="editorial-kicker">
            <span>18</span>
            <span aria-hidden="true">·</span>
            <span>Core Founder Takeaways</span>
          </div>
          <h2>5 Core Strategic Lessons for Founders &amp; Operators</h2>
          <p>
            Actionable insights distilled from CRED&rsquo;s journey in behavioural economics,
            exclusive gating, and monetization velocity.
          </p>
        </Reveal>

        <div className="lessons-grid">
          {lessons.map((l, i) => (
            <Reveal as="div" key={l.title} delay={i * 50} className="card lesson-card-v2">
              <div className="lesson-badge-top">
                <span className="lesson-num tabular-nums">0{i + 1}</span>
                <Sparkles size={15} className="accent-gold" />
              </div>
              <h4>{l.title}</h4>
              <p>{l.detail}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
