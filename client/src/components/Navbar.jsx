import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const LINKS = [
  { href: "#trading-terminal", label: "Live Market" },
  { href: "#shares-captable", label: "All Shares" },
  { href: "#valuation-workbench", label: "Valuation" },
  { href: "#financials", label: "Financials" },
  { href: "#founder", label: "Case Study" },
];

export default function Navbar({ credQuote }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(100, (y / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const livePrice = credQuote?.price || 284.50;
  const pctChange = credQuote?.pctChange ?? 1.37;
  const isUp = (credQuote?.change ?? 1) >= 0;

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""} ${open ? "nav--open" : ""}`}>
      <div className="reading-progress-track" aria-hidden="true">
        <div className="reading-progress-fill" style={{ width: `${scrollProgress}%` }} />
      </div>

      <div className="nav__inner">
        {/* Zone 1: Single-line brand wordmark */}
        <a href="#overview" className="nav__brand">
          <div className="nav__logo-wrapper">
            <img
              src="/assets/cred-logo.jpeg"
              alt="CRED Logo"
              className="nav__logo-img"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="nav__mark-fallback">C</span>
          </div>
          <span className="nav__brand-title">CRED</span>
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav aria-label="Primary navigation">
          <ul className="nav__links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="nav__actions">
          <a href="#trading-terminal" className="btn btn-primary nav-cta tabular-nums">
            <span>CRED ₹{livePrice.toFixed(2)}</span>
            <span className={`nav-cta-delta ${isUp ? "text-green-dark" : "text-red-dark"}`}>
              {isUp ? "+" : ""}{pctChange.toFixed(2)}%
            </span>
            <ArrowUpRight size={14} />
          </a>

          <button
            className="nav__burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div className="nav__mobile">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </div>
    </header>
  );
}
