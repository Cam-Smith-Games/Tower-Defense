// unfortunately in javascript, you can't extend multiple classes
// the only way to achieve this is to to wrap extended classes in a wrapper class 
// this is necessary because some bullets need to be RectBullets (extending GameObject.Rect) while other bullets need to be CircleBullets (extending GameObject.Circle)
// circle is much better for performance, but things like laser beams have to be rectangles
// thus, we have a bullet wrapper with Bullet.gameObject extending separate object types

class Bullet {
    constructor(args) {
        this.gameObject = args.gameObject instanceof GameObject ? args.gameObject : null;
        this.damage = typeof args.damage === "number" ? args.damage : 0;
        this.maxCollisions = typeof args.maxCollisions === "number" ? args.maxCollisions : 1;
        this.tower = args.tower;
    }

    update() {
        let obj = this.gameObject;

        // #region moving / drawing
        let delta = obj.velocity.rotate(obj.angle);
        obj.position = obj.position.add(delta);
        this.draw();
        // #endregion

        return this.checkCollisions();
    }


    // this can be overriden (flame thrower bullets use an animation isntead of static image)
    draw() {
        this.gameObject.draw();
    }

    onCollide(enemy) { }
    checkCollisions() {
        let obj = this.gameObject;

        if (obj.isOutOfBounds()) {
            return true;
        }

        let numCollisions = 0;
        for (var i = 0; i < game.enemies.length; i++) {
            let enemy = game.enemies[i];
            if (obj.isColliding(enemy)) {
                let dead = enemy.hurt(this.damage);
                if (dead) {
                    this.tower.addExp(25);
                }

                this.onCollide(enemy);
                if (++numCollisions > this.maxCollisions && this.maxCollisions != -1) {
                    return true;
                }
            }
            else {
                //console.log("nope");
            }
        }

        return numCollisions > 0;
    }
}
class CircleBullet extends Bullet {
    constructor(args) {
        args.gameObject = new GameObject.Circle(args);
        super(args);
    }
}
class RectBullet extends Bullet {
    constructor(args) {
        args.gameObject = new GameObject.Rect(args);
        super(args);
    }
}



const Bullets = {

    Cannon: class Cannon extends RectBullet {
        constructor(args = {}) {
            args.img = images["towers/Cannon_Bullet"];
            args.velocity = new Vector(0, -5);
            args.damage = 2;
            args.size = new Vector(13, 26);
            super(args);
        }
    },

    MachineGun: class MachineGun extends RectBullet {
        constructor(args = {}) {
            args.img = images["towers/MachineGun_Bullet"];
            args.velocity = new Vector(0, -25);
            args.damage = 1;
            args.size = new Vector(5, 50);
            super(args);
        }
    },

    Missile: class Missile extends RectBullet {
        constructor(args = {}) {
            args.img = images["towers/Missile_Bullet"];
            args.velocity = new Vector(0, -2);
            args.damage = 6;
            args.size = new Vector(28, 50);
            super(args);

            this.explosion = null;
            this.explosionRadius = 100;
        }

        update(deltaTime) {
            if (this.explosion) {
                this.explosion.update(deltaTime);
                let alpha = 1 - (this.explosion.column / this.explosion.numColumns);

                // don't delete missile until explosion is finished animating
                if (this.explosion.column == 0 && this.explosion.timer == 0) {
                    return true;
                }
                this.explosion.draw(this.gameObject.size, this.gameObject.position, this.gameObject.angle, alpha);
                return false;
            }

            super.update(deltaTime);
        }



        onCollide(enemy) {
            // TODO: separate explosion damage from impact damage?
            let enemiesToExplode = game.enemies.filter(e => e != enemy && e.position.dist(enemy.position) <= this.explosionRadius);
            enemiesToExplode.forEach(enemy => enemy.hurt(this.damage));

            // animation matches gameobject size, so increase to match explosion radius
            this.gameObject.size = new Vector(this.explosionRadius * 2, this.explosionRadius * 2);

            // slightly shift forward for the explosion to be more centered on target as opposed to initial impact position
            let delta = new Vector(0, -25).rotate(this.gameObject.angle);
            this.gameObject.position = this.gameObject.position.add(delta);

            this.explosion = new SimpleAnimation({
                sheet: images["explosion"],
                frameSize: new Vector(96, 96),
                numColumns: 12,
                numRows: 1,
                frameDelay: 0.1
            });
        }
    },

    FlameThrower: class FlameThrower extends CircleBullet {
        constructor(args = {}) {
            args.velocity = new Vector(0, -2);
            args.damage = 0.01;
            args.radius = 24;
            args.color = "orange";
            super(args);

            this.animation = new SimpleAnimation({
                sheet: images["fire"],
                frameSize: new Vector(128, 128),
                numColumns: 25,
                numRows: 1,
                frameDelay: 0.1
            });

            this.lifeTime = 7;
        }

        update(deltaTime) {
            super.update(deltaTime);
            this.animation.update(deltaTime);
            this.gameObject.radius *= 1.01;
            return (this.lifeTime -= Math.pow(deltaTime, 0.5)) <= 0;
        }

        // overriding Bullet.draw
        draw() {
            //draw.circle_outline(this.position, "magenta", this.size.x);
            let alpha = this.lifeTime / 5;
            let size = new Vector(this.gameObject.radius * 2, this.gameObject.radius * 2);
            let pos = this.gameObject.position.subtract(size.divide(2));
            this.animation.draw(size, this.gameObject.position, this.gameObject.angle, alpha);
        }
    },

    Spartan: class Spartan extends RectBullet {
        constructor(args = {}) {
            args.img = images["towers/Spartan_Bullet"];
            args.velocity = new Vector(0, 0);
            args.damage = 0.05;
            args.ignore_bounds = true;

            //let diff = args.target.position.subtract(args.position);
            //let dist = diff.length();
            let size = new Vector(1, args.tower.targetRange);
            let diff = size.divide(2).rotate(args.tower.angle);

            args.size = new Vector(36, size.y);
            args.position = args.position.subtract(diff);
            args.angle -= Math.PI;
            args.maxCollisions = -1;

            super(args);


            // overriding GameObject.isOutOfBounds because this laser is huge (goes out of bounds all the time) and doesn't move
         
        }


        update(deltaTime) {
            super.update(deltaTime);
            this.gameObject.size.x *= 0.9;
            //this.opacity *= 0.9;
            return this.gameObject.size.x < 0.1;
        }



    }
}