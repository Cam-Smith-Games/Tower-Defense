// TODO: shootDelay needs to be a combination of TowerClass and Level (i.e. MachineGun3 is fast af, Missile3 isnt nearly as fast cus it shoots 3 at once)

class Tower extends GameObject.Rect {
    constructor(args) {
        super(args);


        let towerClass = this.constructor.name;

        this.level = typeof args.level === "number" ? args.level : 1;
        this.shootDelay = (typeof args.shootDelay === "number" ? args.shootDelay : 1) / this.level;
        this.targetRange = typeof args.targetRange === "number" ? args.targetRange : 100;
        this.targetPriority = args.targetPriority in Object.values(Tower.TARGET_PRIORITY) ? args.targetPriority : Tower.TARGET_PRIORITY.FIRST; 
        this.bulletType = Bullets[towerClass];
        this.bulletOffset = args.bulletOffset instanceof Vector ? args.bulletOffset : new Vector();
        this.color = "transparent";
        this.images = {
            base: images["towers/base"],
            turret: images["towers/" + towerClass + this.level],
            bullet: images["towers/" + towerClass + "_Bullet"]
        }


        this.scale = args.scale instanceof Vector ? args.scale : new Vector(0.25, 0.25);
        this.size = new Vector(this.images.base.width * this.scale.x, this.images.base.height * this.scale.y);
        this.isHovered = false;
        this.isSelected = false;

        this.xp = 0;
        this.level = 1;
        this.level_animation = null;

    }



 
    update(deltaTime) {

        this.shootTimer += deltaTime;

        if (!this.shooting && game.enemies.length) {
            let visible_enemies = game.enemies.filter(enemy => this.position.dist(enemy.position) <= this.targetRange);

            if (visible_enemies.length) {
                let target;
                if (this.targetPriority == Tower.TARGET_PRIORITY.FIRST) {
                    let enemies_sorted = visible_enemies.sort((a, b) => a.travelDistance > b.travelDistance ? -1 : a.travelDistance < b.travelDistance ? 1 : 0);
                    target = enemies_sorted[0];
                }
                else if (this.targetPriority == Tower.TARGET_PRIORITY.LAST) {
                    let enemies_sorted = visible_enemies.sort((a, b) => a.travelDistance < b.travelDistance ? -1 : a.travelDistance > b.travelDistance ? 1 : 0);
                    target = enemies_sorted[0];
                }
                else if (this.targetPriority == Tower.TARGET_PRIORITY.NEAREST) {
                    let enemies_mapped = visible_enemies.map(enemy => ({
                        distance: this.position.dist(enemy.position),
                        enemy: enemy
                    }));
                    let enemies_sorted = enemies_mapped.sort((a, b) => a.distance < b.distance ? -1 : a.distance > b.distance ? 1 : 0);
                    target = enemies_sorted[0].enemy;
                }
                else if (this.targetPriority == Tower.TARGET_PRIORITY.FARTHEST) {
                    let enemies_mapped = visible_enemies.map(enemy => ({
                        distance: this.position.dist(enemy.position),
                        enemy: enemy
                    }));
                    let enemies_sorted = enemies_mapped.sort((a, b) => a.distance > b.distance ? -1 : a.distance < b.distance ? 1 : 0);
                    target = enemies_sorted[0].enemy;
                }

                this.shoot(target);
                
            }
        
        }

        if (this.level_animation) {
            this.level_animation.update(deltaTime);
        }

        this.draw();
    }


    shootTimer = 0;
    shoot(target) {

        if (this.shootTimer > this.shootDelay) {
            this.shootTimer = 0;

            this.lookAt(target.position);

            let offset = this.bulletOffset.rotate(this.angle);
            let bulletPos = this.position.add(offset);

            // TODO: sound effect
            game.bullets.push(new this.bulletType({
                position: bulletPos,
                angle: this.angle,
                velocity: new Vector(0, -this.bulletVelocity), 
                img: this.images.bullet,
                tower: this,
                target: target
            }));

            return true;
        }
    }


    
    draw_local() {
        ctx.drawImage(this.images.turret, -this.images.turret.width * this.scale.x / 2, -this.images.turret.height * this.scale.y / 2, this.images.turret.width * this.scale.x, this.images.turret.height * this.scale.y);
    }


