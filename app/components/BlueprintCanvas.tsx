import { BlueprintNode } from "./BlueprintNode";

interface Connection {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

interface NodeDefinition {
  id: string;
  title: string;
  description: string;
  ports: { label: string; position: "in" | "out" }[];
  x: number;
  y: number;
}

const nodes: NodeDefinition[] = [
  {
    id: "entry",
    title: "START-OF-SELECTION",
    description: "Entry point",
    ports: [
      { label: "Event", position: "out" },
      { label: "Output", position: "out" }
    ],
    x: 40,
    y: 40
  },
  {
    id: "select",
    title: "SELECT",
    description: "Read table",
    ports: [
      { label: "Rows", position: "in" },
      { label: "Fields", position: "in" },
      { label: "Result", position: "out" }
    ],
    x: 320,
    y: 120
  },
  {
    id: "loop",
    title: "LOOP AT",
    description: "Iterate internal table",
    ports: [
      { label: "Table", position: "in" },
      { label: "Row", position: "out" },
      { label: "End", position: "out" }
    ],
    x: 620,
    y: 60
  },
  {
    id: "write",
    title: "WRITE",
    description: "Display output",
    ports: [
      { label: "Value", position: "in" }
    ],
    x: 900,
    y: 100
  }
];

const connections: Connection[] = [
  {
    from: { x: 210, y: 92 },
    to: { x: 320, y: 170 }
  },
  {
    from: { x: 470, y: 190 },
    to: { x: 620, y: 120 }
  },
  {
    from: { x: 770, y: 150 },
    to: { x: 900, y: 140 }
  }
];

export function BlueprintCanvas() {
  return (
    <section className="canvas" aria-label="ABAP visual programming canvas">
      <svg className="canvas__links" aria-hidden>
        {connections.map((connection, index) => (
          <line
            key={`${connection.from.x}-${connection.to.x}-${index}`}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
          />
        ))}
      </svg>
      <div className="canvas__nodes">
        {nodes.map((node) => (
          <BlueprintNode key={node.id} {...node} />
        ))}
      </div>
    </section>
  );
}
