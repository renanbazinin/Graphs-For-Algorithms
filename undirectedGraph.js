class Graph extends BaseGraph {
    addEdge(node1, node2) {
        if (node1 !== node2 && this.edges.has(node1) && this.edges.has(node2) && !this.edges.get(node1).includes(node2)) {
            this.edges.get(node1).push(node2);
            this.edges.get(node2).push(node1);
        }
    }

    draw(ctx) {
        return super.draw(ctx); // Call the base class draw method for common drawing logic
    }
}

const undirectedGraph = new Graph();

const undirectedCanvas = document.getElementById('undirectedCanvas');
const undirectedCtx = undirectedCanvas.getContext('2d');

undirectedCanvas.addEventListener('mousedown', (event) => undirectedGraph.handleMouseDown(event, undirectedCanvas, undirectedCtx));
undirectedCanvas.addEventListener('mousemove', (event) => undirectedGraph.handleMouseMove(event, undirectedCanvas, undirectedCtx));
undirectedCanvas.addEventListener('mouseup', () => undirectedGraph.handleMouseUp());
undirectedCanvas.addEventListener('dblclick', (event) => undirectedGraph.handleDoubleClick(event, undirectedCanvas, undirectedCtx));

undirectedCanvas.addEventListener('touchstart', (event) => undirectedGraph.handleTouchStart(event, undirectedCanvas, undirectedCtx));
undirectedCanvas.addEventListener('touchmove', (event) => undirectedGraph.handleTouchMove(event, undirectedCanvas, undirectedCtx));
undirectedCanvas.addEventListener('touchend', (event) => undirectedGraph.handleTouchEnd(event, undirectedCanvas, undirectedCtx));

function addUndirectedNode() {
    const nodeInput = document.getElementById('undirectedNodeInput').value.trim().toLowerCase();
    if (nodeInput) {
        undirectedGraph.addNode(nodeInput);
        undirectedGraph.draw(undirectedCtx);
        document.getElementById('undirectedNodeInput').value = '';
    }
}


function addUndirectedEdge() {
    const node1 = document.getElementById('undirectedEdgeNode1').value.trim().toLowerCase();;
    const node2 = document.getElementById('undirectedEdgeNode2').value.trim().toLowerCase();;
    if (node1 && node2) {
        undirectedGraph.addEdge(node1, node2);
        undirectedGraph.draw(undirectedCtx);
        document.getElementById('undirectedEdgeNode1').value = '';
        document.getElementById('undirectedEdgeNode2').value = '';
    }
}

function printUndirectedAdjacencyList() {
    const adjacencyList = undirectedGraph.getAdjacencyList();
    document.getElementById('undirectedAdjacencyList').innerText = adjacencyList;
}

function addNodeLeftUnDirect() {
    const newNodeLabel = undirectedGraph.getNextAvailableLetter();
    if (newNodeLabel) {
        undirectedGraph.addNode(newNodeLabel, 50, undirectedCanvas.height / 2);  // Add node at the left side of the canvas
        undirectedGraph.draw(undirectedCtx);
    }
}

const resizeUnCanvas = (canvas, ctx, factor) => {
    const newWidth = canvas.width + factor;
    const newHeight = canvas.height + factor;

    if (newWidth >= 600 && newHeight >= 400) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        undirectedGraph.draw(ctx);
    }
};

document.getElementById('plusButton').addEventListener('click', () => {
    resizeUnCanvas(undirectedCanvas, undirectedCtx, 100);
});

document.getElementById('minusButton').addEventListener('click', () => {
    resizeUnCanvas(undirectedCanvas, undirectedCtx, -100);
});

undirectedGraph.draw(undirectedCtx);

// Predefined nodes and edges for testing
undirectedGraph.addNode('a');
undirectedGraph.addNode('b');
undirectedGraph.addNode('c');

undirectedGraph.addEdge('a', 'b');
undirectedGraph.addEdge('b', 'c');
undirectedGraph.addEdge('a', 'c');

undirectedGraph.draw(undirectedCtx);
