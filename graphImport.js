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

function setupGraphImportButtons() {
    // Undirected Graph Elements
    const importUndirectedGraphButton = document.getElementById('importUndirectedGraphButton');
    const importUndirectedGraphModal = document.getElementById('importUndirectedGraphModal');
    const closeUndirectedModalButton = document.getElementById('closeUndirectedModalButton');
    const loadUndirectedGraphButton = document.getElementById('loadUndirectedGraphButton');
    const undirectedGraphInput = document.getElementById('undirectedGraphInput');

    // Directed Graph Elements
    const importDirectedGraphButton = document.getElementById('importDirectedGraphButton');
    const importDirectedGraphModal = document.getElementById('importDirectedGraphModal');
    const closeDirectedModalButton = document.getElementById('closeDirectedModalButton');
    const loadDirectedGraphButton = document.getElementById('loadDirectedGraphButton');
    const directedGraphInput = document.getElementById('directedGraphInput');

    function loadGraphFromText(text, graph, ctx) {
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
        graph.draw(ctx);
    }

    // Event Listeners for Undirected Graph
    importUndirectedGraphButton.addEventListener('click', () => {
        const currentAdjacencyList = undirectedGraph.getAdjacencyList();
        undirectedGraphInput.value = currentAdjacencyList;
        importUndirectedGraphModal.style.display = 'flex';
    });

    closeUndirectedModalButton.addEventListener('click', () => {
        importUndirectedGraphModal.style.display = 'none';
    });

    loadUndirectedGraphButton.addEventListener('click', () => {
        const text = undirectedGraphInput.value;
        const undirectedCanvas = document.getElementById('undirectedCanvas');
        const undirectedCtx = undirectedCanvas.getContext('2d');
        loadGraphFromText(text, undirectedGraph, undirectedCtx);
        importUndirectedGraphModal.style.display = 'none';
    });

    // Event Listeners for Directed Graph
    importDirectedGraphButton.addEventListener('click', () => {
        const currentAdjacencyList = directedGraph.getAdjacencyList();
        directedGraphInput.value = currentAdjacencyList;
        importDirectedGraphModal.style.display = 'flex';
    });

    closeDirectedModalButton.addEventListener('click', () => {
        importDirectedGraphModal.style.display = 'none';
    });

    loadDirectedGraphButton.addEventListener('click', () => {
        const text = directedGraphInput.value;
        const directedCanvas = document.getElementById('directedCanvas');
        const directedCtx = directedCanvas.getContext('2d');
        loadGraphFromText(text, directedGraph, directedCtx);
        importDirectedGraphModal.style.display = 'none';
    });

    // Close modals when clicking outside of them
    window.addEventListener('click', (event) => {
        if (event.target === importUndirectedGraphModal) {
            importUndirectedGraphModal.style.display = 'none';
        }
        if (event.target === importDirectedGraphModal) {
            importDirectedGraphModal.style.display = 'none';
        }
    });
}

// Initialize the setup when the window is loaded
window.onload = function() {
    setupGraphImportButtons();
    document.getElementById('undirectedGraph').style.display = 'block';
    document.getElementById('directedGraph').style.display = 'none';
};

function toggleGraph() {
    const undirectedGraph = document.getElementById('undirectedGraph');
    const directedGraph = document.getElementById('directedGraph');
    if (undirectedGraph.style.display === 'none') {
        undirectedGraph.style.display = 'block';
        directedGraph.style.display = 'none';
    } else {
        undirectedGraph.style.display = 'none';
        directedGraph.style.display = 'block';
    }
}
