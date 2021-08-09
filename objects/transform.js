class Transform {
    constructor(args = {}) {
        this.position = args.position instanceof Vector ? args.position : new Vector(0, 0);
        this.scale = args.scale instanceof Vector ? args.scale : new Vector(1, 1);
        this.angle = typeof args.angle === "number" ? args.angle : 0;
    }


    copy() {
        return new Transfmorm({
            position: this.position,
            scale: this.scale(),
            angle: this.angle
        });
    }
}