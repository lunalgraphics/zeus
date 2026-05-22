export class FractalNoise {
    canvas = document.createElement("canvas");
    svgFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    options = {
        baseFrequency: [0.01, 0.01],
        type: "fractalNoise",
        numOctaves: 10,
        seed: 1,
        stitchTiles: "stitch"
    };
    width = 1920;
    height = 1080;

    setOptions(options) {
        for (const opt in options) {
            this.options[opt] = options[opt];
        }
        this.svgFilter.innerHTML = `<feTurbulence
            baseFrequency="${this.options.baseFrequency.join(" ")}"
            type="${this.options.type}"
            numOctaves="${this.options.numOctaves}"
            seed="${this.options.seed}"
            stitchTiles="${this.options.stitchTiles}"
            color-interpolation-filters="linearRGB"
        />`;
    }

    constructor(width, height, options) {
        this.svgFilter.id = `fNoiseFilter${Math.random().toFixed(8).replace("0.", "")}`;
        this.svgFilter.setAttribute("x", "0%");
        this.svgFilter.setAttribute("y", "0%");
        this.svgFilter.setAttribute("width", "100%");
        this.svgFilter.setAttribute("height", "100%");
        this.setOptions(options);
        this.width = width;
        this.height = height;
    }

    render() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        const canv = this.canvas;
        const ctx = canv.getContext("2d");

        ctx.restore();
        ctx.save();
        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canv.width, canv.height);
        ctx.restore();
        ctx.save();

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.appendChild(this.svgFilter);
        document.body.appendChild(svg);

        if (this.options.type === "fractalNoise") {
            ctx.filter = `url(#${this.svgFilter.id})`;
            ctx.fillRect(0, 0, canv.width, canv.height);
            ctx.filter = `url(#${this.svgFilter.id}) opacity(0.77)`;
            ctx.fillRect(0, 0, canv.width, canv.height);
        } else if (this.options.type === "turbulence") {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canv.width, canv.height);
            ctx.restore();
            ctx.save();
            ctx.filter = `url(#${this.svgFilter.id}) invert()`;
            ctx.fillRect(0, 0, canv.width, canv.height);
            ctx.restore();
            ctx.save();
            ctx.globalCompositeOperation = "overlay";
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canv.width, canv.height);
            ctx.fillStyle = "#515151";
            ctx.fillRect(0, 0, canv.width, canv.height);
        } else {
            console.warn("Invalid noise type:", this.options.type);
        }

        svg.remove();
    }
}
