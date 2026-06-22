/**
 * Generates fractal noise textures using SVG feTurbulence filters.
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

// ─── FractalNoise Class ──────────────────────────────────────────────

export default class FractalNoise {
    /**
     * @param {number} width - Output texture width.
     * @param {number} height - Output texture height.
     * @param {Object} options - FeTurbulence filter options.
     */
    constructor(width, height, options) {
        this.canvas = document.createElement("canvas");
        this.width = width;
        this.height = height;

        this.options = {
            baseFrequency: [0.01, 0.01],
            type: "fractalNoise",
            numOctaves: 10,
            seed: 1,
            stitchTiles: "stitch",
        };

        // Create a unique filter ID
        filterCounter++;
        this._filterId = "fNoise_" + filterCounter;

        // Create filter and feTurbulence elements
        this._filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        this._filter.id = this._filterId;
        this._filter.setAttribute("x", "0%");
        this._filter.setAttribute("y", "0%");
        this._filter.setAttribute("width", "100%");
        this._filter.setAttribute("height", "100%");

        this._feTurbulence = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
        this._feTurbulence.setAttribute("color-interpolation-filters", "linearRGB");
        this._filter.appendChild(this._feTurbulence);

        // Append to the shared persistent SVG
        getSharedSvg().appendChild(this._filter);

        // Apply initial options
        this.setOptions(options);
    }

    /**
     * Merge new options and update the feTurbulence element attributes.
     * @param {Object} options - Partial options to override defaults.
     */
    setOptions(options) {
        for (let opt in options) {
            this.options[opt] = options[opt];
        }

        // Update SVG attributes in-place (no innerHTML, no DOM re-injection)
        this._feTurbulence.setAttribute("baseFrequency", this.options.baseFrequency.join(" "));
        this._feTurbulence.setAttribute("type", this.options.type);
        this._feTurbulence.setAttribute("numOctaves", this.options.numOctaves);
        this._feTurbulence.setAttribute("seed", this.options.seed);
        this._feTurbulence.setAttribute("stitchTiles", this.options.stitchTiles);
    }

    /**
     * Render the noise texture to this.canvas.
     * References the persistent SVG filter by ID — no DOM mutations needed.
     */
    render() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        let ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply the persistent SVG filter by reference
        if (this.options.type === "fractalNoise") {
            ctx.filter = "url(#" + this._filterId + ")";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.filter = "url(#" + this._filterId + ") opacity(0.77)";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        else {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = "black";
            ctx.filter = `url(#${this._filterId}) invert()`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.filter = "none";
            ctx.globalCompositeOperation = "overlay";
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = "#515151";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        ctx.filter = "none";
    }

    /**
     * Remove this filter from the shared SVG when no longer needed.
     * Call this if you want to clean up (optional — filters are lightweight).
     */
    destroy() {
        if (this._filter && this._filter.parentNode) {
            this._filter.parentNode.removeChild(this._filter);
        }
    }
}