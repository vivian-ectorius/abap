import React from "react";

interface PortProps {
  label: string;
  position: "in" | "out";
}

interface BlueprintNodeProps {
  id: string;
  title: string;
  description: string;
  ports: PortProps[];
  x: number;
  y: number;
  isPending?: boolean;
  onPortClick?: (port: PortProps) => void;
  onMove?: (deltaX: number, deltaY: number) => void;
}

export function BlueprintNode({
  id,
  title,
  description,
  ports,
  x,
  y,
  isPending,
  onPortClick,
  onMove
}: BlueprintNodeProps) {
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!onMove) return;

    const target = event.target as HTMLElement;
    if (target.closest(".port")) return;

    event.preventDefault();
    let lastX = event.clientX;
    let lastY = event.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - lastX;
      const deltaY = moveEvent.clientY - lastY;
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
      onMove(deltaX, deltaY);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      className="node"
      style={{
        transform: `translate(${x}px, ${y}px)`
      }}
      onPointerDown={handlePointerDown}
      role="group"
      aria-label={`Blueprint node ${title}`}
      data-node-id={id}
    >
      <header>
        <span className="node__title">{title}</span>
        <span className="node__description">{description}</span>
      </header>
      <div className="node__ports">
        {ports.map((port) => {
          const key = `${title}-${port.label}-${port.position}`;
          return (
            <button
              key={key}
              type="button"
              className={`port port--${port.position}`}
              onClick={() => onPortClick?.(port)}
              aria-pressed={isPending && port.position === "out"}
            >
              {port.position === "in" && <span className="port__circle" aria-hidden />}
              <span className="port__label">{port.label}</span>
              {port.position === "out" && <span className="port__circle" aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
