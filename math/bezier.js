class BezierCurve {

    constructor(start, control1, control2, end) {
        this.start = start instanceof Vector ? start : new Vector(start[0], start[1]);
        this.control1 = control1 instanceof Vector ? control1 : new Vector(control1[0], control1[1]);
        this.control2 = control2 instanceof Vector ? control2 : new Vector(control2[0], control2[1]);
        this.end = end instanceof Vector ? end : new Vector(end[0], end[1]);




        let clen = 0;
        let o = this.getPoint(0);
        for (var i = 1; i <= this.numPoints; i++) {
            let vec = this.getPoint(i * 0.01);
            let dv = o.subtract(vec);
            clen += dv.length();
            this.arcLengths[i] = clen;
            o = vec;
        }
        this.length = clen;    


        this.points = [];


        // TODO: args?
        //this.color = typeof args.color === "string" ? args.color : "#555";
        //this.width = typeof args.width === "number" ? args.width : 50;
        this.color = "#555";
        this.width = 50;


        this.v1 = this.start.multiply(-3).add(this.control1.multiply(9)).subtract(this.control2.multiply(9)).add(this.end.multiply(3));
        this.v2 = this.start.multiply(6).subtract(this.control1.multiply(12)).add(this.control2.multiply(6));
        this.v3 = this.start.multiply(-3).add(this.control1.multiply(3));
    }


    // #region drawing

    draw() {

        draw.bezier(this.start, this.control1, this.control2, this.end, this.color, this.width);

        if (debug) {
            draw.line(this.start, this.control1, "gray");
            draw.line(this.end, this.control2, "gray");

            draw.circle(this.start, 5, "red");
            draw.circle(this.control1, 5, "orange");
            draw.circle(this.control2, 5, "green");
            draw.circle(this.end, 5, "blue");
        }
    }
    // #endregion


    // t between 0 and 1
    getPoint(t) {
        return new Vector(
            Math.pow(1 - t, 3) * this.start.x + 3 * t * Math.pow(1 - t, 2) * this.control1.x + 3 * t * t * (1 - t) * this.control2.x + t * t * t * this.end.x,
            Math.pow(1 - t, 3) * this.start.y + 3 * t * Math.pow(1 - t, 2) * this.control1.y + 3 * t * t * (1 - t) * this.control2.y + t * t * t * this.end.y
        );
    }


    getPoint_NEW(t, L) {
        let test = this.v1.multiply(Math.pow(t, 2)).add(this.v2.multiply(t)).add(this.v3).length();
        let t_test = t + (L / test);
        console.log(t + " => " + t_test);
        return this.getPoint(t_test, L);
    }

    getApproximateLength(numPoints = 100) {
        let points = [];
        for (let i = 0; i < numPoints; i++) {
            let t = i / numPoints ;
            let point = this.getPoint(t);
            points.push(point);
        }
  

        let arc_lengths = [];
        for (var i = 0; i < points.length - 1; i++) {
            let p1 = points[i];
            let p2 = points[i + 1];
            let dist = p2.dist(p1);
            arc_lengths.push(dist);
        }

        let length = arc_lengths.sum();

        return length;

    }

    _getPointScript(point) {
        return "[" + point.x + "," + point.y + "]";
    } 
    getScript(asArray) {
        return (asArray ? "[" : "new BezierCurve(") +
            this._getPointScript(this.start) + "," +
            this._getPointScript(this.control1) + "," +
            this._getPointScript(this.control2) + "," +
            this._getPointScript(this.end) +
        (asArray ? "]" : ")");
    }
}