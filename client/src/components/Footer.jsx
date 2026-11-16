import { ArrowUp } from "lucide-react";

export default function Footer({ updated = "27 August 2026" }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer-v2">
      <div className="container">
        <div className="footer-top-row">
          <div className="footer-brand-wrap">
            <div className="footer-logo-badge">
              <img
                src="/assets/cred-logo.jpeg"
                alt="CRED"
                className="footer-logo-img"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span className="footer-logo-text">CRED</span>
            </div>
            <p className="footer-tagline">
              An independent financial and strategic business analysis of Dreamplug Technologies Pvt. Ltd.
            </p>
          </div>

          <div className="footer-links-col">
            <nav className="footer-nav" aria-label="Footer navigation">
              <a href="#trading-terminal">Live Market</a>
              <a href="#shares-captable">All Shares</a>
              <a href="#valuation-workbench">DCF Modeler</a>
              <a href="#financials">Financials</a>
              <a href="#sources">Sources</a>
            </nav>
            <button onClick={scrollToTop} className="btn btn-ghost scroll-top-btn">
              Back to top <ArrowUp size={14} />
            </button>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p className="footer-disclaimer">
            Independent educational case study synthesized from audited MCA filings, RBI publications, and secondary
            market equity research. Not officially affiliated with or endorsed by Dreamplug Technologies Pvt. Ltd.
          </p>
          <p className="footer-updated">
            Research updated: <strong>{updated}</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
