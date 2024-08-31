// graphUtils.js
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

function resizeCanvas(canvas, factor,graph,ctx) {

    const newWidth = canvas.width + factor;
    const newHeight = canvas.height + factor;

    if (newWidth >= 400 && newHeight >= 300 && newWidth <= 1200 && newHeight <= 900) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        graph.draw(ctx);
    }
}

function loadGraphFromText(graph, text) {
    graph.nodes = [];
    graph.edges.clear();

    const lines = text.split('\n');
    lines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine.length === 0) return;

        const [node, neighbors] = trimmedLine.split('->').map(part => part.trim());
        graph.addNode(node);

        if (neighbors) {
            neighbors.split(',').forEach(neighbor => {
                graph.addNode(neighbor.trim());
                graph.addEdge(node, neighbor.trim());
            });
        }
    });
}
function handleImportGraph(canvas, graph, ctx) {
    //canvas.addEventListener('closeModalButton', (event) => graph.handleTouchStart(event, canvas, ctx), { passive: false });

}


function handleTouchEvents(canvas, graph, ctx) {
    canvas.addEventListener('touchstart', (event) => graph.handleTouchStart(event, canvas, ctx), { passive: false });
    canvas.addEventListener('touchmove', (event) => graph.handleTouchMove(event, canvas, ctx), { passive: false });
    canvas.addEventListener('touchend', (event) => graph.handleTouchEnd(event, canvas, ctx), { passive: false });
}

function handleMouseEvents(canvas, graph, ctx) {
    canvas.addEventListener('mousedown', (event) => graph.handleMouseDown(event, canvas, ctx));
    canvas.addEventListener('mousemove', (event) => graph.handleMouseMove(event, canvas, ctx));
    canvas.addEventListener('mouseup', () => graph.handleMouseUp());
}

function loadGraphFromURL(url, graph, visualizer, canvas, ctx) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            graph.nodes = [];
            graph.edges.clear();

            data.nodes.forEach(node => {
                graph.addNode(node.name, node.x, node.y);
            });

            data.edges.forEach(edge => {
                graph.addEdge(edge.from, edge.to);
            });

            visualizer.graph = graph;
            visualizer.initialize();

            console.log('Graph loaded successfully from URL');
        })
        .catch(error => console.error('Error loading graph from URL:', error));
}

function loadGraphFromURL(url, graph, visualizer, canvas, ctx) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            graph.clear();
            data.nodes.forEach(node => graph.addNode(node.name, node.x, node.y));
            data.edges.forEach(edge => graph.addEdge(edge.from, edge.to));
            visualizer.initialize();
        })
        .catch(error => {
            console.error('Error loading graph from URL:', error);
            alert('Failed to load graph. Please check the URL and try again.');
        });
}


function handleModalClose(closeButton, modal) {
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}
