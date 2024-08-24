class BFSVisualizer {
    constructor(graph, canvas, ctx) {
        this.graph = graph;
        this.canvas = canvas;
        this.ctx = ctx;
        this.distanceArray = [];
        this.queue = [];
        this.previousStates = [];
        this.selectedNode = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.currentNode = null; // To keep track of the current node being processed
    }

    initialize(startNode) {
        this.distanceArray = [];
        this.queue = [];
        this.previousStates = [];
        this.currentNode = null;

        this.graph.nodes.forEach(node => {
            this.distanceArray[node] = Infinity;
        });

        this.distanceArray[startNode] = 0;
        this.queue.push(startNode);

        this.saveState();
        this.updateUI();
        this.highlightGraph();
    }

    saveState() {
        const state = {
            distanceArray: { ...this.distanceArray },
            queue: [...this.queue],
            currentNode: this.currentNode
        };
        this.previousStates.push(state);
    }

    undoStep() {
        if (this.previousStates.length > 1) {
            this.previousStates.pop();
            const previousState = this.previousStates[this.previousStates.length - 1];
            this.distanceArray = previousState.distanceArray;
            this.queue = previousState.queue;
            this.currentNode = previousState.currentNode;
            this.updateUI();
            this.highlightGraph();
        }
    }

    nextStep() {
        if (this.queue.length > 0) {
            const u = this.queue.shift();
            this.currentNode = u; // Set the current node being processed
            const neighbors = this.graph.edges.get(u) || [];

            neighbors.forEach(v => {
                if (this.distanceArray[v] === Infinity) {
                    this.distanceArray[v] = this.distanceArray[u] + 1;
                    this.queue.push(v);
                }
            });

            this.saveState();
            this.updateUI();
            this.highlightGraph();
        }
    }

    updateUI() {
        const distanceArrayElement = document.getElementById('distanceArray');
        const queueElement = document.getElementById('queue');

        const distanceArrayText = Object.entries(this.distanceArray)
            .map(([node, distance]) => `${node}: ${distance}`)
            .join(', ');

        const queueText = this.queue.join(' -> ');

        distanceArrayElement.innerText = `Distance Array: ${distanceArrayText}`;
        queueElement.innerText = `Current Queue: ${queueText}`;
    }

    highlightGraph() {
        this.graph.draw(this.ctx);

        this.graph.nodes.forEach(node => {
            this.highlightNode(node, this.currentNode === node);
        });
    }

    highlightNode(node, isCurrent) {
        const pos = this.graph.positions[node];
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.graph.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = isCurrent ? 'blue' : '#1e1e1e'; // Highlight the current node in blue
        this.ctx.fill();
        //this.ctx.strokeStyle = 'orange';
        this.ctx.stroke();

        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const nodeNameLength = node.length;
        let fontSize;
        if (nodeNameLength <= 4) {
            fontSize = this.graph.radius / 2;  // Larger font for short names
        } else if (nodeNameLength <= 8) {
            fontSize = this.graph.radius / 2.6;
        } else if (nodeNameLength <= 10) {
            fontSize = this.graph.radius / 3.5;
        } else {
            fontSize = this.graph.radius / 5.5;
        }
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillText(node, pos.x, pos.y);
    }

    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (const [node, pos] of Object.entries(this.graph.positions)) {
            const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
            if (distance <= this.graph.radius) {
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

            this.graph.positions[this.selectedNode] = { x, y };
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.graph.draw(this.ctx);

            this.graph.nodes.forEach(node => {
                this.highlightNode(node, this.currentNode === node);
            });
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
                    this.graph.addNode(neighbor.trim());
                    this.graph.addEdge(node, neighbor.trim());
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
    const canvas = document.getElementById('bfsCanvas');
    const ctx = canvas.getContext('2d');
    const graph = new DirectedGraph();
    const visualizer = new BFSVisualizer(graph, canvas, ctx);

    document.getElementById('startButton').addEventListener('click', () => {
        const startNode = document.getElementById('nodeSelector').value;
        visualizer.initialize(startNode);
        visualizer.nextStep();
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        visualizer.initialize(document.getElementById('nodeSelector').value);
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        visualizer.nextStep();
    });

    document.getElementById('undoButton').addEventListener('click', () => {
        visualizer.undoStep();
    });

    document.getElementById('nodeSelector').addEventListener('change', () => {
        const startNode = document.getElementById('nodeSelector').value;
        visualizer.initialize(startNode);
    });

    document.getElementById('importGraphButton').addEventListener('click', () => {
        const currentAdjacencyList = graph.getAdjacencyList();
        document.getElementById('graphInput').value = currentAdjacencyList;
        document.getElementById('importGraphModal').style.display = 'flex';
    });

    document.getElementById('loadGraphButton').addEventListener('click', () => {
        const text = document.getElementById('graphInput').value;
        visualizer.loadGraphFromText(text);
        visualizer.initialize(document.getElementById('nodeSelector').value);
        document.getElementById('importGraphModal').style.display = 'none';
    });

    document.getElementById('closeModalButton').addEventListener('click', () => {
        document.getElementById('importGraphModal').style.display = 'none';
    });

    loadClassicExample();
    visualizer.initialize('S');

    function loadClassicExample() {
        graph.clear();

        graph.addNode('S', 150, 100);
        graph.addNode('A', 300, 100);
        graph.addNode('B', 150, 400);
        graph.addNode('C', 300, 400);
        graph.addNode('D', 450, 100);
        graph.addNode('E', 450, 400);

        graph.addEdge('S', 'A');
        graph.addEdge('S', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('B', 'C');
        graph.addEdge('A', 'D');
        graph.addEdge('C', 'E');
        graph.addEdge('D', 'E');

        graph.draw(ctx);
        visualizer.updateNodeSelector();
    }

    canvas.addEventListener('mousedown', (event) => visualizer.handleMouseDown(event));
    canvas.addEventListener('mousemove', (event) => visualizer.handleMouseMove(event));
    canvas.addEventListener('mouseup', () => visualizer.handleMouseUp());

    canvas.addEventListener('touchstart', (event) => visualizer.handleTouchStart(event), { passive: false });
    canvas.addEventListener('touchmove', (event) => visualizer.handleTouchMove(event), { passive: false });
    canvas.addEventListener('touchend', () => visualizer.handleTouchEnd(), { passive: false });
};
