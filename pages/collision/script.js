const images = {};
var canvas, ctx;
var debug = true;

const mouse = {
    down: false,
    position: new Vector(0, 0)
};

var rect, circle;

$(document).ready(function () {

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    // #region user input
    $(document)
        .on("mousedown", e => mouse.down = true)
        .on("mouseup", e => mouse.down = false)
        .on("mousemove", function (e) {
            let rect = canvas.getBoundingClientRect();
            let x = (e.clientX || e.pageX) - rect.left;
            let y = (e.clientY || e.pageY) - rect.top;

            // convert to canvas coordinates (resolution vs actual size)
            x *= canvas.width / rect.width;
            y *= canvas.height / rect.height;

            mouse.position = new Vector(x.clamp(0, canvas.width), y.clamp(0, canvas.height));
        })
    // #endregion

    // #region load images -> start loop
    let imagePaths = [
        "graem_sad", "graem_happy", "adrian", "connor",
        "towers/base",
        "towers/Cannon_Bullet", "towers/Cannon1", "towers/Cannon2", "towers/Cannon3",
        "towers/MachineGun_Bullet", "towers/MachineGun1", "towers/MachineGun2", "towers/MachineGun3",
        "towers/Missile_Bullet", "towers/Missile1", "towers/Missile2", "towers/Missile3",
        "towers/FlameThrower1", "fire", "explosion"
    ];
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


    circle = new GameObject.Circle({
        position: new Vector(200, 100),
        radius: 100,
        color: "orange"
    });

    rect = new GameObject.Rect({
        position: new Vector(200, 155),
        size: new Vector(50, 200),
        angle: Math.PI / 4,
        color: "purple"
    });


    function init() {

        let previousTime = new Date().getTime() / 1000;
        let dir = 1;
        let fps = 120;

        setInterval(function () {

            // #region tracking fps / delta time
            let currentTime = new Date().getTime() / 1000;
            const deltaTime = currentTime - previousTime;
            previousTime = currentTime;
            // #endregion


            circle.position = mouse.position;

            rect.position.x += (dir * deltaTime * 50);
            if (rect.position.x > 250 || rect.position.x < 150) {
                dir *= -1;
                rect.position.x = rect.position.x.clamp(150, 250);
            }

            rect.angle = (rect.angle + deltaTime) % (2 * Math.PI);
            rect.color = rect.isColliding(circle) ? "red" : "purple";
  
            ctx.clearRect(0, 0, canvas.width, canvas.height);


            rect.draw();
            circle.draw();

        }, 1000 / fps)

    }




   
});


