class ConvolveMatrixFilter {
    svgFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    matrix = Array.from(new Array(3), () => new Array(3));
    _svg;

    constructor(matrix) {
        this.svgFilter.id = `convolveMatrixFilter${Math.random().toFixed(8).replace("0.", "")}`;
        this.svgFilter.setAttribute("x", "0%");
        this.svgFilter.setAttribute("y", "0%");
        this.svgFilter.setAttribute("width", "100%");
        this.svgFilter.setAttribute("height", "100%");
        this.setMatrix(matrix);
    }

    setMatrix(matrix) {
        this.matrix = matrix;
        let kernelString = "";
        for (let row of this.matrix) {
            kernelString += row.join(" ");
            kernelString += "\n";
        }
        this.svgFilter.innerHTML = `<feConvolveMatrix
            kernelMatrix="${kernelString}"
            order="${this.matrix.length}"
            color-interpolation-filters="sRGB"
        />`;
    }

    getFilter() {
        return `url(#${this.svgFilter.id})`;
    }

    render() {
        this._svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._svg.appendChild(this.svgFilter);
        document.body.appendChild(this._svg);
    }

    destroy() {
        if (this._svg) this._svg.remove();
    }
}

export default ConvolveMatrixFilter;