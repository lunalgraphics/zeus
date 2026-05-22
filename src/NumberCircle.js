export class NumberCircle {
    radius = 5;
    matrix = [];

    constructor(radius) {
        this.setRadius(radius);
    }

    setRadius(radius) {
        this.radius = radius;
        this.matrix = Array.from(
            new Array(this.radius * 2 + 1),
            () => new Array(this.radius * 2 + 1)
        );
        for (let x = -this.radius; x <= this.radius; x++) {
            for (let y = -this.radius; y <= this.radius; y++) {
                const distSq = x * x + y * y;
                const radiusSq = this.radius * this.radius;
                if (distSq <= radiusSq) {
                    this.matrix[x + this.radius][y + this.radius] = 1;
                } else if (distSq <= radiusSq + 1) {
                    this.matrix[x + this.radius][y + this.radius] = 0.5; // anti-alias
                } else {
                    this.matrix[x + this.radius][y + this.radius] = 0;
                }
            }
        }
    }

    toString() {
        return this.matrix.map(row => row.join(" ")).join("\n");
    }
}
