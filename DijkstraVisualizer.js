class DijkstraVisualizer {
    constructor(graph, canvas, ctx) {
        this.graph = graph;
        this.canvas = canvas;
        this.ctx = ctx;
        this.distanceArray = new Map();
        this.predecessorArray = new Map();
        this.relaxedNodes = new Set();
        this.visitedNodes = new Set(); // Track visited nodes

        this.logContainer = document.getElementById('logContainer'); // Reference to the log container
        this.priorityQueue = new MinPriorityQueue(); // Initialize a priority queue for Dijkstra
    }

    initialize(startNode) {
        this.clearLog(); // Clear the log whenever we initialize or reset
        console.log('Initializing Dijkstra with start node:', startNode);
        this.distanceArray.clear();
        this.predecessorArray.clear();
        this.relaxedNodes.clear();
        this.visitedNodes.clear();

        this.graph.nodes.forEach(node => {
            this.distanceArray.set(node, Infinity);
            this.predecessorArray.set(node, null);
        });

        this.distanceArray.set(startNode, 0);
        this.priorityQueue.clear(); // Clear the queue for a fresh run
        this.priorityQueue.enqueue(startNode, 0);

        this.updateUI();
        this.graph.draw(this.ctx); // Draw graph without highlights initially
    }

    clearLog() {
        // Clear the contents of the log container
        this.logContainer.innerHTML = '';
    }

    addLog(message) {
        // Create a new log entry and append it to the log container
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        logEntry.style.color = '#e0e0e0'; // Text color
        logEntry.style.marginBottom = '5px'; // Add some spacing between log messages

        // Append the log entry to the log container
        this.logContainer.appendChild(logEntry);

        // Ensure the log container scrolls to the bottom as new messages are added
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    async nextStep() {
        // If the priority queue is empty, we're done
        if (this.priorityQueue.isEmpty()) {
            const logMessage = `Algorithm completed or no more steps available.`;
            console.log(logMessage);
            this.addLog(logMessage);
            return;
        }

        // Get the node with the minimum distance from the queue
        const { element: u } = this.priorityQueue.dequeue();

        // If the node has already been visited, skip it
        if (this.visitedNodes.has(u)) {
            return;
        }

        this.visitedNodes.add(u);
        this.relaxedNodes.clear(); // Clear previous relaxed nodes

        const neighbors = this.graph.edges.get(u);
        neighbors.forEach(({ node: v, weight }) => {
            this.relax(u, v, weight);
        });

        this.updateUI();
        this.highlightGraph();
    }

    relax(u, v, weight) {
        const currentDistanceV = this.distanceArray.get(v);
        const newDistance = this.distanceArray.get(u) + weight;

        if (currentDistanceV > newDistance) {
            const logMessage = `Relaxing edge (${u}, ${v}) with weight ${weight}. Improvement found: distance to ${v} changed from ${currentDistanceV} to ${newDistance}.`;
            console.log(logMessage); // Still log to the console
            this.addLog(logMessage); // Also add to log container

            this.distanceArray.set(v, newDistance);
            this.predecessorArray.set(v, u);
            this.relaxedNodes.add(u);
            this.relaxedNodes.add(v);

            // Update the priority queue with the new distance for v
            this.priorityQueue.enqueue(v, newDistance);
        } else {
            const logMessage = `Relaxing edge (${u}, ${v}) with weight ${weight}. No improvement: distance to ${v} remains ${currentDistanceV}.`;
            console.log(logMessage); // Still log to the console
            this.addLog(logMessage); // Also add to log container
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
            this.ctx.fillStyle = '#FFD700'; // Gold color for relaxed nodes
        } else if (this.visitedNodes.has(node)) {
            this.ctx.fillStyle = '#ADD8E6'; // Light blue color for visited nodes
        } else {
            this.ctx.fillStyle = '#1e1e1e'; // Default color for non-relaxed nodes
        }

        this.ctx.fill();
        this.ctx.strokeStyle = '#ADD8E6';
        this.ctx.stroke();

        // Dynamically adjust font size based on the node text length
        const baseFontSize = 16; // Base font size
        const maxFontSize = this.graph.radius * 1.5; // Limit max font size
        const fontSize = Math.min(baseFontSize + (10 - node.length) * 1.5, maxFontSize); // Adjust font size based on length

        this.ctx.fillStyle = '#FFFFFF'; // Set the text color to white
        this.ctx.font = `${fontSize}px Arial`; // Dynamically set font size
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node, pos.x, pos.y); // Draw the node text
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

class MinPriorityQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(element, priority) {
        this.queue.push({ element, priority });
        this.queue.sort((a, b) => a.priority - b.priority); // Sort by priority (distance)
    }

    dequeue() {
        return this.queue.shift(); // Get the element with the minimum priority
    }

    clear() {
        this.queue = [];
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}


window.onload = function() {
    const canvas = document.getElementById('dijkstraCanvas');
    const ctx = canvas.getContext('2d');
    const graph = new WeightedDirectedGraph();
    const visualizer = new DijkstraVisualizer(graph, canvas, ctx);

    // Event listeners for UI controls
    document.getElementById('startButton').addEventListener('click', () => {
        const startNode = document.getElementById('nodeSelector').value;
        visualizer.initialize(startNode);
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        visualizer.nextStep();
    });

    document.getElementById('resetButton').addEventListener('click', () => {
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
        document.getElementById('importGraphModal').style.display = 'none';
    });

    document.getElementById('closeModalButton').addEventListener('click', () => {
        document.getElementById('importGraphModal').style.display = 'none';
    });

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