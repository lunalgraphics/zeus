/**
 * Renders a LightningPath tree onto a canvas context.
 * Draws connected line segments with round caps and varying lineWidth
 * to produce a continuous bolt with no gaps.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D context to draw on
 * @param {import('./pathGenerators.js').LightningPath} path - The path tree to render
 */
export function drawPathTree(ctx, path) {
    drawSegment(ctx, path.points);
    for (const child of path.children) {
        drawPathTree(ctx, child);
    }
}

/**
 * Draw a single path segment as connected line segments with round caps.
 * Each sub-segment uses the average thickness of its two endpoints as lineWidth,
 * ensuring smooth taper with no gaps between points.
 */
function drawSegment(ctx, points) {
    if (points.length === 0) return;
    if (points.length === 1) {
        // Single point: just draw a circle
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, points[0].thickness, 0, 2 * Math.PI);
        ctx.fill();
        return;
    }

    ctx.strokeStyle = "white";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const lineWidth = (p1.thickness + p2.thickness);

        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
}
