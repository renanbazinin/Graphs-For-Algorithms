class SCCVisualizer {
    constructor(graph, canvas, ctx) {
        this.graph = graph;
        this.canvas = canvas;
        this.ctx = ctx;
        this.index = 0;
        this.stack = [];
        this.indices = new Map();
        this.lowLink = new Map();
        this.onStack = new Map();
        this.SCCs = [];
        this.superGraph = null;
        this.selectedNode = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.originalPositions = new Map(); // Store original positions
    }

    findSCCs() {
        this.graph.nodes.forEach(node => {
            if (!this.indices.has(node)) {
                this.strongConnect(node);
            }
        });
    }

    strongConnect(v) {
        this.indices.set(v, this.index);
        this.lowLink.set(v, this.index);
        this.index++;
        this.stack.push(v);
        this.onStack.set(v, true);

        const neighbors = this.graph.edges.get(v) || [];
        neighbors.forEach(w => {
            if (!this.indices.has(w)) {
                this.strongConnect(w);
                this.lowLink.set(v, Math.min(this.lowLink.get(v), this.lowLink.get(w)));
            } else if (this.onStack.get(w)) {
                this.lowLink.set(v, Math.min(this.lowLink.get(v), this.indices.get(w)));
            }
        });

        if (this.lowLink.get(v) === this.indices.get(v)) {
            let scc = [];
            let w;
            do {
                w = this.stack.pop();
                this.onStack.set(w, false);
                scc.push(w);
            } while (v !== w);
            this.SCCs.push(scc);
        }
    }

    drawSuperGraph() {
        this.superGraph = new DirectedGraph();

        const nodeToSCC = new Map();
        this.SCCs.forEach((scc, index) => {
            const sccName = scc.join('');
            this.superGraph.addNode(sccName, 100 + index * 150, 100); 
            scc.forEach(node => {
                nodeToSCC.set(node, sccName);
            });
        });

        this.graph.edges.forEach((neighbors, node) => {
            neighbors.forEach(neighbor => {
                const fromSCC = nodeToSCC.get(node);
                const toSCC = nodeToSCC.get(neighbor);
                if (fromSCC !== toSCC) {
                    this.superGraph.addEdge(fromSCC, toSCC);
                }
            });
        });

        this.superGraph.draw(this.ctx);
    }

    reset() {
        this.graph.clear();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.superGraph = null;
        this.index = 0;
        this.stack = [];
        this.indices.clear();
        this.lowLink.clear();
        this.onStack.clear();
        this.SCCs = [];
    }

    restoreTree() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.graph.positions = new Map(this.originalPositions); // Restore original positions
        this.superGraph = null; // Reset the supergraph
        this.graph.draw(this.ctx);
    }

    saveOriginalPositions() {
        for (const [node, pos] of Object.entries(this.graph.positions)) {
            this.originalPositions.set(node, { ...pos }); // Save a copy of the positions
        }
    }

    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const targetGraph = this.superGraph || this.graph;

        for (const [node, pos] of Object.entries(targetGraph.positions)) {
            const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
            if (distance <= targetGraph.radius) {
                this.selectedNode = node;
                this.offsetX = pos.x - x;
                this.offsetY = pos.y - y;
                break;
            }
        }
    }

    handleMouseMove(event) {
        if (this.selectedNode) {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left + this.offsetX;
            const y = event.clientY - rect.top + this.offsetY;

            const targetGraph = this.superGraph || this.graph;

            targetGraph.positions[this.selectedNode] = { x, y };
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            targetGraph.draw(this.ctx);

            for (const node of targetGraph.nodes) {
                this.highlightNode(node);
            }
        }
    }

    handleMouseUp() {
        this.selectedNode = null;
    }

    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: this.canvas,
        });
    }

    handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: this.canvas,
        });
    }

    handleTouchEnd() {
        this.handleMouseUp();
    }

    highlightNode(node) {
        const targetGraph = this.superGraph || this.graph;
        const pos = targetGraph.positions[node];
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, targetGraph.radius, 0, 2 * Math.PI);
        this.ctx.fillText(node, pos.x, pos.y);
    }
}

window.onload = function() {
    const canvas = document.getElementById('sccCanvas');
    const ctx = canvas.getContext('2d');
    const graph = new DirectedGraph();
    let visualizer = null;

    function initializeVisualizer() {
        if (!visualizer) {
            visualizer = new SCCVisualizer(graph, canvas, ctx);
            visualizer.saveOriginalPositions(); // Save initial positions
        }
    }

    loadClassicExample();
    graph.draw(ctx);

    document.getElementById('startButton').addEventListener('click', () => {
        initializeVisualizer();
        visualizer.findSCCs();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        visualizer.drawSuperGraph();
    });

    document.getElementById('restoreButton').addEventListener('click', () => {
        initializeVisualizer();
        visualizer.restoreTree();
    });

    document.getElementById('importGraphButton').addEventListener('click', () => {
        const currentAdjacencyList = graph.getAdjacencyList();
        document.getElementById('graphInput').value = currentAdjacencyList;
        document.getElementById('importGraphModal').style.display = 'flex';
    });

    document.getElementById('loadGraphButton').addEventListener('click', () => {
        const text = document.getElementById('graphInput').value;
        loadGraphFromText(text);
        document.getElementById('importGraphModal').style.display = 'none';
        graph.draw(ctx);
    });

    document.getElementById('closeModalButton').addEventListener('click', () => {
        document.getElementById('importGraphModal').style.display = 'none';
    });

    document.getElementById('loadInstantExampleButton').addEventListener('click', () => {
        initializeVisualizer();
        loadClassicExample();
        graph.draw(ctx);
    });

    function loadGraphFromText(text) {
        initializeVisualizer();
        graph.clear();
        const lines = text.split('\n');
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0) {
                return; // Ignore empty lines
            }
            const [node, neighbors] = trimmedLine.split('->').map(part => part.trim());
            graph.addNode(node);
            if (neighbors) {
                neighbors.split(',').forEach(neighbor => {
                    graph.addNode(neighbor.trim());
                    graph.addEdge(node, neighbor.trim());
                });
            }
        });
        updateAdjacencyList();
    }
    

    function loadClassicExample() {
        const example = `
            a -> b
            b -> c, d
            c -> a
            d -> e
            e -> f
            f -> e
        `;
        loadGraphFromText(example.trim());
        graph.draw(ctx);
    }

    function updateAdjacencyList() {
        const adjacencyList = graph.getAdjacencyList();
        document.getElementById('directedAdjacencyList').innerText = adjacencyList;
    }

    canvas.addEventListener('mousedown', (event) => {
        if (visualizer) visualizer.handleMouseDown(event);
    });
    canvas.addEventListener('mousemove', (event) => {
        if (visualizer) visualizer.handleMouseMove(event);
    });
    canvas.addEventListener('mouseup', () => {
        if (visualizer) visualizer.handleMouseUp();
    });

    canvas.addEventListener('touchstart', (event) => {
        if (visualizer) visualizer.handleTouchStart(event);
    }, { passive: false });
    canvas.addEventListener('touchmove', (event) => {
        if (visualizer) visualizer.handleTouchMove(event);
    }, { passive: false });
    canvas.addEventListener('touchend', () => {
        if (visualizer) visualizer.handleTouchEnd();
    }, { passive: false });
};
