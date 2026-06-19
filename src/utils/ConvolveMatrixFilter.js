/**
 * Generates an SVG convolve matrix filter which can be used to perform transformations in ctx2d.
 *
 * Uses a persistent hidden SVG element in the DOM (created once on first use)
 * to avoid repeated DOM injection/removal on every render call. The filter
 * attributes are updated in-place before each render.
 */

// ─── Shared persistent SVG container ─────────────────────────────────
// One SVG element holds all filter definitions. Created lazily on first use.
let sharedSvg = null;
let filterCounter = 0;

function getSharedSvg() {
    if (!sharedSvg) {
        sharedSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        sharedSvg.setAttribute("width", "0");
        sharedSvg.setAttribute("height", "0");
        sharedSvg.style.position = "absolute";
        sharedSvg.style.pointerEvents = "none";
        sharedSvg.style.opacity = "0";
        document.body.appendChild(sharedSvg);
    }
    return sharedSvg;
}

class ConvolveMatrixFilter {
    _filter;
    matrix = Array.from(new Array(3), () => new Array(3));
    _filterId;

    constructor(matrix) {
        // Create a unique filter ID
        filterCounter++;
        this._filterId = "convolveMatrixFilter" + filterCounter;

        // Create filter
        this._filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        this._filter.id = this._filterId;
        this._filter.setAttribute("x", "0%");
        this._filter.setAttribute("y", "0%");
        this._filter.setAttribute("width", "100%");
        this._filter.setAttribute("height", "100%");
        this.setMatrix(matrix);
    }

    setMatrix(matrix) {
        this.matrix = matrix;
        let kernelString = "";
        for (let row of this.matrix) {
            kernelString += row.join(" ");
            kernelString += "\n";
        }
        this._filter.innerHTML = `<feConvolveMatrix
            kernelMatrix="${kernelString}"
            order="${this.matrix.length}"
            color-interpolation-filters="sRGB"
        />`;
    }

    getFilter() {
        return `url(#${this._filterId})`;
    }

    render() {
        let svg = getSharedSvg();
        svg.appendChild(this._filter);
        if (!document.body.contains(svg)) {
            document.body.appendChild(svg);
        }
    }

    destroy() {
        if (this._filter && this._filter.parentNode) {
            this._filter.parentNode.removeChild(this._filter);
        }
    }
}

export default ConvolveMatrixFilter;