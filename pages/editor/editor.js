/*
 * 
 * 
 * 
 * 
 *          LINE RIDER TOWER DEFENSE
 * 
 *          enemies will snowboard off the slopes, ramp over shit
 *          towers will have to be placed underneath / above the trajectory paths
 * 
 * 
 * 
 *          spartan laser turret
 *              slow charge up, once fully charged, release a huge laser beam
 *              laser beam will pierce enemies, so you want to place it against a straight line for maximum damage
 * 
 */
















// #region global variables
let path = new Path([
    new BezierCurve([0, 50], [150, 50], [150, 50], [150, 200]),
    new BezierCurve([150, 200], [150, 300], [150, 375], [150, 450]),
    new BezierCurve([150, 450], [150, 600], [150, 600], [300, 600])
]);

const GRID_SIZE = 64;

let monkey;
const images = {}, sounds = {};

var canvas, ctx,
    blurCanvas, blurCtx,
    bullets = [];

var debug = false;


const mouse = {
    position: new Vector(0, 0)
};


let stopped = false;
// #endregion


$(document).ready(function () {
    // #region canvas
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    // #endregion 





    //for (var i = 0; i < bezier1.points.length - 1; i++) {
    //    let point = bezier1.points[i];
    //    let next = bezier1.points[i + 1];

    //    var a = point.x - next.x;
    //    var b = point.y - next.y;
    //    let dist = Math.sqrt(a * a + b * b);
    //    console.log(dist);
    //}




    let clickPoints = [];
    function resetClickPoints() {
        // if path exists, always start from last curve point
        clickPoints = path.curves.length ? [path.curves[path.curves.length - 1].end] : [];
    }
    resetClickPoints();

    $(document)
        .on("contextmenu", e => e.preventDefault())
        .on("mousemove", function (e) {
            let rect = canvas.getBoundingClientRect();
            let x = (e.clientX || e.pageX) - rect.left;
            let y = (e.clientY || e.pageY) - rect.top;

            // convert to canvas coordinates (resolution vs actual size)
            x *= canvas.width / rect.width;
            y *= canvas.height / rect.height;

            mouse.position = new Vector(x.clamp(0, canvas.width), y.clamp(0, canvas.height));
        })
        .on("mousedown", function (e) {
            e.preventDefault();

            // left click -> add point
            if (e.which == 1) {
                clickPoints.push(mouse.position.roundTo(GRID_SIZE));
            }
            // middle click -> if on control point stage, set both control points to mouse position
            else if (e.which == 2 && clickPoints.length > 1) {
                if (clickPoints.length == 2) {
                    let point = mouse.position.roundTo(GRID_SIZE)
                    clickPoints.push(point);
                    clickPoints.push(point);
                }
                // use previous control point as second control point
                else if (clickPoints.length == 3) {
                    clickPoints.push(clickPoints[2]);
                }
            }
            // right click -> clear points
            else {
                // right click on first point -> remove last curve
                if (clickPoints.length == 1 && path.curves.length) {
                    path.curves.splice(path.curves.length - 1, 1);
                    path.approximate();
                }

                resetClickPoints();
            }

            // have to put this out here because we can finalize from left click OR middle click scenario
            if (clickPoints.length == 4) {
                let newCurve = new BezierCurve(clickPoints[0], clickPoints[2], clickPoints[3], clickPoints[1]);
                path.addCurve(newCurve);
                clickPoints = [newCurve.end];
            }

        })



    let towers = [];


    // #region loading images -> start loop
    let imagePaths = [
        "graem_sad"
    ];
    let loadCounter = 0;
    imagePaths.forEach(path => {
        let img = new Image();
        img.onload = () => {
            if (++loadCounter == imagePaths.length) {
                init();
            }
        };
        img.src = "/img/" + path + ".png";
        images[path] = img;
    })

    // #endregion


    function init() {
        window.requestAnimationFrame(loop);
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


        ctx.clearRect(0, 0, canvas.width, canvas.height);

        path.draw();


        towers.forEach(tower => tower.update(deltaTime));
        for (var i = bullets.length - 1; i > -i; i--) {
            let bullet = bullets[i];
            if (bullet.update(deltaTime)) {
                bullets.splice(i, 1);
            }
        }
  
        // #region map builder 

        // #region draw grid
        for (var x = 0; x < canvas.width; x += GRID_SIZE) {
            draw.line(new Vector(x, 0), new Vector(x, canvas.height), "#666");
        }
        for (var y = 0; y < canvas.height; y += GRID_SIZE) {
            draw.line(new Vector(0,y), new Vector(canvas.width, y), "#666");
        }
        // #endregion

        let mousePos = mouse.position.roundTo(GRID_SIZE)
        draw.circle(mousePos, 3, "magenta");

        // single point -> connect straight line to mouse position
        if (clickPoints.length == 1) {
            draw.line(clickPoints[0], mousePos, "magenta");
        }
        // 2 points -> draw bezier connecting 1 to 2 with mouse position as BOTH anchors 
        else if (clickPoints.length == 2) {
            let start = clickPoints[0];
            let end = clickPoints[1];
            let control = mousePos;

            draw.bezier(start, control, control, end, "magenta");
            draw.line(start, control, "cyan");
            draw.line(end, control, "yellow");
        }
        // 3 points: draw bezier connecting 1 to 2, with 3 as anchor1 and mouse as anchor2
        else if (clickPoints.length == 3) {
            let start = clickPoints[0];
            let end = clickPoints[1];
            let control1 = clickPoints[2];
            let control2 = mousePos;

            draw.bezier(start, control1, control2, end, "magenta");
            draw.line(start, control1, "cyan");
            draw.line(end, control2, "yellow");
        }
        
        clickPoints.forEach(point => {
            draw.circle(point, 3, "magenta");
        })

        // #endregion


        window.requestAnimationFrame(loop);
    }
   
});