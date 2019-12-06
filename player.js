
function Player(sketch, width, height, im_car_red ) {
    this.w = 80;
    this.h = 144;

    this.x = Math.floor(width/2 - this.w/2);
    this.y = Math.floor((3 * height/4) - this.h/2);

    this.show = function() {
        sketch.image(im_car_red, this.x, this.y);
    };

    this.turnLeft = function() {
        this.x -= 5;
        this.x = sketch.constrain(this.x, 0, width - this.w);
    };

    this.turnRight = function() {
        this.x += 5;
        this.x = sketch.constrain(this.x, 0, width - this.w);
    };
}
