class BFSVisualizer {
    constructor(graph, canvas, ctx) {
        this.graph = graph;
        this.canvas = canvas;
        this.ctx = ctx;
        this.distanceArray = [];
        this.queue = [];
    }

    initialize(startNode) {
        // Reset state
        this.distanceArray = [];
        this.queue = [];
        
        // Initialize distances
        this.graph.nodes.forEach(node => {
            this.distanceArray[node] = Infinity;
        });

        this.distanceArray[startNode] = 0;
        this.queue.push(startNode);

        this.updateUI();
        this.highlightGraph();
    }

    startBFS() {
        while (this.queue.length > 0) {
            const u = this.queue.shift();
            const neighbors = this.graph.edges.get(u) || [];

            neighbors.forEach(v => {
                if (this.distanceArray[v] === Infinity) {
                    this.distanceArray[v] = this.distanceArray[u] + 1;
                    this.queue.push(v);
                }
            });

            this.updateUI();
            this.highlightGraph();
        }
    }

    updateUI() {
        const distanceArrayElement = document.getElementById('distanceArray');
        const distanceArrayText = Object.entries(this.distanceArray)
            .map(([node, distance]) => `${node}: ${distance}`)
            .join(', ');
        distanceArrayElement.innerText = `Distance Array: ${distanceArrayText}`;
    }

    highlightGraph() {
        this.graph.draw(this.ctx);

        // Redraw each node with its distance
        this.graph.nodes.forEach(node => {
            this.highlightNode(node);
        });
    }

    highlightNode(node) {
        const pos = this.graph.positions[node];
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.graph.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'yellow';
        this.ctx.fill();
        this.ctx.strokeStyle = 'orange';
        this.ctx.stroke();

        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `${this.graph.radius / 2}px Arial`;
        this.ctx.fillText(node, pos.x, pos.y);
        //this.ctx.fillText(this.distanceArray[node], pos.x, pos.y + this.graph.radius); // Draw distance below the node
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
        visualizer.startBFS();
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        visualizer.initialize(document.getElementById('nodeSelector').value);
    });

    document.getElementById('importGraphButton').addEventListener('click', () => {
        const currentAdjacencyList = graph.getAdjacencyList();
        document.getElementById('graphInput').value = currentAdjacencyList;
        document.getElementById('importGraphModal').style.display = 'flex';
    });

    document.getElementById('loadGraphButton').addEventListener('click', () => {
        const text = document.getElementById('graphInput').value;
        graph.loadFromText(text);
        visualizer.initialize(document.getElementById('nodeSelector').value);
        document.getElementById('importGraphModal').style.display = 'none';
    });

    document.getElementById('closeModalButton').addEventListener('click', () => {
        document.getElementById('importGraphModal').style.display = 'none';
    });

    loadClassicExample();
    visualizer.initialize('S');

    function loadClassicExample() {
        // Clear any existing nodes and edges in the graph
        graph.clear();
    
        // Add nodes
        graph.addNode('S', 150, 100);
        graph.addNode('A', 300, 100);
        graph.addNode('B', 150, 400);
        graph.addNode('C', 300, 400);
        graph.addNode('D', 450, 100);
        graph.addNode('E', 450, 400);
    
        // Add edges
        graph.addEdge('S', 'A');
        graph.addEdge('S', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('B', 'C');
        graph.addEdge('A', 'D');
        graph.addEdge('C', 'E');
        graph.addEdge('D', 'E');
    
        // Draw the graph on the canvas
        graph.draw(ctx);
    
        // Populate the node selector dropdown
        const nodeSelector = document.getElementById('nodeSelector');
        nodeSelector.innerHTML = ''; // Clear existing options
        graph.nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node;
            option.text = node;
            nodeSelector.appendChild(option);
        });
    }
    
};

