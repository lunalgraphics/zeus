class NumberCircle {
    radius = 5;
    matrix = [];

    constructor(radius) {
        this.setRadius(radius);
    }

    setRadius(radius) {
        this.radius = radius;
        this.matrix = Array.from(new Array(this.radius * 2 + 1), () => new Array(this.radius * 2 + 1));
        for (let x = -this.radius; x <= this.radius; x++) {
            for (let y = -this.radius; y <= this.radius; y++) {
                if (Math.pow(x, 2) + Math.pow(y, 2) <= Math.pow(this.radius, 2)) {
                    this.matrix[x + this.radius][y + this.radius] = 1;
                }
                else if (Math.pow(x, 2) + Math.pow(y, 2) <= Math.pow(this.radius, 2) + 1) {
                    this.matrix[x + this.radius][y + this.radius] = 0.5; // anti-alias
                }
                else {
                    this.matrix[x + this.radius][y + this.radius] = 0;
                }
            }
        }
    }

    toString() {
        let output = "";
        for (let row of this.matrix) {
            output += row.join(" ");
            output += "\n";
        }
        //output = output.substring(0, -1);
        return output;
    }
}

export default NumberCircle;