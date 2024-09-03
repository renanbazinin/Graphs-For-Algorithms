class WeightedDirectedGraph extends DirectedGraph {
    addEdge(node1, node2, weight) {
        if (node1 !== node2 && this.edges.has(node1) && this.edges.has(node2)) {
            if (!this.edges.get(node1).some(edge => edge.node === node2)) {
                this.edges.get(node1).push({ node: node2, weight });
            }
        }
    }

    draw(ctx) {
        const radius = this.radius;
        const arrowLength = 20;

        this.nodes.forEach((node, index) => {
            if (!this.positions[node]) {
                const angle = (index / this.nodes.length) * 2 * Math.PI;
                const x = 400 + Math.cos(angle) * 200;
                const y = 300 + Math.sin(angle) * 200;
                this.positions[node] = { x, y };
            }
        });

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
            neighbors.forEach(({ node: neighbor, weight }) => {
                const startPos = this.positions[node];
                const endPos = this.positions[neighbor];
                const edgeKey = `${node}-${neighbor}`;

                if (!drawnEdges.has(edgeKey)) {
                    ctx.beginPath();
                    ctx.moveTo(startPos.x, startPos.y);
                    ctx.lineTo(endPos.x, endPos.y);
                    ctx.stroke();
                    drawArrowhead(startPos, endPos);

                    // Draw the weight near the midpoint of the edge
                    const midX = (startPos.x + endPos.x) / 2;
                    const midY = (startPos.y + endPos.y) / 2;
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText(weight, midX, midY);

                    drawnEdges.add(edgeKey);
                }
            });
        });

        this.nodes.forEach(node => {
            const pos = this.positions[node];
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = '#1e1e1e';
            ctx.fill();
            ctx.strokeStyle = '#ADD8E6';
            ctx.stroke();

            let fontSize = this.radius / 1.5;
            ctx.font = `${fontSize}px Arial`;
            let textWidth = ctx.measureText(node).width;
            while (textWidth > this.radius * 1.5) {
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

    getAdjacencyList() {
        const adjacencyList = {};
        this.edges.forEach((neighbors, node) => {
            adjacencyList[node] = neighbors.map(({ node: neighbor, weight }) => `${neighbor}(${weight})`);
        });
        return adjacencyList;
    }
}
