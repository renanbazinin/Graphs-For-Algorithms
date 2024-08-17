class DirectedGraph extends BaseGraph {
    addEdge(node1, node2) {
        if (node1 !== node2 && this.edges.has(node1) && this.edges.has(node2) && !this.edges.get(node1).includes(node2)) {
            this.edges.get(node1).push(node2);
        }
    }

    draw(ctx) {
        const radius = this.radius;  // Use this.radius
        const arrowLength = 20; // Adjust the length of the arrowhead

        this.nodes.forEach((node, index) => {
            if (!this.positions[node]) {
                const angle = (index / this.nodes.length) * 2 * Math.PI;
                const x = 400 + Math.cos(angle) * 200;
                const y = 300 + Math.sin(angle) * 200;
                this.positions[node] = { x, y };
            }
        });

        // Clear the entire canvas dynamically based on its current size
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.strokeStyle = '#FFD700';
        ctx.fillStyle = '#e0e0e0';
        ctx.lineWidth = 4;
        
        const drawArrowhead = (from, to) => {
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const arrowAngle = Math.PI / 6;
            const x = to.x - radius * Math.cos(angle);
            const y = to.y - radius * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - arrowLength * Math.cos(angle - arrowAngle), y - arrowLength * Math.sin(angle - arrowAngle));
            ctx.lineTo(x - arrowLength * Math.cos(angle + arrowAngle), y - arrowLength * Math.sin(angle + arrowAngle));
            ctx.lineTo(x, y);
            ctx.fill();
        };

        const drawnEdges = new Set();

        this.edges.forEach((neighbors, node) => {
            neighbors.forEach(neighbor => {
                const startPos = this.positions[node];
                const endPos = this.positions[neighbor];
                const edgeKey = `${node}-${neighbor}`;
                const reverseEdgeKey = `${neighbor}-${node}`;

                if (!drawnEdges.has(edgeKey)) {
                    if (this.edges.get(neighbor).includes(node)) {
                        // Draw top curved line for mutual edge
                        ctx.beginPath();
                        ctx.moveTo(startPos.x, startPos.y);
                        ctx.quadraticCurveTo((startPos.x + endPos.x) / 2, (startPos.y + endPos.y) / 2 - 40, endPos.x, endPos.y);
                        ctx.stroke();
                        drawArrowhead({ x: (startPos.x + endPos.x) / 2, y: (startPos.y + endPos.y) / 2 - 40 }, endPos);

                        // Draw bottom curved line for mutual edge
                        ctx.beginPath();
                        ctx.moveTo(endPos.x, endPos.y);
                        ctx.quadraticCurveTo((startPos.x + endPos.x) / 2, (startPos.y + endPos.y) / 2 + 40, startPos.x, startPos.y);
                        ctx.stroke();
                        drawArrowhead({ x: (startPos.x + endPos.x) / 2, y: (startPos.y + endPos.y) / 2 + 40 }, startPos);

                        drawnEdges.add(edgeKey);
                        drawnEdges.add(reverseEdgeKey);
                    } else {
                        // Draw straight line for single edge
                        ctx.beginPath();
                        ctx.moveTo(startPos.x, startPos.y);
                        ctx.lineTo(endPos.x, endPos.y);
                        ctx.stroke();
                        drawArrowhead(startPos, endPos);

                        drawnEdges.add(edgeKey);
                    }
                }
            });
        });

        this.nodes.forEach(node => {
            const pos = this.positions[node];
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#1e1e1e';
            ctx.fill();
            ctx.strokeStyle = '#ADD8E6'; // Set outline color to light blue
            ctx.stroke();

            let fontSize = this.radius / 1.5;
            ctx.font = `${fontSize}px Arial`;
            let textWidth = ctx.measureText(node).width;
            while (textWidth > this.radius * 1.5) { // Adjust threshold as needed
                fontSize -= 1;
                ctx.font = `${fontSize}px Arial`;
                textWidth = ctx.measureText(node).width;
            }

            ctx.fillStyle = '#e0e0e0';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node, pos.x, pos.y);
        });

        return this.positions;
    }
    clear() {
        this.nodes = [];
        this.edges.clear();
        this.positions = {};
    }
}

const directedGraph = new DirectedGraph();

const directedCanvas = document.getElementById('directedCanvas');
const directedCtx = directedCanvas.getContext('2d');

directedCanvas.addEventListener('mousedown', (event) => directedGraph.handleMouseDown(event, directedCanvas, directedCtx));
directedCanvas.addEventListener('mousemove', (event) => directedGraph.handleMouseMove(event, directedCanvas, directedCtx));
directedCanvas.addEventListener('mouseup', () => directedGraph.handleMouseUp());
directedCanvas.addEventListener('dblclick', (event) => directedGraph.handleDoubleClick(event, directedCanvas, directedCtx));

directedCanvas.addEventListener('touchstart', (event) => directedGraph.handleTouchStart(event, directedCanvas, directedCtx));
directedCanvas.addEventListener('touchmove', (event) => directedGraph.handleTouchMove(event, directedCanvas, directedCtx));
directedCanvas.addEventListener('touchend', (event) => directedGraph.handleTouchEnd(event, directedCanvas, directedCtx));

function addDirectedNode() {
    const nodeInput = document.getElementById('directedNodeInput').value.trim().toLowerCase();;
    if (nodeInput) {
        directedGraph.addNode(nodeInput);
        directedGraph.draw(directedCtx);
        document.getElementById('directedNodeInput').value = '';
    }
}

function addDirectedEdge() {
    const node1 = document.getElementById('directedEdgeNode1').value.trim().toLowerCase();;
    const node2 = document.getElementById('directedEdgeNode2').value.trim().toLowerCase();;
    if (node1 && node2) {
        directedGraph.addEdge(node1, node2);
        directedGraph.draw(directedCtx);
        document.getElementById('directedEdgeNode1').value = '';
        document.getElementById('directedEdgeNode2').value = '';
    }
}

function printDirectedAdjacencyList() {
    const adjacencyList = directedGraph.getAdjacencyList();
    document.getElementById('directedAdjacencyList').innerText = adjacencyList;
}

function addNodeLeftDirect() {
    const newNodeLabel = directedGraph.getNextAvailableLetter();
    if (newNodeLabel) {
        directedGraph.addNode(newNodeLabel, 50, directedCanvas.height / 2);  // Add node at the left side of the canvas
        directedGraph.draw(directedCtx);
    }
}

const resizeCanvas = (canvas, ctx, factor) => {
    const newWidth = canvas.width + factor;
    const newHeight = canvas.height + factor;

    if (newWidth >= 600 && newHeight >= 400) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        directedGraph.draw(ctx);
    }
};

document.getElementById('plusButton2').addEventListener('click', () => {
    resizeCanvas(directedCanvas, directedCtx, 100);
});

document.getElementById('plusButton').addEventListener('click', () => {
    resizeCanvas(directedCanvas, directedCtx, 100);
});

document.getElementById('minusButton2').addEventListener('click', () => {
    resizeCanvas(directedCanvas, directedCtx, -100);
});


document.getElementById('minusButton').addEventListener('click', () => {
    resizeCanvas(directedCanvas, directedCtx, -100);
});

directedGraph.draw(directedCtx);

// Predefined nodes and edges for testing
directedGraph.addNode('a');
directedGraph.addNode('b');
directedGraph.addNode('c');

directedGraph.addEdge('a', 'b');
directedGraph.addEdge('b', 'a');
directedGraph.addEdge('b', 'c');
directedGraph.addEdge('c', 'a');

directedGraph.draw(directedCtx);
