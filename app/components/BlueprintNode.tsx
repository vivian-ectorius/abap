interface PortProps {
  label: string;
  position: "in" | "out";
}

interface BlueprintNodeProps {
  title: string;
  description: string;
  ports: PortProps[];
  x: number;
  y: number;
}

export function BlueprintNode({ title, description, ports, x, y }: BlueprintNodeProps) {
  return (
    <div
      className="node"
      style={{
        transform: `translate(${x}px, ${y}px)`
      }}
    >
      <header>
        <span className="node__title">{title}</span>
        <span className="node__description">{description}</span>
      </header>
      <div className="node__ports">
        {ports.map((port) => (
          <div
            key={`${title}-${port.label}-${port.position}`}
            className={`port port--${port.position}`}
          >
            {port.position === "in" && <span className="port__circle" aria-hidden />}
            <span className="port__label">{port.label}</span>
            {port.position === "out" && <span className="port__circle" aria-hidden />}
          </div>
        ))}
      </div>
    </div>
  );
}
