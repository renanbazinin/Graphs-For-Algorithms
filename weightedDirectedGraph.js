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
        const curveOffset = 10; // Offset for drawing curved edges

        const weightFontSize = 16; 

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

        const drawArrowhead = (from, to, controlPoint = null) => {
            let angle;

            if (controlPoint) {
                // For curves, calculate the angle at the end of the curve
                angle = Math.atan2(to.y - controlPoint.y, to.x - controlPoint.x);
            } else {
                // For straight lines
                angle = Math.atan2(to.y - from.y, to.x - from.x);
            }

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
                const reverseEdgeKey = `${neighbor}-${node}`;

                if (!drawnEdges.has(edgeKey)) {
                    if (drawnEdges.has(reverseEdgeKey)) {
                        // If there's a reverse edge, draw a curve
                        const midX = (startPos.x + endPos.x) / 2;
                        const midY = (startPos.y + endPos.y) / 2;
                        const controlPoint = {
                            x: midX + (startPos.y - endPos.y) / curveOffset,
                            y: midY + (endPos.x - startPos.x) / curveOffset
                        };

                        // Draw the curve
                        ctx.beginPath();
                        ctx.moveTo(startPos.x, startPos.y);
                        ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPos.x, endPos.y);
                        ctx.stroke();
                        drawArrowhead(startPos, endPos, controlPoint);

                        // Draw weight at the control point
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = "35px Arial"; // Set the larger font size for weight text

                        ctx.fillText(weight, controlPoint.x, controlPoint.y);
                    } else {
                        // Draw straight line for regular edges
                        ctx.beginPath();
                        ctx.moveTo(startPos.x, startPos.y);
                        ctx.lineTo(endPos.x, endPos.y);
                        ctx.stroke();
                        drawArrowhead(startPos, endPos);

                        // Draw the weight near the midpoint of the edge
                        const midX = (startPos.x + endPos.x) / 2;
                        const midY = (startPos.y + endPos.y) / 2;
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = "35px Arial"; // Set the larger font size for weight text

                        ctx.fillText(weight, midX, midY);
                    }

                    drawnEdges.add(edgeKey);
                }
            });
        });

        // Draw nodes
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
        let adjacencyList = '';
        this.edges.forEach((neighbors, node) => {
            const neighborStrings = neighbors.map(({ node: neighbor, weight }) => `${neighbor}:${weight}`).join(', ');
            adjacencyList += `${node} -> ${neighborStrings}\n`;
        });
        return adjacencyList.trim();
    }
    
}
