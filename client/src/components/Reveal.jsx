import useReveal from "../hooks/useReveal";

export default function Reveal({ as: Tag = "div", className = "", delay = 0, id, style, children }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal ${visible ? "reveal--visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms", ...style }}
    >
      {children}
    </Tag>
  );
}
