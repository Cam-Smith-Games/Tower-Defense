const draw = {
    bezier: function (start = new Vector(), c1 = new Vector(), c2 = new Vector(), end = new Vector(), color = "rgb(0, 255, 0)", width = 1) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(start.x, start.y);
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y);
        ctx.stroke();
    },


    rect: function(position = new Vector(), size = new Vector(), color = "rgb(0, 255, 0)") {
        ctx.fillStyle = color;
        let pos = position instanceof Vector ? position : Array.isArray(position) && position.length >= 2 ? new Vector(position[0], position[1]) : new Vector();
        let s = size instanceof Vector ? size : Array.isArray(size) && size.length >= 2 ? new Vector(size[0], size[1]) : new Vector();
        ctx.fillRect(pos.x, pos.y, s.x, s.y);
    },

    rect_outline: function (position = new Vector(), size = new Vector(), color = "rgb(0, 255, 0)", width = 1) {
        ctx.strokeStyle = color;
        ctx.strokeRect(position.x, position.y, size.x, size.y);
        ctx.lineWidth = width;
    },

    circle: function (point = new Vector(), radius = 5, color = "rgb(0, 255, 0)") {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
    },

    circle_outline: function (point = new Vector(), radius = 5, color = "rgb(0, 255, 0)", width = 1) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.lineWidth = width;
        ctx.stroke();
    },

    // same as path function but takes an array of colors (useful for visualizing distances between points, or making gay shit)
    path_rainbow: function (points = [], colors = [], dotRadius = 4, width = 1) {

        ctx.lineWidth = width;

 
        for (var i = 1; i < points.length; i++) {
            let prev = points[i - 1];
            let point = points[i];

            let color = colors[i];

            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(point.x, point.y);
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.closePath();


            //ctx.font = "20px Arial";
            //ctx.fillStyle = color;
            //ctx.fillText(i, point.x + 10, point.y);

            if (dotRadius > 0) {
                draw.circle(point, dotRadius, color);
            }        
        }
  

    },

    path: function (points = [], color = "rgb(0, 255, 0)", dotRadius = 4, width = 1) {
        let firstPoint = points[0];

        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for (var i = 1; i < points.length; i++) {
            let point = points[i];
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.stroke();



        if (dotRadius > 0) {
            points.forEach(point => draw.circle(point, dotRadius, color));
        }


        //ctx.font = "20px Arial";
        //ctx.fillStyle = color;
        //for (var i = 0; i < points.length; i++) {
        //    let point = points[i];
        //    ctx.fillText(i, point.x+ 10, point.y);
        //}
    },


    line: function (start = new Vector(), end = new Vector(), color = "rgb(0, 255, 0)", width = 1) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }
}
