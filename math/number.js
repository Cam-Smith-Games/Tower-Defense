// by default, javascript modulo operator doesn't handle negatives
Number.prototype.mod = function (n) { return ((this % n) + n) % n };
Number.prototype.roundTo = function (roundTo) { return Math.floor(this / roundTo) * roundTo }
Number.prototype.clamp = function (min, max) { return Math.min(Math.max(this, min), max) };

Array.prototype.sum = function () { return this.reduce((s, total) => total + s, 0); }
Array.prototype.avg = function () { return this.sum() / this.length }
Array.prototype.min = function () { return Math.min.apply(Math, this) }
Array.prototype.max = function () { return Math.max.apply(Math, this) }