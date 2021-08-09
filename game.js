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
var canvas, ctx, debug = false;

// resources
const images = {}, sounds = {},
    GRID_SIZE = 50,

    // user input
    keys = {},
    keyCodes = { 87: "W", 65: "A", 83: "S", 68: "D" },
    mouse = { down: false, position: new Vector(0, 0) };

// #endregion


// master game object
const game = {

    // TODO: get paths from levels
    //path: new Path([
    //    new BezierCurve([0, 50], [150, 50], [150, 50], [150, 200]),
    //    new BezierCurve([150, 200], [150, 300], [150, 375], [150, 450]),
    //    new BezierCurve([150, 450], [150, 600], [150, 600], [250, 600]),
    //    new BezierCurve([250, 600], [350, 600], [350, 600], [350, 500]),
    //    new BezierCurve([350, 500], [350, 200], [350, 200], [350, 200]),
    //    new BezierCurve([350, 200], [350, 50], [350, 50], [500, 50]),
    //    new BezierCurve([500, 50], [650, 50], [650, 50], [650, 200]),
    //    new BezierCurve([650, 200], [650, 300], [650, 350], [650, 450]),
    //    new BezierCurve([650, 450], [650, 600], [650, 600], [800, 600]),
    //    new BezierCurve([800, 600], [950, 600], [950, 600], [950, 450]),
    //    new BezierCurve([950, 450], [950, 350], [950, 300], [950, 200]),
    //    new BezierCurve([950, 200], [950, 50], [950, 50], [1100, 50]),
    //    new BezierCurve([1100, 50], [1150, 50], [1200, 50], [1250, 50])
    //]),

    path: new Path([
        new BezierCurve([0, 64], [192, 64], [256, 128], [64, 448]),
        new BezierCurve([64, 448], [0, 640], [0, 704], [128, 704]),
        new BezierCurve([128, 704], [256, 704], [320, 704], [320, 512]),
        new BezierCurve([320, 512], [256, 384], [256, 320], [448, 192]),
        new BezierCurve([448, 192], [576, 64], [576, 64], [704, 64]),
        new BezierCurve([704, 64], [768, 128], [768, 256], [512, 448]),
        new BezierCurve([512, 448], [448, 704], [640, 704], [704, 576]),
        new BezierCurve([704, 576], [768, 448], [832, 384], [832, 192]),
        new BezierCurve([832, 192], [832, 64], [832, 0], [1024, 64]),
        new BezierCurve([1024, 64], [1088, 128], [1088, 256], [960, 448]),
        new BezierCurve([960, 448], [832, 640], [832, 704], [960, 640]),
        new BezierCurve([960, 640], [1088, 576], [1152, 512], [1152, 384]),
        new BezierCurve([1152, 384], [1152, 128], [1152, 64], [1280, 64])
    ]),

    // object arrays
    waves: [
        new Wave(0, 50, Enemies.Graem),
        new Wave(0.25, 50, Enemies.Adrian),
        new Wave(0.5, 50, Enemies.Connor)
    ],
    bullets: [],
    enemies: [],
    towers: [],


    load: function () {
        // start game once all resources are loaded 
        // TODO: progress bar ? won't be necessary until game is hosted on server and resources actually have to download

        let imagePaths = [
            "graem_sad", "graem_happy", "adrian", "connor",
            "towers/base",
            "towers/Cannon_Bullet", "towers/Cannon1", "towers/Cannon2", "towers/Cannon3",
            "towers/MachineGun_Bullet", "towers/MachineGun1", "towers/MachineGun2", "towers/MachineGun3",
            "towers/Missile_Bullet", "towers/Missile1", "towers/Missile2", "towers/Missile3",
            "towers/FlameThrower1",
            "towers/Spartan1", "towers/Spartan_Bullet",
            "fire", "explosion", "body_male", "level_up"
        ];
        let soundPaths = ["level_up"];

        let numResources = imagePaths.length + soundPaths.length;
        let loadCounter = 0;
        function onload() {
            // TODO: progress bar 

            if (++loadCounter >= numResources) {
                game.init();
            }
        }

        imagePaths.forEach(path => {
            let img = new Image();
            img.onload = onload;
            img.src = "img/" + path + ".png";
            images[path] = img;
        });

        soundPaths.forEach(path => sounds[path] = new Sound("sound/" + path + ".wav", onload));
    },


    init: function () {

        game.setLives(100);
        game.setMoney(9999);

        //game.towers.push(new Towers.MachineGun({
        //    position: new Vector(225, 75),
        //    targetPriority: Tower.TARGET_PRIORITY.LAST
        //}));

        //game.towers.push(new Towers.Spartan({
        //    position: new Vector(150, 675),
        //    targetPriority: Tower.TARGET_PRIORITY.FIRST
        //}));


        //game.towers.push(new Towers.MachineGun({
        //    position: new Vector(225, 100),
        //    targetPriority: Tower.TARGET_PRIORITY.FIRST
        //}));


        //towers.push(new Tower.MachineGun({
        //    level: 3,
        //    position: new Vector(425, 125),
        //    targetPriority: Tower.TARGET_PRIORITY.LAST
        //}));






        window.requestAnimationFrame(this.loop);
    },




    // #region lives
    lives: 100,
    setLives: function (count) {

        game.lives = count;


        $("#lives").html(game.lives);

        if (game.lives < 1) {
            alert("GAME OVER");
            return true;
        }

    },
    // #endregion

    // #region money
    money: 100,
    setMoney: function (count) {
        game.money = Math.max(0, count);
        $("#money").html(game.money);
    },
    // #endregion


    previousTime: 0,
    time: 0,
    loop: function(currentTime) {
        // #region tracking fps / delta time
        // convert time to seconds
        currentTime /= 1000;
        const deltaTime = currentTime - game.previousTime;
        game.time += deltaTime;
        game.previousTime = currentTime;
        // #endregion

        // UPDATING WAVES
        for (var i = 0; i < game.waves.length; i++) {
            let wave = game.waves[i];
            if (game.time >= wave.startTime) {
                // wave complete -> remove from list
                if (wave.update(deltaTime)) {
                    game.waves.splice(i, 1);
                    i--;
                }
            }
            else {
                break;
            }
        }



        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // #region draw grid
        for (var x = 0; x < canvas.width; x += GRID_SIZE) {
            draw.line(new Vector(x, 0), new Vector(x, canvas.height), "#666");
        }
        for (var y = 0; y < canvas.height; y += GRID_SIZE) {
            draw.line(new Vector(0, y), new Vector(canvas.width, y), "#666");
        }
        // #endregion

        game.path.draw();

        // UPDATING / DRAWING TOWERS
        game.towers.forEach(tower => tower.update(deltaTime));

        // UPDATING / DRAWING ENEMIES
        for (let i = game.enemies.length - 1; i > -1; i--) {
            let enemy = game.enemies[i];
            let status = enemy.update(deltaTime);
            if (status) {
                game.enemies.splice(i, 1);
                // if enemy reached end of path, remove one life
                if (status === "end" && game.setLives(game.lives - 1)) {
                    return;
                }
                game.setMoney(game.money + enemy.value);
            }
        }


        // UPDATING / DRAWING BULLETS
        for (let i = game.bullets.length - 1; i > -1; i--) {
            let bullet = game.bullets[i];
            if (bullet.update(deltaTime)) {
                game.bullets.splice(i, 1);
            }
        }


        // PLACING TOWERS
        if (game.placing) {
            game.placing.position = mouse.position;

            if (mouse.down) {
                // TODO: prevent collision with other towers and road

                game.towers.push(game.placing);
                game.placing = null;
            }
            else {
                game.placing.draw();
            }
        }
        // SELECTING TOWERS
        else {
            let selected = !mouse.down;
            for (var i = 0; i < game.towers.length; i++) {
                let tower = game.towers[i];

                let contains = tower.containsPoint(mouse.position);
                if (contains) {
                    tower.isHovered = true;

                    if (mouse.down) {
                        selected = true;
                        if (!tower.isSelected) {
                            tower.select();
                        }
                    }   
                }
                else {
                    tower.isHovered = false;
                }
            }
            //console.log(selected);
            if (mouse.down && !selected) {
                $("#towerInfo").removeClass("open");
                game.towers.forEach(tower => tower.isSelected = false);
            }
        }

        window.requestAnimationFrame(game.loop);
    }

}

