"use client";

import { useMemo, useState } from "react";
import { BlueprintNode } from "./BlueprintNode";

interface PortDefinition {
  label: string;
  position: "in" | "out";
}

interface NodeTemplate {
  type: "start" | "select" | "loop" | "write" | "if";
  title: string;
  description: string;
  ports: PortDefinition[];
}

interface BlueprintNodeData extends NodeTemplate {
  id: string;
  x: number;
  y: number;
}

interface Connection {
  from: { nodeId: string; port: string };
  to: { nodeId: string; port: string };
}

const NODE_WIDTH = 240;
const PORT_VERTICAL_SPACING = 32;
const PORT_VERTICAL_OFFSET = 74;
const GRID_PADDING = 18;

const nodeLibrary: NodeTemplate[] = [
  {
    type: "start",
    title: "START-OF-SELECTION",
    description: "Entry point",
    ports: [
      { label: "Event", position: "out" },
      { label: "Output", position: "out" }
    ]
  },
  {
    type: "select",
    title: "SELECT",
    description: "Read table",
    ports: [
      { label: "Rows", position: "in" },
      { label: "Fields", position: "in" },
      { label: "Result", position: "out" }
    ]
  },
  {
    type: "loop",
    title: "LOOP AT",
    description: "Iterate internal table",
    ports: [
      { label: "Table", position: "in" },
      { label: "Row", position: "out" },
      { label: "End", position: "out" }
    ]
  },
  {
    type: "write",
    title: "WRITE",
    description: "Display output",
    ports: [{ label: "Value", position: "in" }]
  },
  {
    type: "if",
    title: "IF / ELSE",
    description: "Branch on condition",
    ports: [
      { label: "Condition", position: "in" },
      { label: "Then", position: "out" },
      { label: "Else", position: "out" }
    ]
  }
];

const initialNodes: BlueprintNodeData[] = [
  {
    ...nodeLibrary[0],
    id: "entry",
    x: GRID_PADDING,
    y: GRID_PADDING
  },
  {
    ...nodeLibrary[1],
    id: "select",
    x: 280,
    y: 140
  },
  {
    ...nodeLibrary[2],
    id: "loop",
    x: 560,
    y: 82
  },
  {
    ...nodeLibrary[3],
    id: "write",
    x: 860,
    y: 120
  }
];

const initialConnections: Connection[] = [
  {
    from: { nodeId: "entry", port: "Output" },
    to: { nodeId: "select", port: "Rows" }
  },
  {
    from: { nodeId: "select", port: "Result" },
    to: { nodeId: "loop", port: "Table" }
  },
  {
    from: { nodeId: "loop", port: "Row" },
    to: { nodeId: "write", port: "Value" }
  }
];

