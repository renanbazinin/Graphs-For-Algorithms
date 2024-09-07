class DijkstraVisualizer {
    constructor(graph, canvas, ctx, delay = 500) {
        this.graph = graph;
        this.canvas = canvas;
        this.ctx = ctx;
        this.distanceArray = new Map();
        this.predecessorArray = new Map();
        this.relaxedNodes = new Set();
        this.visitedNodes = new Set();
        this.queue = [];
        this.delay = delay; // Delay in milliseconds

        this.logContainer = document.getElementById('logContainer'); // Log container reference
        this.priorityQueue = new MinPriorityQueue(); // Initialize the priority queue for Dijkstra
    }

    async startDijkstra(startNode) {
        this.clearLog();
        this.distanceArray.clear();
        this.predecessorArray.clear();
        this.relaxedNodes.clear();
        this.visitedNodes.clear();
        this.priorityQueue.clear(); // Clear the priority queue for a fresh start
    
        // Build the priority queue by initializing distances
        this.graph.nodes.forEach(node => {
            const initialDistance = (node === startNode) ? 0 : Infinity;
            this.distanceArray.set(node, initialDistance);
            this.predecessorArray.set(node, null);
            this.priorityQueue.enqueue(node, initialDistance); // Build the priority queue
        });
    
        // **Update queue UI only here to show the initial priority queue**
        this.updateQueueUI(); // Show the initial priority queue only
    
        this.updateUI();
        this.graph.draw(this.ctx);
    
        // Main loop of Dijkstra's algorithm (you can remove further queue updates here)
        while (!this.priorityQueue.isEmpty()) {
            const { element: u } = this.priorityQueue.dequeue();
            if (this.visitedNodes.has(u)) continue;
    
            this.visitedNodes.add(u);
            this.relaxedNodes.clear();
    
            const neighbors = this.graph.edges.get(u) || [];
            for (const { node: v, weight } of neighbors) {
                await this.relax(u, v, weight);
            }
    
            this.updateUI();
            this.highlightGraph();
    
            await this.sleep(this.delay); // Add delay for better visualization
        }
    
        this.addLog("Algorithm completed.");
    }
    
    async relax(u, v, weight) {
        const currentDistanceV = this.distanceArray.get(v);
        const newDistance = this.distanceArray.get(u) + weight;

        if (currentDistanceV > newDistance) {
            this.addLog(`Relaxing edge (${u}, ${v}) with weight ${weight}. Distance to ${v} changed from ${currentDistanceV} to ${newDistance}.`);
            this.distanceArray.set(v, newDistance);
            this.predecessorArray.set(v, u);
            this.priorityQueue.enqueue(v, newDistance); // Re-enqueue to mimic Decrease-Key
            this.relaxedNodes.add(v);
            await this.sleep(this.delay); // Delay for visualizing the change
        } else {
            this.addLog(`Relaxing edge (${u}, ${v}) with weight ${weight}. No improvement: distance to ${v} remains ${currentDistanceV}.`);
        }
    }

    clearLog() {
        this.logContainer.innerHTML = ''; // Clear the log container
    }

    addLog(message) {
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        logEntry.style.color = '#e0e0e0';
        logEntry.style.marginBottom = '5px';
        this.logContainer.appendChild(logEntry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight; // Auto-scroll to the latest log
    }

    highlightGraph() {
        this.graph.draw(this.ctx);

        // Highlight each node
        this.graph.nodes.forEach(node => {
            this.highlightNode(node);
        });

        // Highlight each edge
        this.graph.edges.forEach((neighbors, node) => {
            neighbors.forEach(({ node: neighbor }) => {
                this.highlightEdge(node, neighbor);
            });
        });
    }

    highlightNode(node) {
        const pos = this.graph.positions[node];
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.graph.radius, 0, 2 * Math.PI);

        // Set the fill color based on whether the node has been visited
        if (this.visitedNodes.has(node)) {
            this.ctx.fillStyle = '#ADD8E6'; // Light blue for visited nodes
        } else if (this.relaxedNodes.has(node)) {
            this.ctx.fillStyle = '#FFD700'; // Gold for relaxed nodes
        } else {
            this.ctx.fillStyle = '#1e1e1e'; // Default color for unvisited nodes
        }

        this.ctx.fill();
        this.ctx.strokeStyle = '#ADD8E6';
        this.ctx.stroke();

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `${this.graph.radius / 2}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node, pos.x, pos.y);
    }

    highlightEdge(fromNode, toNode) {
        const fromPos = this.graph.positions[fromNode];
        const toPos = this.graph.positions[toNode];

        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x, fromPos.y);
        this.ctx.lineTo(toPos.x, toPos.y);
        this.ctx.strokeStyle = '#ADD8E6'; // Light blue for edges
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    updateUI() {
        const distanceArrayElement = document.getElementById('distanceArray');
        const predecessorArrayElement = document.getElementById('predecessorArray');
        distanceArrayElement.innerText = `Distance Array: ${Array.from(this.distanceArray).map(([node, dist]) => `${node}: ${dist}`).join(', ')}`;
        predecessorArrayElement.innerText = `Predecessor Array: ${Array.from(this.predecessorArray).map(([node, pred]) => `${node}: ${pred || '-'}`).join(', ')}`;
    }

    updateQueueUI() {
        const queueElement = document.getElementById('queue');
        // Display the queue showing only the initial priority state
        queueElement.innerText = `Initial Priority Queue: ${this.priorityQueue.queue.map(q => `${q.element}(${q.priority})`).join(' -> ')}`;
    }
    

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Loading the graph from the text format and updating node selector
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
        this.updateNodeSelector(); // Update node selector after loading graph
    }

    updateNodeSelector() {
        const nodeSelector = document.getElementById('nodeSelector');
        nodeSelector.innerHTML = ''; // Clear existing options

        this.graph.nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node;
            option.text = node;
            nodeSelector.appendChild(option);
        });
    }

    // Load a predefined classic example
    loadClassicExample() {
        this.graph.nodes = [];
        this.graph.edges.clear();

        this.graph.addNode('a', 150, 100);
        this.graph.addNode('b', 400, 100);
        this.graph.addNode('c', 150, 450);
        this.graph.addNode('d', 400, 450);
        this.graph.addNode('e', 600, 100);
        this.graph.addNode('f', 600, 450);

        this.graph.addEdge('a', 'b', 1);
        this.graph.addEdge('a', 'c', 2);
        this.graph.addEdge('b', 'd', 2);
        this.graph.addEdge('c', 'd', 3);
        this.graph.addEdge('e', 'd', 4);
        this.graph.addEdge('e', 'f', 5);

        this.graph.draw(this.ctx);
        this.updateNodeSelector(); // Update node selector for the classic example
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
    const graph = new WeightedDirectedGraph(); // Assuming this class exists
    const visualizer = new DijkstraVisualizer(graph, canvas, ctx, 500); // Create visualizer with a default delay

    // Check if startButton exists before adding the event listener
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', () => {
            const startNode = document.getElementById('nodeSelector').value;
            visualizer.startDijkstra(startNode);
        });
    }

    // Handle the delay slider for changing delay times
    const delaySlider = document.getElementById('delaySlider');
    const delayLabel = document.getElementById('delayLabel');
    if (delaySlider) {
        delaySlider.addEventListener('input', function() {
            visualizer.delay = this.value;
            delayLabel.innerText = this.value + "ms";
        });
    }

    // Show the modal when Import/Edit button is clicked
    const importGraphButton = document.getElementById('importGraphButton');
    if (importGraphButton) {
        importGraphButton.addEventListener('click', () => {
            const currentAdjacencyList = graph.getAdjacencyList();
            document.getElementById('graphInput').value = currentAdjacencyList;
            document.getElementById('importGraphModal').style.display = 'flex';
        });
    }

    // Load graph from textarea input when Load Graph button is clicked
    const loadGraphButton = document.getElementById('loadGraphButton');
    if (loadGraphButton) {
        loadGraphButton.addEventListener('click', () => {
            const text = document.getElementById('graphInput').value;
            visualizer.loadGraphFromText(text);
            document.getElementById('importGraphModal').style.display = 'none';
        });
    }

    // Close the modal when the 'X' button is clicked
    const closeModalButton = document.getElementById('closeModalButton');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            document.getElementById('importGraphModal').style.display = 'none';
        });
    }

    // Load a classic example when the button is clicked
    const loadClassicExampleButton = document.getElementById('loadClassicExampleButton');
    if (loadClassicExampleButton) {
        loadClassicExampleButton.addEventListener('click', () => {
            visualizer.loadClassicExample();
        });
    }

    // Use the baseGraph's touch and mouse handlers for dragging nodes
    canvas.addEventListener('mousedown', (event) => graph.handleMouseDown(event, canvas, ctx));
    canvas.addEventListener('mousemove', (event) => graph.handleMouseMove(event, canvas, ctx));
    canvas.addEventListener('mouseup', () => graph.handleMouseUp());

    // Bind touch events for touch interaction
    canvas.addEventListener('touchstart', (event) => graph.handleTouchStart(event, canvas, ctx), { passive: false });
    canvas.addEventListener('touchmove', (event) => graph.handleTouchMove(event, canvas, ctx), { passive: false });
    canvas.addEventListener('touchend', () => graph.handleTouchEnd(), { passive: false });

    // Load a classic graph example on page load
    visualizer.loadClassicExample();
};
