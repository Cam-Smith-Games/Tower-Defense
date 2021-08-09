const images = {}, keys = {};
var canvas, ctx;
var debug = true;
var object1, pnkect2, animation1, animation2;

$(document).ready(function () {

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    // #region load images -> start loop
    let imagePaths = ["body_male"];
    let loadCounter = 0;
    imagePaths.forEach(path => {
        let img = new Image();
        img.onload = () => {
            if (++loadCounter == imagePaths.length) {
                init();
            }
        };
        img.src = "../../img/" + path + ".png";
        images[path] = img;
    });
    // #endregion


    $(document)
        .on("keydown", e => {
            console.log(e.which);
            keys[e.which] = true;

            if (e.which == 32) {
                object1.animation.once("SLASH");
            }
        })
        .on("keyup", e => delete keys[e.which]);

    function init() {

        object1 = new GameObject.Circle({
            position: new Vector(175, 200),
            radius: 100,
            color: "black",
            animation:  new OrthographicAnimation({
                sheet: images["body_male"],
                frameSize: new Vector(64, 64),
                frameDelay: 0.1,
                groups: {
                    "CAST": {
                        index: 0,
                        numFrames: 7
                    },
                    "STAB": {
                        index: 1,
                        numFrames: 8
                    },
                    "WALK": {
                        index: 2,
                        startFrame: 1,
                        numFrames: 9
                    },
                    "SLASH": {
                        index: 3,
                        numFrames: 6
                    },
                    "BOW": {
                        index: 4,
                        numFrames: 13
                    },
                    "DIE": {
                        index: 5,
                        numFrames: 6
                    }
                }
            })
        });

        object1.animation.set("WALK");
    

        //animation2 = new SimpleAnimation({
        //    sheet: images["body_male"],
        //    frameSize: new Vector(64, 64),
        //    numColumns: 7,
        //    numRows: 1,
        //    frameDelay: 0.1
        //});

        window.requestAnimationFrame(loop);
    }

    let previousTime = 0;

    function loop(currentTime) {

        // #region tracking fps / delta time
        // convert time to seconds
        currentTime *= 0.001;
        const deltaTime = currentTime - previousTime;
        previousTime = currentTime;
        // #endregion



        ctx.clearRect(0, 0, canvas.width, canvas.height);

        object1.angle -= deltaTime;
        object1.update(deltaTime);
        object1.draw();

     




        window.requestAnimationFrame(loop);
    }
   
});