    draw_before() {
        if (this.isSelected || this.isHovered) {
            // ATTACK RANGE
            draw.circle(this.position, this.targetRange, "rgba(100, 100, 100, 0.25)");
            draw.circle_outline(this.position, this.targetRange, "rgb(150, 150, 150)");
        }

        // BASE IS UNROTATED
        ctx.drawImage(this.images.base, this.position.x - this.images.base.width * this.scale.x / 2, this.position.y - this.images.base.height * this.scale.y / 2, this.images.base.width * this.scale.x, this.images.base.height * this.scale.y);


        // LEVEL ANIMATION
        if (this.level_animation) {
            if (this.level_animation.column != 0 || this.level_animation.row != 0 || this.level_animation.timer != 0) {
                let size = this.size.multiply(2);
                this.level_animation.draw(size, this.position, 0, 1);
            }
            else {
                this.level_animation = null;
            }
        }
    }


    draw_after() {


        if (this.isSelected) {
            ctx.globalAlpha = 0.5;
            ctx.globalCompositeOperation = "source-atop";
            //draw.rect(this.position.add(new Vector(-this.size.x / 2, -this.size.y / 2)), this.size, "red");
            draw.circle(this.position, Math.max(this.size.y, this.size.x) / 1.5, "rgb(150, 150, 0)");
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 1;
        }


        // DRAW XP BAR
        let barPos = this.position.add(new Vector(-this.size.x / 2, this.size.y / 2 + 5));
        let barSize = new Vector(this.size.x, 7);
        draw.rect(barPos, barSize, "rgba(0,0,0,0.5)");
        let levelPercent = Math.max(0, (this.xp % 100) / 100);
        draw.rect(barPos, new Vector(barSize.x * levelPercent, barSize.y), "rgba(200,200,0,0.75)");
    }

    select() {
        // don't double select
        if (this.isSelected) {
            return;
        }

        // unselect all other towers
        game.towers.forEach(tower => {
            if (tower != this) {
                tower.isSelected = false;
            }
        })

        this.isSelected = true;
        $(".menu").removeClass("open");


        let $info = $("#towerInfo");
        $info.find(".name").html(this.constructor.name);
        $info.find(".level").html(this.level);
        $info.find(".value").html(this.constructor.COST); // TODO: cost needs to include upgrades and level etc

        let tower = this;
        $info.find(".target-priority")
            .off()
            .val(this.targetPriority)
            .on("change", function () {
                tower.targetPriority = $(this).val();
            });

        // TODO: sell button

        $info.addClass("open");
    }


    addExp(xp) {
        this.xp += xp;
        let prev_level = this.level;
        this.level = Math.floor(this.xp / 100) + 1;

        if (this.level > prev_level) {
            sounds["level_up"].play();
            this.level_animation = new SimpleAnimation({
                sheet: images["level_up"],
                frameSize: new Vector(128, 128),
                numColumns: 4,
                numRows: 4,
                frameDelay: 0.05
            })
        }
    }
}

// this maps bullet types by name so we can call them dynamically (essentially C# reflection)
Tower.TARGET_PRIORITY = {
    FIRST: 0,
    LAST: 1,
    NEAREST: 2,
    FARTHEST: 3,
    LOWEST: 4,
    HIGHEST: 5
}

const Towers = {
    Cannon: class Cannon extends Tower {
        constructor(args = {}) {
            args.shootDelay = 1;
            super(args);
        }
    },

    MachineGun: class MachineGun extends Tower {
        constructor(args = {}) {
            args.shootDelay = 0.2;
            args.bulletOffset = new Vector(5, -35);
            super(args);
        }
    },

    Missile: class Missile extends Tower {
        constructor(args = {}) {
            args.targetRange = 200;
            args.shootDelay = 2;
            super(args);
        }
    },

    FlameThrower: class FlameThrower extends Tower {
        constructor(args = {}) {
            args.shootDelay = 0.05;
            args.bulletOffset = new Vector(15, -35);
            super(args);
        }
    },

    Spartan: class Spartan extends Tower {
        constructor(args = {}) {
            args.shootDelay = 2;
            args.bulletVelocity = new Vector(0, 0);
            args.bulletOffset = new Vector(0, -22);
            args.targetRange = 600;
            super(args);
        }
    }

};

// static costs
Towers.Cannon.cost = 50;
Towers.MachineGun.cost = 400;
Towers.Missile.cost = 300;
Towers.FlameThrower.cost = 350;
Towers.Spartan.cost = 500;