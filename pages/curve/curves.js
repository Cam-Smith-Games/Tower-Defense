// #region global variables
//let path = new Path([
//    new BezierCurve([0, 50], [150, 50], [150, 50], [150, 200]),
//    new BezierCurve([150, 200], [150, 300], [150, 375], [150, 450]),
//    new BezierCurve([150, 450], [150, 600], [150, 600], [300, 600])
//]);

const GRID_SIZE = 64;

// #endregion

let curve = new BezierCurve([0, 50], [150, 50], [150, 50], [150, 200]);

$(document).ready(function () {
    // #region canvas
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    // #endregion 





    let offset = new Vector(300, 0);

    function update(deltaTime) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var t = 0; t < 1; t += 0.1) {
            let point = curve.getPoint(t);
            
            draw.circle(point, 3, "red");
        }



        let length = curve.getApproximateLength();
        let numPoints = 3; 
        let frameDist = length / numPoints;

        for (let i = 0; i < numPoints; i++) {
            let t = i / numPoints;
            let point = curve.getPoint_NEW(t, frameDist).add(offset);
            draw.circle(point, 3, "red");
        }
    
    }

    let frameCount = 0, previousTime = 0;
    function loop(currentTime) {

        // #region tracking fps / delta time
        frameCount++;

        // convert time to seconds
        currentTime *= 0.001;
        const deltaTime = currentTime - previousTime;
        previousTime = currentTime;
        // #endregion


        //update(deltaTime);


        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);

    update();
    
});