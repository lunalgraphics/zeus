export class PixelManipulator {
    canvas;
    ctx;
    imageData;

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    getPixel(x, y) {
        const redPosition = (y * this.canvas.width + x) * 4;
        return [
            this.imageData.data[redPosition],
            this.imageData.data[redPosition + 1],
            this.imageData.data[redPosition + 2],
            this.imageData.data[redPosition + 3],
        ];
    }

    setPixel(x, y, rgba = [0, 0, 0, 255]) {
        const redPosition = (y * this.canvas.width + x) * 4;
        if (redPosition > this.imageData.data.length || redPosition < 0) {
            return false;
        }
        for (let i = 0; i < rgba.length; i++) {
            this.imageData.data[redPosition + i] = rgba[i];
        }
        return true;
    }

    renderChanges() {
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}
