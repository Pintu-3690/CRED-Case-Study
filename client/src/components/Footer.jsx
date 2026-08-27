import { ShieldCheck, Activity, ArrowUp } from "lucide-react";

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
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="footer-logo-text">CRED</span>
            </div>
            <p className="footer-tagline">
              An independent, comprehensive financial and strategic business analysis of Dreamplug Technologies Pvt. Ltd.
            </p>
          </div>

          <div className="footer-status-wrap">
            <div className="footer-live-badge">
              <span className="live-dot" />
              <span>Real-Time Market Telemetry Active</span>
            </div>
            <button onClick={scrollToTop} className="btn btn-ghost scroll-top-btn">
              Back to top <ArrowUp size={14} />
            </button>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p className="footer-disclaimer">
            Independent educational case study &bull; Synthesized from audited MCA filings, RBI publications, and institutional secondary market equity research. Not officially affiliated with or endorsed by Dreamplug Technologies Pvt. Ltd.
          </p>
          <p className="footer-updated">
            Research updated: <strong>{updated}</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
