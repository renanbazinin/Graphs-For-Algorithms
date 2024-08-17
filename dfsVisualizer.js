class DFSVisualizer {
    constructor(graph, canvas, ctx, delay = 500) {
        this.graph = graph;
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = new Map(); // Node colors (white, gray, black)
        this.delay = delay; // Delay in milliseconds
        this.visitedNodes = []; // To store the visited nodes in sequence
        this.finishedNodes = []; // To store the finished nodes in sequence


        this.edgeTypes = new Map(); // Store the edge types with colors
        this.selectedNode = null; // To keep track of the node being moved
        this.offsetX = 0;
        this.offsetY = 0;
    }
    async startDFS() {
        // Initialize al  async startDFS() {
        // Initialize all nodes to white (unprocessed)
        this.graph.nodes.forEach(node => {
            this.colors.set(node, 'white');
        });

        this.edgeTypes.clear(); // Clear previous edge types
        this.finishedNodes = []; // Reset finished nodes

        this.visitedNodes = []; // Reset visited nodes
        this.clearBracketLinearTable(); // Clear the table for a new visualization

        // Start DFS from each unvisited node
        for (let node of this.graph.nodes) {
            if (this.colors.get(node) === 'white') {
                await this.dfsVisit(node);
            }
        }

        this.highlightGraph(); // Highlight the final graph with all edges colored
    }
    resetVisualization() {
        // Reset all state variables
        this.colors.clear();
        this.visitedNodes = [];
        this.finishedNodes = [];
        this.edgeTypes.clear();

        // Clear UI elements
        this.clearBracketLinearTable();
        this.updateUI();

        // Redraw the graph
        this.graph.draw(this.ctx);
    }
    async dfsVisit(node) {
        this.colors.set(node, 'gray'); // Mark the node as gray (in progress)
        this.visitedNodes.push(node); // Add node to visited nodes list
    
        this.addBracketToLinearTable(node, "(");
        this.updateUI();
        this.highlightGraph();
        await this.sleep(this.delay);
    
        const neighbors = this.graph.edges.get(node) || [];
        for (const neighbor of neighbors) {
            if (this.colors.get(neighbor) === 'white') {
                this.edgeTypes.set(`${node}->${neighbor}`, 'tree'); // Tree Edge
                await this.dfsVisit(neighbor);
            } else if (this.colors.get(neighbor) === 'gray') {
                this.edgeTypes.set(`${node}->${neighbor}`, 'back'); // Back Edge
            } else if (this.colors.get(neighbor) === 'black') {
                // If the neighbor is already finished and it is a descendant of the current node, classify it as a forward edge
                if (this.visitedNodes.includes(neighbor)) {
                    this.edgeTypes.set(`${node}->${neighbor}`, 'forward'); // Forward Edge
                } else {
                    this.edgeTypes.set(`${node}->${neighbor}`, 'cross'); // Cross Edge
                }
            }
            this.highlightGraph();
            await this.sleep(this.delay);
        }
        
    
        this.colors.set(node, 'black'); // Mark the node as black (finished)
        this.finishedNodes.push(node); // Add node to finished nodes list

        this.addBracketToLinearTable(node, ")");
        this.updateUI();
        this.highlightGraph();
        await this.sleep(this.delay);
    }
    

    highlightGraph() {
        this.graph.draw(this.ctx);

        // Redraw each edge with its corresponding type and color
        this.graph.edges.forEach((neighbors, node) => {
            neighbors.forEach(neighbor => {
                const edgeType = this.edgeTypes.get(`${node}->${neighbor}`);
                this.highlightEdge(node, neighbor, edgeType);
            });
        });

        // Redraw each node with its current color
        this.graph.nodes.forEach(node => {
            this.highlightNode(node);
        });
    }

    highlightNode(node) {
        const pos = this.graph.positions[node];
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.graph.radius, 0, 2 * Math.PI);
    
        // Set fill color based on the node's current color state
        this.ctx.fillStyle = this.colors.get(node) || '#ffffff'; // Default to white if color is not set
    
        this.ctx.fill();
        this.ctx.strokeStyle = 'orange';
        this.ctx.stroke();
    
        this.ctx.fillStyle = '#ef2e24';

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `${this.graph.radius / 2}px Arial`;
    
        this.ctx.fillText(node, pos.x, pos.y);
    }

    highlightEdge(fromNode, toNode, edgeType) {
        const fromPos = this.graph.positions[fromNode];
        const toPos = this.graph.positions[toNode];

        let color = '#000000'; // Default to black
        if (edgeType === 'tree') {
            color = 'green';
        } else if (edgeType === 'back') {
            color = 'red';
        } else if (edgeType === 'forward') {
            color = 'blue';
        } else if (edgeType === 'cross') {
            color = 'purple';
        }

        this.ctx.beginPath();
        this.ctx.moveTo(fromPos.x, fromPos.y);
        this.ctx.lineTo(toPos.x, toPos.y);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
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
        const finishedNodesList = document.getElementById('finishedNodesList');

        visitedNodesList.innerText = `Visited Nodes: ${this.visitedNodes.join(' -> ')}`;
        finishedNodesList.innerText = `Finished Nodes: ${this.finishedNodes.join(' -> ')}`;

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
        this.ctx.fillStyle =  '#ffffff'; // Default to white if color is not set

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
        this.ctx.fillStyle =  '#ffffff'; // Default to white if color is not set

    }

    resizeCanvas(factor) {
        const newWidth = this.canvas.width + factor;
        const newHeight = this.canvas.height + factor;

        if (newWidth >= 400 && newHeight >= 300 && newWidth <= 1200 && newHeight <= 900) {
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
            this.graph.draw(this.ctx);
            this.highlightGraph();
        }
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

    // Method to handle mouse move event
        handleMouseMove(event) {
            if (this.selectedNode) {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left + this.offsetX;
                const y = event.clientY - rect.top + this.offsetY;

                this.graph.positions[this.selectedNode] = { x, y };
                this.graph.draw(this.ctx);

                // Redraw all nodes without changing their color state
                for (const node of this.graph.nodes) {
                    this.highlightNode(node);
                }
            }
        }

    // Method to handle mouse up event
    handleMouseUp() {
        this.selectedNode = null;
    }

    // Method to handle touch start event
    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: this.canvas,
        });
    }

    // Method to handle touch move event
    handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: this.canvas,
        });
    }

    // Method to handle touch end event
    handleTouchEnd() {
        this.handleMouseUp();
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

    canvas.addEventListener('mousedown', (event) => visualizer.handleMouseDown(event));
    canvas.addEventListener('mousemove', (event) => visualizer.handleMouseMove(event));
    canvas.addEventListener('mouseup', () => visualizer.handleMouseUp());

    // Bind touch events
    canvas.addEventListener('touchstart', (event) => visualizer.handleTouchStart(event), { passive: false });
    canvas.addEventListener('touchmove', (event) => visualizer.handleTouchMove(event), { passive: false });
    canvas.addEventListener('touchend', () => visualizer.handleTouchEnd(), { passive: false });


    document.getElementById('moreSpaceButton').addEventListener('click', () => {
        visualizer.resizeCanvas(100);
    });

    document.getElementById('lessSpaceButton').addEventListener('click', () => {
        visualizer.resizeCanvas(-100);
    });

    visualizer.loadClassicExample()
};



