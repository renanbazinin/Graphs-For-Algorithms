class DFSVisualizer {
    constructor(graph, canvas, ctx, delay = 500) {
        this.graph = graph;
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = new Map(); // Node colors (white, gray, black)
        this.delay = delay; // Delay in milliseconds
        this.visitedNodes = []; // To store the visited nodes in sequence
    }

    async startDFS() {
        // Initialize all nodes to white (unprocessed)
        this.graph.nodes.forEach(node => {
            this.colors.set(node, 'white');
        });

        this.visitedNodes = []; // Reset visited nodes

        this.clearBracketLinearTable(); // Clear the table for a new visualization

        // Start DFS from each unvisited node
        for (let node of this.graph.nodes) {
            if (this.colors.get(node) === 'white') {
                await this.visitNode(node);
            }
        }
    }

    async visitNode(node) {
        // Mark the node as gray (in progress)
        this.colors.set(node, 'gray');
        this.visitedNodes.push(node); // Add node to visited nodes list

        // Add an opening bracket for the node
        this.addBracketToLinearTable(node, "(");
        this.updateUI();
        this.highlightGraph();
        await this.sleep(this.delay);

        const neighbors = this.graph.edges.get(node) || [];
        for (const neighbor of neighbors) {
            if (this.colors.get(neighbor) === 'white') {
                await this.visitNode(neighbor);
            }
        }

        // Mark the node as black (finished)
        this.colors.set(node, 'black');

        // Add a closing bracket for the node
        this.addBracketToLinearTable(node, ")");
        this.updateUI();
        this.highlightGraph();
        await this.sleep(this.delay);
    }

    highlightGraph() {
        this.graph.draw(this.ctx);

        // Redraw each node with its current color
        this.graph.nodes.forEach(node => {
            this.highlightNode(node);
        });
    }

    highlightNode(node) {
        const pos = this.graph.positions[node];
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.graph.radius, 0, 2 * Math.PI);

        // Set fill color based on the node's state
        this.ctx.fillStyle = this.colors.get(node) === 'white' ? '#ffffff' :
                             this.colors.get(node) === 'gray' ? '#808080' : // Gray
                             '#000000'; // Black for finished

        this.ctx.fill();
        this.ctx.strokeStyle = 'orange';
        this.ctx.stroke();

        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `${this.graph.radius / 2}px Arial`;
        this.ctx.fillText(node, pos.x, pos.y);
    }

    clearBracketLinearTable() {
        const bracketLinearRowBrackets = document.getElementById('bracketLinearRowBrackets');
        const bracketLinearRowNodes = document.getElementById('bracketLinearRowNodes');
        bracketLinearRowBrackets.innerHTML = ''; // Clear the brackets row
        bracketLinearRowNodes.innerHTML = ''; // Clear the nodes row
    }

    addBracketToLinearTable(node, bracket) {
        const bracketLinearRowBrackets = document.getElementById('bracketLinearRowBrackets');
        const bracketLinearRowNodes = document.getElementById('bracketLinearRowNodes');

        // Create a new table cell for the bracket
        const tdBracket = document.createElement('td');
        tdBracket.innerText = bracket;
        bracketLinearRowBrackets.appendChild(tdBracket);

        // Create a new table cell for the node name
        const tdNode = document.createElement('td');
        tdNode.innerText = node;
        bracketLinearRowNodes.appendChild(tdNode);
    }

    updateUI() {
        const visitedNodesList = document.getElementById('visitedNodesList');

        visitedNodesList.innerText = `Visited Nodes: ${this.visitedNodes.join(' -> ')}`;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
    }

    loadClassicExample() {
        this.graph.nodes = [];
        this.graph.edges.clear();

        // Load the classic example graph
        this.graph.addNode('a', 150, 100);
        this.graph.addNode('b', 300, 100);
        this.graph.addNode('c', 150, 250);
        this.graph.addNode('d', 300, 250);
        this.graph.addNode('e', 450, 100);
        this.graph.addNode('f', 450, 250);

        this.graph.addEdge('a', 'b');
        this.graph.addEdge('a', 'c');
        this.graph.addEdge('b', 'd');
        this.graph.addEdge('c', 'd');
        this.graph.addEdge('e', 'd');
        this.graph.addEdge('e', 'f');

        this.graph.draw(this.ctx);
    }
}

window.onload = function() {
    const canvas = document.getElementById('dfsCanvas');
    const ctx = canvas.getContext('2d');
    const graph = new DirectedGraph();

    let visualizer = new DFSVisualizer(graph, canvas, ctx, 500);

    document.getElementById('startButton').addEventListener('click', () => {
        visualizer.startDFS();
    });

    // Handle the delay slider
    const delaySlider = document.getElementById('delaySlider');
    const delayLabel = document.getElementById('delayLabel');
    delaySlider.addEventListener('input', function() {
        visualizer.delay = this.value;
        delayLabel.innerText = this.value + "ms";
    });

    // Handle Import or Edit Graph
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

    // Handle Load Classic Example
    document.getElementById('loadClassicExampleButton').addEventListener('click', () => {
        visualizer.loadClassicExample();
    });
};
