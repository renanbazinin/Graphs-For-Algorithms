window.onload = function() {
    // Get the canvas and context
    const canvas = document.getElementById('topoCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Initialize the graph
    const graph = new DirectedGraph();

    // Add nodes and edges
    graph.addNode('גרביים', 600, 100);
    graph.addNode('נעליים', 400, 150);
    graph.addNode('תחתונים', 200, 100);
    graph.addNode('מכנסיים', 200, 250);
    graph.addNode('חולצה', 400, 300);
    graph.addNode('עניבה', 600, 300);
    graph.addNode('חגורה', 200, 400);
    graph.addNode('מעיל', 600, 500);
    graph.addNode('שעון', 50, 450);

    graph.addEdge('גרביים', 'נעליים');
    graph.addEdge('תחתונים', 'מכנסיים');
    graph.addEdge('מכנסיים', 'נעליים');
    graph.addEdge('חולצה', 'עניבה');
    graph.addEdge('מכנסיים', 'חגורה');
    graph.addEdge('חולצה', 'חגורה');
    graph.addEdge('חגורה', 'מעיל');
    graph.addEdge('עניבה', 'מעיל');
    graph.addEdge('שעון', 'חגורה');

    // Topological sort visualizer class
    class TopologicalSortVisualizer {
        constructor(graph, canvas, ctx) {
            this.graph = graph;
            this.canvas = canvas;
            this.ctx = ctx;
            this.sortedNodes = [];
            this.indegree = new Map();
            this.queue = [];
            this.visited = new Set(); // Track visited nodes
            this.step = 0;
            this.selectedNode = null;
            this.offsetX = 0;
            this.offsetY = 0;

            this.initialize();
            this.attachEventListeners();
        }

        initialize() {
            // Initialize indegree for all nodes
            this.graph.nodes.forEach(node => {
                this.indegree.set(node, 0);
            });
        
            // Calculate indegree for each node
            this.graph.edges.forEach((neighbors, node) => {
                neighbors.forEach(neighbor => {
                    this.indegree.set(neighbor, this.indegree.get(neighbor) + 1);
                });
            });
        
            // Log indegree of each node
            console.log('Indegrees:', Array.from(this.indegree.entries()));
        
            // Initialize queue with nodes that have indegree 0
            const initialQueue = new Set(); // Use a Set to avoid duplicates
            this.graph.nodes.forEach(node => {
                if (this.indegree.get(node) === 0) {
                    initialQueue.add(node); // Add to the set
                }
            });
        
            // Convert Set to Array and assign to the queue
            this.queue = Array.from(initialQueue);
        
            // Log initial queue
            console.log('Initial Queue:', this.queue);
        
            this.sortedNodes = [];
            this.visited.clear(); // Clear visited set for actual processing
            this.updateUI();
            this.graph.draw(this.ctx);
        }
        

        attachEventListeners() {
            this.canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
            this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
            this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
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
                this.graph.draw(this.ctx);

                // Re-highlight sorted nodes
                this.sortedNodes.forEach(node => this.highlightNode(node));
            }
        }

        handleMouseUp() {
            this.selectedNode = null;
        }

        nextStep() {
            if (this.queue.length > 0) {
                const currentNode = this.queue.shift();
                
                // If this node has already been processed, skip it
                if (this.visited.has(currentNode)) {
                    this.updateUI();
                    return;
                }
                
                this.sortedNodes.push(currentNode);
                this.visited.add(currentNode); // Mark this node as visited
        
                this.graph.edges.get(currentNode).forEach(neighbor => {
                    this.indegree.set(neighbor, this.indegree.get(neighbor) - 1);
                    if (this.indegree.get(neighbor) === 0 && !this.visited.has(neighbor)) {
                        this.queue.push(neighbor);
                    }
                });
        
                this.highlightNode(currentNode);
                this.updateUI();
            } else {
                // Check for cycles: if any node still has indegree > 0, there's a cycle
                const hasCycle = this.graph.nodes.some(node => this.indegree.get(node) > 0);
                if (hasCycle) {
                    alert("Cycle detected! The graph is not a DAG.");
                }
            }
        }
        

        highlightNode(node) {
            const pos = this.graph.positions[node];
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.graph.radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'yellow';
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.fillStyle = '#1e1e1e';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.font = `${this.graph.radius / 2}px Arial`;
            this.ctx.fillText(node, pos.x, pos.y);
        }
        updateUI() {
            // Update the sortedNodes list with -> between nodes
            document.getElementById('sortedNodesList').innerText = `Sorted Nodes: ${this.sortedNodes.join(' -> ')}`;
        
            // Update the queue with -> between nodes
            document.getElementById('queueList').innerText = `Queue: ${this.queue.join(' -> ')}`;
        
            // Get the table row element
            const indegreeTableRow = document.getElementById('indegreeTableRow');

            // Clear the current row content
            indegreeTableRow.innerHTML = '';

            // Populate the row with the indegree entries
            Array.from(this.indegree.entries()).forEach(([node, degree]) => {
                const cell = document.createElement('td');
                cell.innerText = `${node}\n ${degree}`;
                cell.style.padding = '5px 10px';
                indegreeTableRow.appendChild(cell);
            });
        }
        
    }

    let visualizer;
    function loadGraphFromText(text) {
        graph.nodes = []; // Clear the existing graph
        graph.edges.clear();

        const lines = text.split('\n');
        lines.forEach(line => {
            const [node, neighbors] = line.split('->').map(part => part.trim());
            graph.addNode(node);

            if (neighbors) {
                neighbors.split(',').forEach(neighbor => {
                    graph.addNode(neighbor.trim());
                    graph.addEdge(node, neighbor.trim());
                });
            }
        });

        if (visualizer) {
            visualizer.graph = graph; // Update the graph in the visualizer
            visualizer.initialize();
        } else {
            visualizer = new TopologicalSortVisualizer(graph, canvas, ctx);
            visualizer.initialize();
        }
    }

    // Button to start the graph visualization
    document.getElementById('startButton').addEventListener('click', () => {
        visualizer = new TopologicalSortVisualizer(graph, canvas, ctx);
        visualizer.initialize();
    });

    // Event listener for stepping through the topological sort
    document.getElementById('nextButton').addEventListener('click', () => {
        if (visualizer) {
            visualizer.nextStep();
        } else {
            console.error('Visualizer not initialized. Please start the visualization first.');
        }
    });

    function resizeCanvas(factor) {
        const newWidth = canvas.width + factor;
        const newHeight = canvas.height + factor;

        // Set minimum and maximum sizes for the canvas
        if (newWidth >= 400 && newHeight >= 300 && newWidth <= 1200 && newHeight <= 900) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            if (visualizer) {
                visualizer.graph.draw(ctx);
                visualizer.sortedNodes.forEach(node => visualizer.highlightNode(node));
            }
        }
    }
    function printDirectedAdjacencyList() {
        const adjacencyList = graph.getAdjacencyList(); // Use the method from your DirectedGraph class
        document.getElementById('directedAdjacencyList').innerText = adjacencyList;
    }
    document.getElementById('printDirectedAdjListButton').addEventListener('click', printDirectedAdjacencyList);

    document.getElementById('moreSpaceButton').addEventListener('click', () => resizeCanvas(100));
    document.getElementById('lessSpaceButton').addEventListener('click', () => resizeCanvas(-100));

    function toggleDirection(direction) {
        const rtlButton = document.getElementById('rtlButton');
        const ltrButton = document.getElementById('ltrButton');
        const directedAdjacencyList = document.getElementById('directedAdjacencyList');

        if (direction === 'rtl') {
            directedAdjacencyList.style.direction = 'rtl';
            rtlButton.classList.add('pressed');
            ltrButton.classList.remove('pressed');
        } else {
            directedAdjacencyList.style.direction = 'ltr';
            rtlButton.classList.remove('pressed');
            ltrButton.classList.add('pressed');
        }
    }

    const importGraphButton = document.getElementById('importGraphButton');
    const importGraphModal = document.getElementById('importGraphModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const loadGraphButton = document.getElementById('loadGraphButton');
    const graphInput = document.getElementById('graphInput');

    importGraphButton.addEventListener('click', () => {
        importGraphModal.style.display = 'flex';
    });

    closeModalButton.addEventListener('click', () => {
        importGraphModal.style.display = 'none';
    });

    loadGraphButton.addEventListener('click', () => {
        const text = graphInput.value;
        loadGraphFromText(text);
        importGraphModal.style.display = 'none';
    });

    document.getElementById('rtlButton').addEventListener('click', () => toggleDirection('rtl'));
    document.getElementById('ltrButton').addEventListener('click', () => toggleDirection('ltr'));

    canvas.addEventListener('touchstart', (event) => graph.handleTouchStart(event, canvas, ctx), { passive: false });
    canvas.addEventListener('touchmove', (event) => graph.handleTouchMove(event, canvas, ctx), { passive: false });
    canvas.addEventListener('touchend', (event) => graph.handleTouchEnd(event, canvas, ctx), { passive: false });

    // Also attach mouse event listeners if not already done
    canvas.addEventListener('mousedown', (event) => graph.handleMouseDown(event, canvas, ctx));
    canvas.addEventListener('mousemove', (event) => graph.handleMouseMove(event, canvas, ctx));
    canvas.addEventListener('mouseup', () => graph.handleMouseUp());

    window.addEventListener('click', (event) => {
        if (event.target == importGraphModal) {
            importGraphModal.style.display = 'none';
        }
    });
    document.getElementById('importClassicExampleButton').addEventListener('click', loadClassicExample);

    function loadClassicExample() {
        const classicExample = `
        גרביים -> נעליים
        תחתונים -> מכנסיים
        מכנסיים -> נעליים, חגורה
        חולצה -> עניבה, חגורה
        עניבה -> מעיל
        חגורה -> מעיל
        שעון -> חגורה
        `;
        loadGraphFromText(classicExample.trim());
    }

};
