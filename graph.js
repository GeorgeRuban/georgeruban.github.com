// ===== Utilities =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const createSvgElement = (type, attributes) => {
  const element = document.createElementNS("http://www.w3.org/2000/svg", type);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

// The drawing surface
const svg = createSvgElement("svg", { width: "90%", height: "80%" });
document.body.appendChild(svg);
const rect = createSvgElement("rect", {
  width: "100%",
  height: "100%",
  fill: "white",
  stroke: "black",
  "stroke-width": "2",
});
svg.appendChild(rect);

// Class Node { number x; number y; string id; SVGElement group; }
const nodes = [];
// Class Edge { Node start; Node end; string id; number weight; SVGElement group; }
const edges = [];

let selectedNode = null;
let selectedEdge = null;
let currentDragLine = null;
const selectNode = (node) => {
  unselectNode();
  unselectEdge();
  selectedNode = node;
  node.group.setAttribute("stroke", "red");
  currentDragLine = createSvgElement("line", {
    x1: node.x,
    y1: node.y,
    x2: node.x,
    y2: node.y,
    stroke: "red",
    "stroke-width": "2",
  });
  svg.appendChild(currentDragLine);
};
const unselectNode = () => {
  if (selectedNode) {
    selectedNode.group.setAttribute("stroke", "black");
  }
  selectedNode = null;
  if (currentDragLine) {
    svg.removeChild(currentDragLine);
    currentDragLine = null;
  }
};
const deleteNode = (node) => {
  nodes.splice(nodes.indexOf(node), 1);
  svg.removeChild(node.group);
  while (edges.length) {
    // Remove all edges connected to this node
    const edge = edges.find((e) => e.start === node || e.end === node);
    if (edge) {
      deleteEdge(edge);
    } else {
      break; // No more edges to delete
    }
  }
  unselectNode();
};
const deleteEdge = (edge) => {
  edges.splice(edges.indexOf(edge), 1);
  svg.removeChild(edge.group);
};
const selectEdge = (edge) => {
  unselectNode();
  unselectEdge();
  selectedEdge = edge;
  edge.group.setAttribute("stroke", "red");
};
const unselectEdge = () => {
  if (selectedEdge) {
    selectedEdge.group.setAttribute("stroke", "black");
  }
  selectedEdge = null;
};

// Clicking on SVG adds a node.
// Clicking on node selects the node, then
// * Pressing delete button deletes the node
// * Moving the mouse starts a drag line from first node,
// then clicking on another node makes an edge
// Clicking on an edge selects it, allowing:
// * Delete
// * Edit (changing weight)

let nextNodeId = 1;
const addNode = (x, y) => {
  const id = "N" + nextNodeId++;
  const group = createSvgElement("g", {
    id,
    stroke: "black",
    "stroke-width": "0.5",
  });
  const circle = createSvgElement("circle", {
    cx: x,
    cy: y,
    r: "16",
    "stroke-width": "2",
    fill: "white",
  });
  const text = createSvgElement("text", {
    x: x,
    y: y + 4,
    "text-anchor": "middle",
    "font-size": "10",
    "font-family": "Arial",
    fill: "black",
  });
  text.textContent = id;
  group.appendChild(circle);
  group.appendChild(text);
  svg.appendChild(group);
  const node = { x, y, id, group };
  nodes.push(node);
  group.addEventListener("click", (e) => {
    onNodeClick(node, e);
  });
};

const onNodeClick = (node, e) => {
  e.stopPropagation();
  if (selectedNode) {
    // don't allow looping edges for now
    if (selectedNode === node) {
      unselectNode();
      return;
    }
    addEdge(selectedNode, node);
    unselectNode();
  } else {
    selectNode(node);
  }
};

let nextEdgeId = 1;
const addEdge = (startNode, endNode) => {
  const id = "E" + nextEdgeId++;
  const weight = Math.sqrt(
    (startNode.x - endNode.x) ** 2 + (startNode.y - endNode.y) ** 2
  );
  const group = createSvgElement("g", { id, stroke: "black" });
  const line = createSvgElement("line", {
    x1: startNode.x,
    y1: startNode.y,
    x2: endNode.x,
    y2: endNode.y,
    "stroke-width": "2",
  });

  const rect = createSvgElement("rect", {
    x: (startNode.x + endNode.x) / 2 - 20,
    y: (startNode.y + endNode.y) / 2 - 10,
    width: 40,
    height: 15,
    fill: "white",
    "stroke-width": "1",
  });
  group.appendChild(line);
  group.appendChild(rect);

  const foreignObject = createSvgElement("foreignObject", {
    x: (startNode.x + endNode.x) / 2 - 20,
    y: (startNode.y + endNode.y) / 2 - 10,
    width: 40,
    height: 15,
  });
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.value = weight.toFixed(2);
  textInput.style.fontSize = "10px";
  textInput.style.fontFamily = "Arial";
  textInput.addEventListener("change", () => {
    const newWeight = parseFloat(textInput.value);
    if (!isNaN(newWeight)) {
      edge.weight = newWeight;
      textInput.value = newWeight.toFixed(2);
    }
  });
  foreignObject.appendChild(textInput);
  group.appendChild(foreignObject);

  svg.appendChild(group);
  const edge = { start: startNode, end: endNode, id, weight, group };
  edges.push(edge);
  group.addEventListener("click", (e) => {
    e.stopPropagation();
    selectEdge(edge);
  });
};

svg.addEventListener("click", (e) => {
  // Sometimes the click is on an existing node, but the
  // svg receives it anyway.
  const node = nodes.find(
    (node) => Math.hypot(node.x - e.offsetX, node.y - e.offsetY) <= 16
  );
  if (node) {
    onNodeClick(node, e);
    return; // Ignore clicks on existing nodes
  }
  if (!selectedNode && !selectedEdge) {
    addNode(e.offsetX, e.offsetY);
  }
});

svg.addEventListener("mousemove", (e) => {
  // Update the edge line as the mouse moves
  if (currentDragLine) {
    currentDragLine.setAttribute("x2", e.offsetX);
    currentDragLine.setAttribute("y2", e.offsetY);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Delete") {
    // Delete the selected node or edge
    if (selectedEdge) {
      deleteEdge(selectedEdge);
    } else if (selectedNode) {
      deleteNode(selectedNode);
    }
  }
  if (e.key === "Escape") {
    unselectNode();
    unselectEdge();
  }
});
