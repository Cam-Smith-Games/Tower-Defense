class Path {
    constructor(curves = []) {
        this.curves = curves;
        this.approximate();
    }



    addCurve(curve) {
        console.log("adding curve: ", curve);
        this.curves.push(curve);
        this.approximate();
    }




    // STEP #1: approximate entire path length (sum of all curves approximate lengths)
    // STEP #2: given a number of desired points on final path, calculate length of desired segments
    // STEP #3: follow along each curve, adding to distance. once we reach the end of a segment, store the current position



    getCurvePoints(pointsPerCurve = 100) {
        let points = [];
        this.curves.forEach(curve => {
            for (let i = 0; i < pointsPerCurve; i++) {
                let t = i / pointsPerCurve;
                let point = curve.getPoint(t);
                points.push(point);
            }
        });
        return points;
    }

    getArcLengths(points) {
        let arc_lengths = [];

        for (var i = 0; i < points.length - 1; i++) {
            let p1 = points[i];
            let p2 = points[i + 1];
            let dist = p2.dist(p1);
            arc_lengths.push(dist);
        }

        return arc_lengths;
    }

    getDistribution() {
        let arc_lengths = this.getArcLengths(this.points);

        let min_length = arc_lengths.min();
        let max_length = arc_lengths.max();
        let avg_length = arc_lengths.avg();
        let range = max_length - min_length;

        // using standard deviation to show distribution of arc lengths (farther from average = bad)
        const N = 1 / arc_lengths.length;
        this.point_distribution = [];
        this.point_colors = [];
        for (var i = 0; i < arc_lengths.length; i++) {

            //let arc_length = arc_lengths[i];
            //let normalized = (arc_length - min_length) / range * 100;
            let normalized = 100 - (N * Math.pow(length - avg_length, 2));
            this.point_distribution.push(normalized);

            let color = this.perc2Color(normalized);
            this.point_colors.push(color);
        }


        console.log({
            arc_lengths: arc_lengths,
            min: min_length,
            max: max_length,
            range: range,
            distribution: this.point_distribution,
            colors: this.point_colors
        })
    }

    approximate() {  
        this.points = [];
        if (!this.curves || !this.curves.length) {
            return;
        }

        let curve_points = this.getCurvePoints();
        let arc_lengths = this.getArcLengths(curve_points);



        //const total_length = arc_lengths.sum();
   
        //const numDesiredPoints = 100;
        //const segment_length = total_length / numDesiredPoints;
        const segment_length = 10;

        //console.log("segment length = " + segment_length);

        let total_distance = 0;
        let segment_distance = 0;
        let prev = this.curves[0].getPoint(0);

        this.points.push(prev.copy());

        this.curves.forEach(curve => {
            // starting at 0.01 to not only skip initial point, but because each curve's starting point is equivalent to previous curves ending point
            for (let t = 0.01; t <= 1; t += 0.01) {
                let point = curve.getPoint(t);
                let diff = point.subtract(prev);
                let dist = diff.length();

                const remaining_length = segment_length - segment_distance;

                // havent completed a segment yet
                if (dist < remaining_length) {
                    segment_distance += dist;
                }
                // reached end of segment
                else {
                    // find how much length we have left on this current segment. 
                    // follow the angle of these 2 points but only use remaining length 

                    let corrected = diff.unit().multiply(remaining_length);
                    //let point_corrected = point.subtract(corrected);
                    let point_corrected = prev.add(corrected);
                    this.points.push(point_corrected);

                    segment_distance = dist - remaining_length;
                }

                prev = point;
            }
        });

        // finally, add last point
        this.points.push(this.curves[this.curves.length - 1].getPoint(1));


        this.getDistribution();

      

    }



    perc2Color(perc) {
        var r, g, b = 0;
        if (perc < 50) {
            r = 255;
            g = Math.round(5.1 * perc);
        }
        else {
            g = 255;
            r = Math.round(510 - 5.10 * perc);
        }
        var h = r * 0x10000 + g * 0x100 + b * 0x1;
        return '#' + ('000000' + h.toString(16)).slice(-6);
    }

    draw() {
        this.curves.forEach(curve => {
            curve.draw();
            // now draw a circle to connect sharp corners
            let lastPoint = curve.getPoint(1);
            draw.circle(lastPoint, curve.width / 2, curve.color);
        });
        draw.path_rainbow(this.points, this.point_colors);
    }

    getScript(asArray) {
        let js = "[";

        if (this.curves.length) {
            js += "\n";
            this.curves.forEach(curve => {
                js += curve.getScript(asArray) + ",\n";
            })

            js = js.substr(0, js.length - 2) + "\n";
        }

        return js + "]";
    }
}