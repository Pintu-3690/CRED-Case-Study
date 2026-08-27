import { useState, useEffect } from "react";
import { Activity, ShieldCheck, Zap, TrendingUp, Users, Award, Radio } from "lucide-react";

export default function LiveTelemetryBar({ initialData = {} }) {
  const [tpv, setTpv] = useState(initialData.tpvTodayCr || 2489.42);
  const [txns, setTxns] = useState(initialData.transactionsToday || 1489204);
  const [activeUsers, setActiveUsers] = useState(initialData.activeMembersOnline || 52840);
  const [coins, setCoins] = useState(initialData.coinsMintedTodayM || 18.64);
  const [sharePrice, setSharePrice] = useState(284.50);
  const [tickDirection, setTickDirection] = useState("up");

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time streaming live fintech transaction ticks
      const deltaTpv = Number((Math.random() * 0.08 + 0.02).toFixed(2));
      const deltaTxns = Math.floor(Math.random() * 8 + 3);
      const userJitter = Math.floor(Math.random() * 15 - 7);
      const deltaCoins = Number((Math.random() * 0.002).toFixed(4));
      
      // Share price micro-tick
      const priceDelta = (Math.random() - 0.48) * 0.35;

      setTpv((prev) => Number((prev + deltaTpv).toFixed(2)));
      setTxns((prev) => prev + deltaTxns);
      setActiveUsers((prev) => Math.max(48000, prev + userJitter));
      setCoins((prev) => Number((prev + deltaCoins).toFixed(3)));
      setSharePrice((prev) => {
        const next = Number((prev + priceDelta).toFixed(2));
        setTickDirection(next >= prev ? "up" : "down");
        return next;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="telemetry-bar" role="region" aria-label="Live Company Telemetry">
      <div className="telemetry-inner">
        <div className="telemetry-badge">
          <span className="live-dot" />
          <Radio size={12} className="live-icon" />
          <span>LIVE TELEMETRY</span>
        </div>

        <div className="telemetry-ticker">
          <div className="ticker-item">
            <span className="ticker-label">Today's TPV:</span>
            <span className="ticker-val accent-green">₹{tpv.toLocaleString("en-IN", { minimumFractionDigits: 2 })} Cr</span>
          </div>

          <div className="ticker-sep">•</div>

          <div className="ticker-item">
            <span className="ticker-label">Live Txns Today:</span>
            <span className="ticker-val">{txns.toLocaleString("en-IN")}</span>
          </div>

          <div className="ticker-sep">•</div>

          <div className="ticker-item">
            <span className="ticker-label">Active Members Online:</span>
            <span className="ticker-val accent-cyan">{activeUsers.toLocaleString("en-IN")}</span>
          </div>

          <div className="ticker-sep">•</div>

          <div className="ticker-item">
            <span className="ticker-label">Unlisted Share:</span>
            <span className={`ticker-val ${tickDirection === "up" ? "accent-green" : "accent-red"}`}>
              ₹{sharePrice.toFixed(2)} {tickDirection === "up" ? "▲" : "▼"}
            </span>
          </div>

          <div className="ticker-sep">•</div>

          <div className="ticker-item">
            <span className="ticker-label">CRED Coins Minted:</span>
            <span className="ticker-val accent-gold">{coins.toFixed(2)}M</span>
          </div>

          <div className="ticker-sep">•</div>

          <div className="ticker-item">
            <span className="ticker-label">UPI Rank:</span>
            <span className="ticker-val">#4 India (6.2% Vol)</span>
          </div>

          <div className="ticker-sep">•</div>

          <div className="ticker-item">
            <span className="ticker-label">System Health:</span>
            <span className="ticker-val accent-green">99.998% Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
