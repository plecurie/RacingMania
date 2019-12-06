
function RoadMarking(sketch, width, height, playerSpeed) {

    this.w = 10;
    this.h = 30;

    this.x = Math.floor(width/2 - this.w/2);
    this.y = 0;

    this.show = function() {
        sketch.strokeWeight(3);
        sketch.fill(255, 182, 58);
        sketch.rect(this.x, this.y, this.w, this.h);
    };

    this.update = function() {
        this.y += playerSpeed;
    };

    this.offscreen = function() {
        return (this.y > height);
    };

}
