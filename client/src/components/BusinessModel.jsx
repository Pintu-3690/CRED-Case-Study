import { Users, Target, Radio, HeartHandshake, Zap, Handshake, Database, DollarSign, Wallet } from "lucide-react";
import Reveal from "./Reveal";

const BLOCKS = [
  { key: "segments", label: "Customer Segments", icon: Users, color: "#00df82" },
  { key: "valueProposition", label: "Value Proposition", icon: Target, color: "#ff3355" },
  { key: "channels", label: "Channels", icon: Radio, color: "#00e5ff" },
  { key: "customerRelationships", label: "Customer Relationships", icon: HeartHandshake, color: "#ffd700" },
  { key: "keyActivities", label: "Key Activities", icon: Zap, color: "#00df82" },
  { key: "keyPartners", label: "Key Partners", icon: Handshake, color: "#b388ff" },
  { key: "keyResources", label: "Key Resources", icon: Database, color: "#00e5ff" },
  { key: "costStructure", label: "Cost Structure", icon: DollarSign, color: "#ff3355" },
  { key: "revenueStreams", label: "Revenue Streams", icon: Wallet, color: "#00df82" },
];

export default function BusinessModel({ model }) {
  if (!model) return null;
  return (
    <section className="business-model-section" id="business-model">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow-pill">
            <Target size={14} className="accent-red" />
            <span>BUSINESS MODEL CANVAS</span>
          </div>
          <h2>Nine Blocks, One Gated Ecosystem</h2>
          <p>How CRED orchestrates partners, high-touch activities, and revenue streams around its 750+ CIBIL filter.</p>
        </Reveal>

        <div className="canvas-grid-v2">
          {BLOCKS.map((b, i) => {
            const IconComp = b.icon;
            return (
              <Reveal as="div" key={b.key} delay={i * 40} className="card canvas-card-v2">
                <div className="canvas-card-top">
                  <div className="canvas-icon-wrap" style={{ color: b.color, backgroundColor: `rgba(255,255,255,0.05)` }}>
                    <IconComp size={18} />
                  </div>
                  <h4 style={{ color: b.color }}>{b.label}</h4>
                </div>
                <p className="canvas-card-body">{model[b.key]}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
