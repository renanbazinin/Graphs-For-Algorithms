class BellmanFordVisualizer {
    constructor(graph, canvas, ctx) {
        this.graph = graph;
        this.canvas = canvas;
        this.ctx = ctx;
        this.distanceArray = new Map();
        this.predecessorArray = new Map();
        this.steps = [];
        this.currentStep = 0;
        this.currentRelaxationIndex = 0; // Track the current relaxation
        this.relaxedNodes = new Set(); // Track the nodes being relaxed
    }

    initialize(startNode) {
        console.log('Initializing Bellman-Ford with start node:', startNode);
        this.distanceArray.clear();
        this.predecessorArray.clear();
        this.steps = [];
        this.currentStep = 0;
        this.currentRelaxationIndex = 0; // Reset the relaxation index
        this.relaxedNodes.clear();

        this.graph.nodes.forEach(node => {
            this.distanceArray.set(node, Infinity);
            this.predecessorArray.set(node, null);
        });

        this.distanceArray.set(startNode, 0);
        this.recordStep(); // Record the initial state
        this.updateUI();
        this.graph.draw(this.ctx); // Draw graph without highlights initially
    }

    recordStep() {
        this.steps.push({
            distanceArray: new Map(this.distanceArray),
            predecessorArray: new Map(this.predecessorArray),
            currentStep: this.currentStep,
            currentRelaxationIndex: this.currentRelaxationIndex,
        });
        console.log(`Step ${this.currentStep} recorded. Distance Array:`, this.distanceArray, 'Predecessor Array:', this.predecessorArray);
    }

    undoStep() {
        if (this.steps.length > 1) {
            this.steps.pop();
            const lastStep = this.steps[this.steps.length - 1];
            this.distanceArray = lastStep.distanceArray;
            this.predecessorArray = lastStep.predecessorArray;
            this.currentStep = lastStep.currentStep;
            this.currentRelaxationIndex = lastStep.currentRelaxationIndex;
            this.relaxedNodes.clear(); // Clear relaxed nodes when undoing
            this.updateUI();
            this.highlightGraph();
        }
    }

    async nextStep() {
        const edges = Array.from(this.graph.edges.entries());
        if (this.currentStep < this.graph.nodes.length - 1 && this.currentRelaxationIndex < edges.length) {
            const [u, neighbors] = edges[this.currentRelaxationIndex];
            this.relaxedNodes.clear(); // Clear previous relaxed nodes
            neighbors.forEach(({ node: v, weight }) => {
                this.relax(u, v, weight);
            });

            this.currentRelaxationIndex++;

            if (this.currentRelaxationIndex >= edges.length) {
                this.currentRelaxationIndex = 0;
                this.currentStep++;
            }

            this.recordStep();
            this.updateUI();
            this.highlightGraph();
        } else {
            console.log('Algorithm completed or no more steps available.');
        }
    }

    relax(u, v, weight) {
        if (this.distanceArray.get(v) > this.distanceArray.get(u) + weight) {
            console.log(`Relaxing edge (${u}, ${v}) with weight ${weight}`);
            this.distanceArray.set(v, this.distanceArray.get(u) + weight);
            this.predecessorArray.set(v, u);
            this.relaxedNodes.add(u); // Mark nodes involved in relaxation
            this.relaxedNodes.add(v);
        }
    }

    updateUI() {
        const distanceArrayElement = document.getElementById('distanceArray');
        const predecessorArrayElement = document.getElementById('predecessorArray');

        distanceArrayElement.innerText = `Distance Array: ${Array.from(this.distanceArray).map(([node, dist]) => `${node}: ${dist}`).join(', ')}`;
        predecessorArrayElement.innerText = `Predecessor Array: ${Array.from(this.predecessorArray).map(([node, pred]) => `${node}: ${pred || '-'}`).join(', ')}`;
    }

    highlightGraph() {
        this.graph.draw(this.ctx);

        this.graph.nodes.forEach(node => {
            this.highlightNode(node);
        });
    }

    highlightNode(node) {
        const pos = this.graph.positions[node];
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.graph.radius, 0, 2 * Math.PI);

        if (this.relaxedNodes.has(node)) {
            this.ctx.fillStyle = '#FFD700'; // Highlight relaxed nodes in gold
        } else {
            this.ctx.fillStyle = '#1e1e1e'; // Default color for non-relaxed nodes
        }

        this.ctx.fill();
        this.ctx.strokeStyle = '#ADD8E6';
        this.ctx.stroke();
        this.ctx.fillStyle = '#FFFFFF'; // Set the text color to white

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node, pos.x, pos.y);
    }

    handleMouseDown(event) {
        this.graph.handleMouseDown(event, this.canvas, this.ctx);
    }

    handleMouseMove(event) {
        this.graph.handleMouseMove(event, this.canvas, this.ctx);
    }

    handleMouseUp() {
        this.graph.handleMouseUp();
    }

    handleTouchStart(event) {
        this.graph.handleTouchStart(event, this.canvas, this.ctx);
    }

    handleTouchMove(event) {
        this.graph.handleTouchMove(event, this.canvas, this.ctx);
    }

    handleTouchEnd() {
        this.graph.handleTouchEnd();
    }

    loadGraphFromText(text) {
        this.graph.nodes = [];
        this.graph.edges.clear();

        const lines = text.split('\n');
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0) {
                return;
            }

            const [node, neighbors] = trimmedLine.split('->').map(part => part.trim());
            this.graph.addNode(node);

            if (neighbors) {
                neighbors.split(',').forEach(neighbor => {
                    const [neighborNode, weight] = neighbor.split(':').map(n => n.trim());
                    this.graph.addNode(neighborNode);
                    this.graph.addEdge(node, neighborNode, parseFloat(weight));
                });
            }
        });

        this.graph.draw(this.ctx);
        this.updateNodeSelector();
    }

    updateNodeSelector() {
        const nodeSelector = document.getElementById('nodeSelector');
        nodeSelector.innerHTML = '';
        this.graph.nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node;
            option.text = node;
            nodeSelector.appendChild(option);
        });
    }
}

