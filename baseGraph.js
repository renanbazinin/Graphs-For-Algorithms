class BaseGraph {
    constructor() {
        this.nodes = [];
        this.edges = new Map();
        this.positions = {};
        this.selectedNode = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.radius = 60;  // Node radius
        this.touchTimeout = null;
        this.lastTap = 0;
        this.letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    }

    addNode(node, x = null, y = null) {
        if (!this.nodes.includes(node)) {
            this.nodes.push(node);
            this.edges.set(node, []);
            if (x !== null && y !== null) {
                this.positions[node] = { x, y };
            }
        }
    }

    deleteNode(node) {
        if (this.nodes.includes(node)) {
            this.nodes = this.nodes.filter(n => n !== node);
            this.edges.delete(node);
            this.edges.forEach((neighbors, n) => {
                this.edges.set(n, neighbors.filter(neighbor => neighbor !== node));
            });
        }
    }

    getNextAvailableLetter() {
        for (let letter of this.letters) {
            if (!this.nodes.includes(letter)) {
                return letter;
            }
        }
        return null; // No available letter
    }

    getAdjacencyList() {
        let adjacencyList = '';
        this.nodes.forEach(node => {
            adjacencyList += `${node} -> ${this.edges.get(node).join(', ')}\n`;
        });
        return adjacencyList;
    }

    draw(ctx, scaleX = 1, scaleY = 1) {
        this.nodes.forEach((node, index) => {
            if (!this.positions[node]) {
                const angle = (index / this.nodes.length) * 2 * Math.PI;
                const x = 400 * scaleX + Math.cos(angle) * 200 * scaleX;
                const y = 300 * scaleY + Math.sin(angle) * 200 * scaleY;
                this.positions[node] = { x, y };
            }
        });

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.strokeStyle = '#FFD700';
        ctx.fillStyle = '#e0e0e0';
        ctx.lineWidth = 4;

        this.edges.forEach((neighbors, node) => {
            neighbors.forEach(neighbor => {
                const startPos = this.positions[node];
                const endPos = this.positions[neighbor];
                ctx.beginPath();
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(endPos.x, endPos.y);
                ctx.stroke();
            });
        });

        this.nodes.forEach(node => {
            const pos = this.positions[node];
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#1e1e1e';
            ctx.fill();
            ctx.strokeStyle = '#ADD8E6'; // Set outline color to red
            ctx.stroke();
          


            // Adjust font size dynamically
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

    handleMouseDown(event, canvas, ctx) {
        this.handlePointerDown(event.clientX, event.clientY, canvas, ctx);
    }

    handleTouchStart(event, canvas, ctx) {
        event.preventDefault();
        const touch = event.touches[0];
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTap;

        if (tapLength < 300 && tapLength > 0) {
            clearTimeout(this.touchTimeout);
            this.handleDoubleTap(touch.clientX, touch.clientY, canvas, ctx);
        } else {
            this.handlePointerDown(touch.clientX, touch.clientY, canvas, ctx);
        }

        this.lastTap = currentTime;
    }

    handlePointerDown(clientX, clientY, canvas, ctx) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        const positions = this.draw(ctx, scaleX, scaleY);

        this.selectedNode = null;

        for (const [node, pos] of Object.entries(positions)) {
            const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
            if (distance <= this.radius * scaleX) {  // Use this.radius
                this.selectedNode = node;
                this.offsetX = pos.x - x;
                this.offsetY = pos.y - y;
                break;
            }
        }
    }

    handleMouseMove(event, canvas, ctx) {
        this.handlePointerMove(event.clientX, event.clientY, canvas, ctx);
    }

    handleTouchMove(event, canvas, ctx) {
        event.preventDefault();
        const touch = event.touches[0];
        this.handlePointerMove(touch.clientX, touch.clientY, canvas, ctx);
    }

    handlePointerMove(clientX, clientY, canvas, ctx) {
        if (this.selectedNode) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (clientX - rect.left) * scaleX + this.offsetX;
            const y = (clientY - rect.top) * scaleY + this.offsetY;
            this.positions[this.selectedNode] = { x, y };
            this.draw(ctx, scaleX, scaleY);
        }
    }

    handleMouseUp() {
        this.selectedNode = null;
    }

    handleTouchEnd(event, canvas, ctx) {
        event.preventDefault();
        this.selectedNode = null;
    }

    handleDoubleClick(event, canvas, ctx) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        this.handleDoubleTap(x, y, canvas, ctx);
    }

    handleDoubleTap(clientX, clientY, canvas, ctx) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        const positions = this.draw(ctx, scaleX, scaleY);

        for (const [node, pos] of Object.entries(positions)) {
            const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
            if (distance <= this.radius * scaleX) {
                this.deleteNode(node);
                this.draw(ctx, scaleX, scaleY);
                return;
            }
        }

        const newNodeLabel = this.getNextAvailableLetter();
        if (newNodeLabel) {
            this.addNode(newNodeLabel, x, y);
            this.draw(ctx, scaleX, scaleY);
        }
    }

    adjustCanvasSize(canvas, ctx) {
        const screenWidth = window.innerWidth;
        const canvasWidth = Math.min(800, screenWidth);
        const canvasHeight = canvas.height;

        canvas.width = canvasWidth;

        // Adjust positions of nodes to fit within the new canvas size
        const scaleX = canvasWidth / 800;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        this.nodes.forEach((node) => {
            const pos = this.positions[node];
            pos.x = (pos.x - 400) * scaleX + centerX;
            pos.y = (pos.y - 300) * scaleY + centerY;
        });

        this.draw(ctx);
    }

    
}


document.getElementById('hamburgerIcon').addEventListener('click', function() {
    const popupMenu = document.getElementById('popupMenu');
    popupMenu.classList.toggle('show');
});