$(document).ready(function () {
    // #region canvas
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    // #endregion 

    // #region user input
    $(document)
        .on("mousedown", e => {
            if (e.target.nodeName === "CANVAS") {
                mouse.down = true
            }
        })
        .on("mouseup", e => {
            if (e.target.nodeName === "CANVAS") {
                mouse.down = false
            }
        })
        .on("mousemove", function (e) {
            let rect = canvas.getBoundingClientRect();
            let x = (e.clientX || e.pageX) - rect.left;
            let y = (e.clientY || e.pageY) - rect.top;

            // convert to canvas coordinates (resolution vs actual size)
            x *= canvas.width / rect.width;
            y *= canvas.height / rect.height;

            mouse.position = new Vector(x.clamp(0, canvas.width), y.clamp(0, canvas.height));
        })
        .on("keydown", e => {
            if (e.which in keyCodes) {
                keys[keyCodes[e.which]] = true;
            }
        })
        .on("keyup", e => {
            if (e.which in keyCodes) {
                delete keys[keyCodes[e.which]];
            }
        });


    $("#shop").find("#towers").on("click", ".tower", function () {
        let type = $(this).data("tower");
        let tower = Towers[type];
        if (!game.placing && game.money >= tower.cost) {
            game.setMoney(game.money - tower.cost);
            game.placing = new tower();
        }
    })
    $("#btnShop").on("click", function () {
        console.log("CLICK");
        let $shop = $("#shop");

        if ($shop.hasClass("open")) {
            $shop.removeClass("open");
            return;
        }


        let towerTypes = ["Cannon", "MachineGun", "Missile", "FlameThrower", "Spartan"];

        let html = "";

        towerTypes.forEach(type => {
            let tower = Towers[type];

            html += "<div class='tower center' data-tower='" + type + "'>\
                        <div class='image-container'>\
                            <img src='/img/towers/" + type + "1.png' />\
                        </div>\
                        <div>\
                            <label class='bold'>" + type + "</label>\
                            <label class='cost'>" + tower.cost + "</label>\
                        </div>\
                    </div>";
        })

        $(".menu").removeClass("open");
        $shop.addClass("open").find("#towers").html(html);
    })
    // #endregion


    game.load();   
});