window.onload = function() {
    const canvas = document.getElementById('bellmanFordCanvas');
    const ctx = canvas.getContext('2d');
    const graph = new WeightedDirectedGraph();
    const visualizer = new BellmanFordVisualizer(graph, canvas, ctx);

    document.getElementById('startButton').addEventListener('click', () => {
        const startNode = document.getElementById('nodeSelector').value;
        visualizer.initialize(startNode);
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        visualizer.nextStep();
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        visualizer.initialize(document.getElementById('nodeSelector').value);
    });

    document.getElementById('undoButton').addEventListener('click', () => {
        visualizer.undoStep();
    });

    document.getElementById('importGraphButton').addEventListener('click', () => {
        const currentAdjacencyList = graph.getAdjacencyList();
        document.getElementById('graphInput').value = currentAdjacencyList;
        document.getElementById('importGraphModal').style.display = 'flex';
    });

    document.getElementById('loadGraphButton').addEventListener('click', () => {
        const text = document.getElementById('graphInput').value;
        visualizer.loadGraphFromText(text);
        document.getElementById('importGraphModal').style.display = 'none';
    });

    document.getElementById('closeModalButton').addEventListener('click', () => {
        document.getElementById('importGraphModal').style.display = 'none';
    });

    document.getElementById('loadClassicExampleButton').addEventListener('click', () => {
        loadClassicExample();
    });

    function loadClassicExample() {
        const example = `
            a -> b:2, c:4
            b -> c:1, d:7
            c -> d:3
            d -> e:1
            e -> a:6
        `;
        visualizer.loadGraphFromText(example.trim());
        visualizer.initialize('a');
    }

    canvas.addEventListener('mousedown', (event) => visualizer.handleMouseDown(event));
    canvas.addEventListener('mousemove', (event) => visualizer.handleMouseMove(event));
    canvas.addEventListener('mouseup', () => visualizer.handleMouseUp());

    // Bind touch events
    canvas.addEventListener('touchstart', (event) => visualizer.handleTouchStart(event), { passive: false });
    canvas.addEventListener('touchmove', (event) => visualizer.handleTouchMove(event), { passive: false });
    canvas.addEventListener('touchend', () => visualizer.handleTouchEnd(), { passive: false });

    visualizer.loadGraphFromText(`
        a -> b:2, c:4
        b -> c:1, d:7
        c -> d:3
        d -> e:1
        e -> a:6
    `);
    visualizer.initialize('a');
};
