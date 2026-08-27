import { Shield, Target, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";

export default function ExecutiveSummary() {
  return (
    <section className="tight exec-section">
      <div className="container">
        <Reveal as="div" className="card exec-summary-card">
          <div className="exec-header">
            <div className="eyebrow-pill">
              <Sparkles size={14} className="accent-gold" />
              <span>EXECUTIVE THESIS SUMMARY</span>
            </div>
            <h2>A Membership Moat Built on Deliberate Exclusion</h2>
          </div>

          <div className="exec-body-grid">
            <div className="exec-main-text">
              <p>
                While traditional Indian payment fintechs (PhonePe, Paytm, Google Pay) compete for raw transacting 
                headcount at zero take-rates, CRED executes the inverse: it strictly admits only consumers with a 
                <strong> CIBIL score of 750 or above</strong> &mdash; the top tier of India&rsquo;s discretionary wealth.
              </p>
              <p>
                By consolidating over <strong>60% of India&rsquo;s multi-credit-card spending</strong>, CRED transforms 
                a free bill payment utility into a high-margin distribution channel for digital lending (CRED Cash), 
                automotive concierge (CRED Garage), and zero-fee wealth advisory (Kuvera &mdash; ₹50,000+ Cr AUM).
              </p>
            </div>

            <div className="exec-highlights-column">
              <div className="exec-stat-box">
                <span className="stat-label">Core Strategic Moat</span>
                <span className="stat-val accent-green">CIBIL ≥ 750 Gate</span>
                <span className="stat-desc">Zero subprime underwriting risk</span>
              </div>
              <div className="exec-stat-box">
                <span className="stat-label">ARPU Differential</span>
                <span className="stat-val accent-gold">₹2,150 / year</span>
                <span className="stat-desc">22x higher than mass payment apps</span>
              </div>
              <div className="exec-stat-box">
                <span className="stat-label">Strategic Landmark</span>
                <span className="stat-val accent-cyan">Meta $900M Series H</span>
                <span className="stat-desc">Native WhatsApp conversational rails</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
