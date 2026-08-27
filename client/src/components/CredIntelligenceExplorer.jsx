import { useState } from "react";
import { HelpCircle, ChevronDown, Search, Sparkles, CheckCircle2, MessageSquare } from "lucide-react";
import Reveal from "./Reveal";

export default function CredIntelligenceExplorer({ faqList = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(0);

  const filtered = faqList.filter((item) =>
    item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="intel-section" id="intel-faq">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow-pill">
            <Sparkles size={14} className="accent-gold" />
            <span>INTERACTIVE STRATEGIC INTELLIGENCE HUB</span>
          </div>
          <h2>Critical Business Questions &amp; Analysis</h2>
          <p>
            Instant strategic clarity on CRED&rsquo;s business model, valuation multiple rationales, 
            Meta partnership mechanics, and regulatory compliance.
          </p>
        </Reveal>

        {/* Search Bar */}
        <Reveal as="div" className="intel-search-wrap">
          <div className="search-input-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search strategic insights (e.g. 'Meta', 'Monetization', 'CIBIL', 'Loss Reduction')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="intel-search-input"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                Clear
              </button>
            )}
          </div>
        </Reveal>

        {/* FAQ Accordion List */}
        <div className="faq-accordion-list">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isOpen = expandedIndex === idx;
              return (
                <Reveal as="div" delay={idx * 50} key={item.q} className={`card faq-item-card ${isOpen ? "open" : ""}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => setExpandedIndex(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-q-left">
                      <span className="faq-q-number">Q{idx + 1}</span>
                      <span className="faq-q-text">{item.q}</span>
                    </div>
                    <ChevronDown size={18} className={`faq-arrow ${isOpen ? "rotated" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="faq-answer-body">
                      <div className="faq-answer-inner">
                        <div className="faq-verified-pill">
                          <CheckCircle2 size={14} className="accent-green" /> Verified Analytical Insight
                        </div>
                        <p>{item.a}</p>
                      </div>
                    </div>
                  )}
                </Reveal>
              );
            })
          ) : (
            <div className="no-results-box card">
              <p>No answers found matching &ldquo;{searchTerm}&rdquo;. Try another term.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