function createNodeId(type: NodeTemplate["type"], index: number) {
  return `${type}-${Date.now()}-${index}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPortCoordinates(node: BlueprintNodeData, portLabel: string, side: "in" | "out") {
  const portIndex = node.ports.findIndex((port) => port.label === portLabel);
  const y = node.y + PORT_VERTICAL_OFFSET + portIndex * PORT_VERTICAL_SPACING;
  const x = side === "out" ? node.x + NODE_WIDTH : node.x;
  return { x, y };
}

function abapSnippetForNode(node: NodeTemplate): string {
  switch (node.type) {
    case "start":
      return "START-OF-SELECTION.";
    case "select":
      return "  SELECT * FROM mara INTO TABLE @DATA(lt_rows).";
    case "loop":
      return "  LOOP AT lt_rows INTO DATA(ls_row).";
    case "if":
      return "    IF ls_row IS NOT INITIAL.";
    case "write":
      return "      WRITE / ls_row.";
    default:
      return node.title;
  }
}

export function BlueprintCanvas() {
  const [nodes, setNodes] = useState<BlueprintNodeData[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [pendingOutput, setPendingOutput] = useState<Connection["from"] | null>(null);

  const nodesById = useMemo(() => {
    return nodes.reduce<Record<string, BlueprintNodeData>>((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
  }, [nodes]);

  const derivedConnections = useMemo(() => {
    return connections
      .map((connection) => {
        const fromNode = nodesById[connection.from.nodeId];
        const toNode = nodesById[connection.to.nodeId];

        if (!fromNode || !toNode) return null;

        const from = getPortCoordinates(fromNode, connection.from.port, "out");
        const to = getPortCoordinates(toNode, connection.to.port, "in");

        return { from, to };
      })
      .filter(Boolean) as { from: { x: number; y: number }; to: { x: number; y: number } }[];
  }, [connections, nodesById]);

  const addNode = (template: NodeTemplate) => {
    setNodes((prev) => {
      const id = createNodeId(template.type, prev.length);
      const y = GRID_PADDING + (prev.length % 3) * 120;
      const x = GRID_PADDING + prev.length * 120;
      return [
        ...prev,
        {
          ...template,
          id,
          x,
          y
        }
      ];
    });
  };

  const clearConnections = () => {
    setConnections([]);
    setPendingOutput(null);
  };

  const resetCanvas = () => {
    setNodes(initialNodes);
    setConnections(initialConnections);
    setPendingOutput(null);
  };

  const handlePortClick = (nodeId: string, port: PortDefinition) => {
    if (port.position === "out") {
      setPendingOutput({ nodeId, port: port.label });
      return;
    }

    if (pendingOutput) {
      if (pendingOutput.nodeId === nodeId) {
        setPendingOutput(null);
        return;
      }

      const nextConnection: Connection = {
        from: pendingOutput,
        to: { nodeId, port: port.label }
      };

      setConnections((prev) => {
        const exists = prev.some(
          (connection) =>
            connection.from.nodeId === nextConnection.from.nodeId &&
            connection.from.port === nextConnection.from.port &&
            connection.to.nodeId === nextConnection.to.nodeId &&
            connection.to.port === nextConnection.to.port
        );

        if (exists) return prev;
        return [...prev, nextConnection];
      });
      setPendingOutput(null);
    }
  };

  const moveNode = (nodeId: string, deltaX: number, deltaY: number) => {
    setNodes((prev) => {
      const maxX = 1200;
      const maxY = 720;
      return prev.map((node) => {
        if (node.id !== nodeId) return node;
        return {
          ...node,
          x: clamp(node.x + deltaX, GRID_PADDING, maxX),
          y: clamp(node.y + deltaY, GRID_PADDING, maxY)
        };
      });
    });
  };

  const snippet = useMemo(() => {
    const adjacency = new Map<string, string[]>();
    connections.forEach((connection) => {
      const neighbors = adjacency.get(connection.from.nodeId) ?? [];
      neighbors.push(connection.to.nodeId);
      adjacency.set(connection.from.nodeId, neighbors);
    });

    const inboundCounts = new Map<string, number>();
    connections.forEach((connection) => {
      inboundCounts.set(connection.to.nodeId, (inboundCounts.get(connection.to.nodeId) ?? 0) + 1);
    });

    const entryCandidates = nodes
      .filter((node) => (inboundCounts.get(node.id) ?? 0) === 0)
      .map((node) => node.id);

    const visited = new Set<string>();
    const lines: string[] = [];

    const visit = (nodeId: string, depth: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodesById[nodeId];
      if (!node) return;

      const indent = " ".repeat(depth * 2);

      lines.push(`${indent}${abapSnippetForNode(node)}`);

      const neighbors = adjacency.get(nodeId) ?? [];
      neighbors.forEach((neighbor) => visit(neighbor, depth + 1));

      if (node.type === "loop") {
        lines.push(`${indent}ENDLOOP.`);
      }
      if (node.type === "if") {
        lines.push(`${indent}ELSE.`);
        lines.push(`${indent}ENDIF.`);
      }
    };

    entryCandidates.forEach((id) => visit(id, 0));

    return lines.length > 0
      ? lines.join("\n")
      : "Connect ports to generate a stitched ABAP outline.";
  }, [connections, nodes, nodesById]);

  return (
    <section className="canvas" aria-label="ABAP visual programming canvas">
      <div className="canvas__toolbar">
        <div className="toolbar__group">
          <p className="toolbar__title">Node library</p>
          <div className="toolbar__buttons">
            {nodeLibrary.map((template) => (
              <button
                key={template.type}
                type="button"
                onClick={() => addNode(template)}
                className="toolbar__button"
              >
                + {template.title}
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar__group toolbar__group--actions">
          <button type="button" className="toolbar__button" onClick={clearConnections}>
            Clear links
          </button>
          <button type="button" className="toolbar__button" onClick={resetCanvas}>
            Reset canvas
          </button>
        </div>
      </div>

      <p className="canvas__status" role="status">
        {pendingOutput
          ? `Select an input port to connect from ${pendingOutput.port}`
          : "Click an output port, then an input port, to form a link. Drag a node to reposition it."}
      </p>

      <div className="canvas__grid">
        <svg className="canvas__links" aria-hidden>
          {derivedConnections.map((connection, index) => (
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
            <BlueprintNode
              key={node.id}
              id={node.id}
              {...node}
              onPortClick={(port) => handlePortClick(node.id, port)}
              isPending={pendingOutput?.nodeId === node.id}
              onMove={(dx, dy) => moveNode(node.id, dx, dy)}
            />
          ))}
        </div>
      </div>

      <div className="canvas__panel" aria-label="ABAP outline preview">
        <div>
          <h3>ABAP outline</h3>
          <p className="panel__copy">
            Links drive a stitched ABAP snippet. Start from an output port, link into inputs, and drag
            nodes to clarify flow.
          </p>
        </div>
        <pre className="panel__code">{snippet}</pre>
      </div>
    </section>
  );
}
