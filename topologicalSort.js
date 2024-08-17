function detectLanguage(text) {
    const hebrewPattern = /[\u0590-\u05FF]/;
    const englishPattern = /[a-zA-Z]/;
    
    if (hebrewPattern.test(text)) {
        return 'rtl';
    } else if (englishPattern.test(text)) {
        return 'ltr';
    } else {
        return 'ltr'; // Default to LTR if no clear pattern
    }
}

window.onload = function() {
    const canvas = document.getElementById('topoCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const ctx = canvas.getContext('2d');
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

    class TopologicalSortVisualizer {
        constructor(graph, canvas, ctx) {
            this.graph = graph;
            this.canvas = canvas;
            this.ctx = ctx;
            this.sortedNodes = [];
            this.indegree = new Map();
            this.queue = [];
            this.visited = new Set();
            this.step = 0;
            this.selectedNode = null;
            this.offsetX = 0;
            this.offsetY = 0;

            this.previousState = [];

            this.initialize();
            this.attachEventListeners();
        }

        initialize() {
            this.graph.nodes.forEach(node => {
                this.indegree.set(node, 0);
            });

            this.graph.edges.forEach((neighbors, node) => {
                neighbors.forEach(neighbor => {
                    this.indegree.set(neighbor, this.indegree.get(neighbor) + 1);
                });
            });

            const initialQueue = new Set();
            this.graph.nodes.forEach(node => {
                if (this.indegree.get(node) === 0) {
                    initialQueue.add(node);
                }
            });

            this.queue = Array.from(initialQueue);
            this.sortedNodes = [];
            this.visited.clear();
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

                this.sortedNodes.forEach(node => this.highlightNode(node));
            }
        }

        handleMouseUp() {
            this.selectedNode = null;
        }

        saveState() {
            this.previousState.push({
                sortedNodes: [...this.sortedNodes],
                queue: [...this.queue],
                indegree: new Map(this.indegree),
                visited: new Set(this.visited)
            });
        }

        undoStep() {
            if (this.previousState.length > 0) {
                const lastState = this.previousState.pop();
                this.sortedNodes = lastState.sortedNodes;
                this.queue = lastState.queue;
                this.indegree = lastState.indegree;
                this.visited = lastState.visited;

                this.graph.draw(this.ctx);
                this.sortedNodes.forEach(node => this.highlightNode(node));
                this.updateUI();
            }
        }

        nextStep() {
            if (this.queue.length > 0) {
                this.saveState();

                const currentNode = this.queue.shift();
                
                if (this.visited.has(currentNode)) {
                    this.updateUI();
                    return;
                }
                
                this.sortedNodes.push(currentNode);
                this.visited.add(currentNode);

                this.graph.edges.get(currentNode).forEach(neighbor => {
                    this.indegree.set(neighbor, this.indegree.get(neighbor) - 1);
                    if (this.indegree.get(neighbor) === 0 && !this.visited.has(neighbor)) {
                        this.queue.push(neighbor);
                    }
                });

                this.highlightNode(currentNode);
                this.updateUI();
            } else {
                const hasCycle = this.graph.nodes.some(node => this.indegree.get(node) > 0);
                if (hasCycle) {
                    alert("Cycle detected! The graph is not a DAG.");
                }
            }
        }

        highlightNode(node) {

            const pos = this.graph.positions[node];
            const nodeNameLength = node.length;
            let fontSize;
            if (nodeNameLength <= 4) {
                fontSize = this.graph.radius / 2;  // Larger font for short names
            } else if (nodeNameLength <= 8) {
                fontSize = this.graph.radius / 2.6;  //
            } else if (nodeNameLength <= 10) {
                fontSize = this.graph.radius / 3.5;  // 
            }
            else{
                fontSize = this.graph.radius / 5.5;  

            }

            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.graph.radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'yellow';
            this.ctx.fill();
            this.ctx.strokeStyle = 'orange';
            this.ctx.stroke();

            this.ctx.fillStyle = '#1e1e1e';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.font = `${fontSize}px Arial`;
            this.ctx.fillText(node, pos.x, pos.y);
        }

        updateUI() {
            document.getElementById('sortedNodesList').innerText = `Sorted Nodes: ${this.sortedNodes.join(' -> ')}`;
            document.getElementById('queueList').innerText = `Queue: ${this.queue.join(' -> ')}`;
            
            const indegreeTableRow = document.getElementById('indegreeTableRow');
            const indegreeTableHeaderRow = document.getElementById('indegreeTableHeaderRow');
            
            indegreeTableRow.innerHTML = '';
            indegreeTableHeaderRow.innerHTML = '';
        
            Array.from(this.indegree.keys()).forEach(node => {
                const headerCell = document.createElement('th');
                headerCell.innerText = node;
        
                // Dynamically adjust font size based on node name length
                console.log(node.length)
                if (node.length > 4) {
                    headerCell.style.fontSize = '0.4rem'; // Smaller font for longer names
                } else if (node.length > 6) {
                    headerCell.style.fontSize = '0.5rem'; // Even smaller for very long names
                } else {
                    headerCell.style.fontSize = '0.6rem'; // Default size for shorter names
                }
        
                indegreeTableHeaderRow.appendChild(headerCell);
            });
        
            Array.from(this.indegree.entries()).forEach(([node, degree]) => {
                const cell = document.createElement('td');
                cell.innerText = degree;
                cell.style.padding = '5px 10px';
                indegreeTableRow.appendChild(cell);
            });
        }
        
        
        
    }

    let visualizer;
    function loadGraphFromText(text) {
        graph.nodes = [];
        graph.edges.clear();
    
        const lines = text.split('\n');
        lines.forEach(line => {
            // Trim the line to remove any leading or trailing whitespace
            const trimmedLine = line.trim();
    
            // Ignore the line if it is empty (contains no characters)
            if (trimmedLine.length === 0) {
                return;
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
    
        if (visualizer) {
            visualizer.graph = graph;
            visualizer.initialize();
        } else {
            visualizer = new TopologicalSortVisualizer(graph, canvas, ctx);
            visualizer.initialize();
        }
    }
    

    document.getElementById('startButton').addEventListener('click', () => {
        visualizer = new TopologicalSortVisualizer(graph, canvas, ctx);
        visualizer.initialize();
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        if (visualizer) {
            visualizer.nextStep();
        } else {
            console.error('Visualizer not initialized. Please start the visualization first.');
        }
    });

    document.getElementById('undoButton').addEventListener('click', () => {
        if (visualizer) {
            visualizer.undoStep();
        }
    });

    function resizeCanvas(factor) {
        const newWidth = canvas.width + factor;
        const newHeight = canvas.height + factor;

        if (newWidth >= 400 && newHeight >= 300 && newWidth <= 1200 && newHeight <= 900) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            if (visualizer) {
                visualizer.graph.draw(ctx);
                visualizer.sortedNodes.forEach(node => visualizer.highlightNode(node));
            }
        }
    }

    document.getElementById('printDirectedAdjListButton').addEventListener('click', () => {
        const adjacencyList = graph.getAdjacencyList();
        document.getElementById('directedAdjacencyList').innerText = adjacencyList;
    });

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
        const currentAdjacencyList = graph.getAdjacencyList();
        graphInput.value = currentAdjacencyList;
        const direction = detectLanguage(currentAdjacencyList);
        toggleTextDirection(direction);
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
    loadClassicExample();

    const rtlTextButton = document.getElementById('rtlTextButton');
    const ltrTextButton = document.getElementById('ltrTextButton');

    function toggleTextDirection(direction) {
        if (direction === 'rtl') {
            graphInput.style.direction = 'rtl';
            rtlTextButton.classList.add('pressed');
            ltrTextButton.classList.remove('pressed');
        } else {
            graphInput.style.direction = 'ltr';
            rtlTextButton.classList.remove('pressed');
            ltrTextButton.classList.add('pressed');
        }
    }

    rtlTextButton.addEventListener('click', () => toggleTextDirection('rtl'));
    ltrTextButton.addEventListener('click', () => toggleTextDirection('ltr'));

    let graphURL = 'https://raw.githubusercontent.com/renanbazinin/Graphs-For-Algorithms/main/graphInJson/vacation.json'; // Replace with your URL
    document.getElementById('loadFromURLButton').addEventListener('click', () => loadGraphFromURL(graphURL));

    async function loadGraphFromURL(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
    
            // Clear the existing graph
            graph.nodes = [];
            graph.edges.clear();
    
            // Add nodes
            data.nodes.forEach(node => {
                graph.addNode(node.name, node.x, node.y);
            });
    
            // Add edges
            data.edges.forEach(edge => {
                graph.addEdge(edge.from, edge.to);
            });
    
            // Redraw the graph
            visualizer = new TopologicalSortVisualizer(graph, canvas, ctx);
            visualizer.initialize();
    
            console.log('Graph loaded successfully from URL');
        } catch (error) {
            console.error('Error loading graph from URL:', error);
        }
    }


    document.getElementById('loadFromURLButton').addEventListener('click', async () => {
        // Prompt the user for the URL
        let graphURL = prompt("Please enter the URL of the graph JSON:");
    
        if (graphURL) {
            try {
                // Fetch the JSON data from the URL
                let response = await fetch(graphURL);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                let graphData = await response.json();
    
                // Ensure the graphData has the necessary structure
                if (graphData.nodes && graphData.edges) {
                    // Clear the existing graph
                    graph.clear();
    
                    // Add nodes to the graph
                    graphData.nodes.forEach(node => {
                        graph.addNode(node.name, node.x, node.y);
                    });
    
                    // Add edges to the graph
                    graphData.edges.forEach(edge => {
                        graph.addEdge(edge.from, edge.to);
                    });
    
                    // Reinitialize the visualizer with the new graph data
                    if (visualizer) {
                        visualizer.graph = graph;
                        visualizer.initialize();
                    } else {
                        visualizer = new TopologicalSortVisualizer(graph, canvas, ctx);
                        visualizer.initialize();
                    }
    
                    alert("Graph loaded successfully!");
                } else {
                    throw new Error('Invalid graph format');
                }
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
                alert('Failed to load graph. Please check the URL and try again.');
            }
        }
    });
    
};

