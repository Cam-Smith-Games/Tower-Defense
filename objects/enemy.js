class Enemy extends GameObject.Circle {

    constructor(args) {
        args.animation = new OrthographicAnimation({
            sheet: images["body_male"],
            frameSize: new Vector(64, 64),
            frameDelay: 0.1,
            groups: {
                "CAST": {
                    index: 0,
                    startFrame: 1,
                    numFrames: 7
                },
                "STAB": {
                    index: 1,
                    numFrames: 8
                },
                "WALK": {
                    index: 2,
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
        });

        if (typeof args.radius !== "number") {
            args.radius = 25;
        }
        super(args);

        this.animation.set("WALK");

        this.curveIndex = typeof args.curveIndex === "number" ? args.curveIndex : 0;
        this.t = typeof args.t === "number" ? t : 0;
        this.curve = game.path.curves[this.curveIndex];
        this.speed = typeof args.speed === "number" ? args.speed : 0; 

        this.maxHealth = typeof args.maxHealth === "number" ? args.maxHealth : 5;
        this.health = this.maxHealth;
        this.value = typeof args.value === "number" ? args.value : 0;

        this.head = args.head instanceof Image ? args.head : new Image();
        this.head_offset = args.head_offset instanceof Vector ? args.head_offset : new Vector();       
        this.head_size = args.head_size instanceof Vector ? args.head_size : new Vector();

        this.pointIndex = 0;
        this.position = game.path.points[this.pointIndex].copy();

    }

    hurt(damage) {
        // TODO: animation?
        this.health -= damage;
        return this.health <= 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.health <= 0) {
            return true;
        }


        // bit of a hack here, initially subtracting index for the dowhile loop in order to re-use as much code as possible
        this.pointIndex--;

        let nextPoint, diff, distance, iterations = 0; // using this to prevent infinite loops (although they shouldn't ever happen unless somethings totally fucked)
        do {
            this.pointIndex++;
            nextPoint = game.path.points[this.pointIndex];
            diff = nextPoint.subtract(this.position);;
            distance = diff.length();
        } while (distance < this.speed && this.pointIndex < game.path.points.length - 1);


        // reached end of path -> game loop will delete enemy and subtract health
        if (this.pointIndex > game.path.points.length - 2 && distance < this.speed) {
            return "end";
        }


        let movement = diff.unit().multiply(this.speed);
        this.travelDistance += movement.length();

        //console.log({
        //    nextPoint: nextPoint,
        //    diff: diff,
        //    distance: distance,
        //    movement: movement,
        //    position: this.position
        //});

        this.position = this.position.add(movement);

        this.angle = this.angleTo(nextPoint);
        this.draw();
    }


    draw_local() {
        super.draw_local();
        ctx.drawImage(this.head, this.head_offset.x, this.head_offset.y, this.head_size.x, this.head_size.y);
    }

    draw_after() {
        // drawing health bar 
        let barPos = this.position.add(new Vector(-this.radius, this.radius));
        let barSize = new Vector(50, 7);
        draw.rect(barPos, barSize, "rgba(0,0,0,0.5)");
        let healthPercent = Math.max(0, this.health / this.maxHealth);
        draw.rect(barPos, new Vector(barSize.x * healthPercent, barSize.y), "rgba(255,0,0,0.75)");
    }

}


const Enemies = {
    Graem: class Graem extends Enemy {
        constructor(args = {}) {
            args.head = images["graem_sad"];
            args.head_size = new Vector(24, 24);
            args.head_offset = new Vector(-12, -26);
            args.radius = 25;
            args.value = 25;
            args.maxHealth = 5;
            args.speed = 1;
            super(args);
        }
    },

    Adrian: class Adrian extends Enemy {
        constructor(args = {}) {
            args.head = images["adrian"];
            args.head_size = new Vector(40, 24);
            args.head_offset = new Vector(-20, -26);
            args.radius = 30;
            args.value = 50;
            args.maxHealth = 10;
            args.speed = 0.75;
            super(args);
        }
    },

    Connor: class Connor extends Enemy {
        constructor(args = {}) {
            args.head = images["connor"];
            args.head_size = new Vector(40, 24);
            args.head_offset = new Vector(-20, -26);
            args.radius = 25;
            args.value = 10;
            args.maxHealth = 1;
            args.speed = 2;
            super(args);
        }
    }
};