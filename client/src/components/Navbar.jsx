import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, Volume2, VolumeX, Shield, Activity } from "lucide-react";

const LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#live-share", label: "Live Share & Valuation", highlight: true },
  { href: "#founder", label: "Founder & Thesis" },
  { href: "#ecosystem", label: "Ecosystem" },
  { href: "#financials", label: "Financials" },
  { href: "#valuation-history", label: "Cap Table" },
  { href: "#strategy", label: "SWOT & PESTLE" },
  { href: "#intel-faq", label: "Intelligence Hub" },
];

export default function Navbar({ isAudioEnabled, toggleAudio }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "nav--scrolled" : ""} ${open ? "nav--open" : ""}`}>
      <div className="nav__inner">
        <a href="#overview" className="nav__brand" style={{ textDecoration: "none" }}>
          <div className="nav__logo-wrapper">
            <img 
              src="/assets/cred-logo.jpeg" 
              alt="CRED Official Logo" 
              className="nav__logo-img" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="nav__mark-fallback">C</span>
          </div>
          <div className="nav__brand-text">
            <span className="nav__brand-title">CRED</span>
            <span className="nav__tag">CASE STUDY &amp; LIVE INTEL</span>
          </div>
        </a>

        <ul className="nav__links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={l.highlight ? "nav-link-highlight" : ""}>
                {l.highlight && <span className="nav-live-dot" />}
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav__actions">
          {toggleAudio && (
            <button
              onClick={toggleAudio}
              className={`audio-toggle-btn ${isAudioEnabled ? "audio-on" : ""}`}
              title={isAudioEnabled ? "Mute interactive audio clicks" : "Enable interactive subtle clicks"}
              aria-label="Toggle subtle interactive sound"
            >
              {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          )}

          <a href="#live-share" className="btn btn-primary nav-cta">
            <Activity size={14} className="live-spin-icon" /> Live Terminal <ArrowUpRight size={14} />
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
            {l.highlight && <span className="nav-live-dot" />}
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
