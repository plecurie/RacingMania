let video;
let label = "Waiting...";
let classifier;
let modelURL = 'https://storage.googleapis.com/tm-models/YadBJmj5/';
var loading = true;

var im_heart;
var ghost;
var obstacles;
var overtaken_obstacles = [];
var font;
var ghostSpeed = 7;
var roadMarkings = [];
var score = 0;
var lives = 5;
var power = 0;
var POWERSHINE = 70;
let snowflakes = []; // array to hold snowflake objects

function preload() {
    classifier = ml5.imageClassifier(modelURL + 'model.json');
    im_heart = loadImage('assets/heart.png');
    font = loadFont('assets/8-bit.ttf');
}

function setup() {

    const cnv = createCanvas(windowWidth, windowHeight);
    const x = (windowWidth/2 - width/2)/4;
    const y = (windowHeight - height)/2;
    cnv.position(x, y);

    // Create the video
    video = createCapture(VIDEO);
    //video.hide();

    // STEP 1: Start classifying
    classifyVideo();

    roadMarkings.push(new RoadMarking());

    ghost = createSprite(windowWidth/2, 3*windowHeight/4, 50, 100);
    ghost.addAnimation('floating', 'assets/ghost_standing0001.png', 'assets/ghost_standing0007.png');
    ghost.addAnimation('moving', 'assets/ghost_walk0001.png', 'assets/ghost_walk0004.png');
    ghost.addAnimation('explode', 'assets/asterisk_explode001.png', 'assets/asterisk_explode037.png');
    ghost.animation.frameDelay = 16;
    ghost.addAnimation('crashed', 'assets/bubbly0001.png', 'assets/bubbly0004.png');
    ghost.setCollider('circle', -2,2, 60, 60);

    obstacles = new Group();
}

// STEP 2 classify the video!
function classifyVideo() {
    classifier.classify(video, gotResults);
}

// STEP 3: Get the classification!
function gotResults(error, results) {
    // Something went wrong!
    if (error) {
        console.error(error);
        return;
    }
    // Store the label and classify again!
    label = results[0].label;
    if (results[0].label !== "Waiting...")
        loading = false;
    controlGhost();
    classifyVideo();
}

// snowflake class
function snowflake() {
    // initialize coordinates
    this.posX = 0;
    this.posY = random(-50, 0);
    this.initialangle = random(0, 2 * PI);
    this.size = random(2, 5);

    // radius of snowflake spiral
    // chosen so the snowflakes are uniformly spread out in area
    this.radius = sqrt(random(pow(width / 2, 2)));

    this.update = function(time) {
        // x position follows a circle
        let w = 0.6; // angular speed
        let angle = w * time + this.initialangle;
        this.posX = width / 2 + this.radius * sin(angle);

        // different size snowflakes fall at slightly different y speeds
        this.posY += pow(this.size, 0.5);

        // delete snowflake if past end of screen
        if (this.posY > height) {
            let index = snowflakes.indexOf(this);
            snowflakes.splice(index, 1);
        }
    };

    this.display = function() {
        ellipse(this.posX, this.posY, this.size);
    };
}

// If opponents collide with the ghost, they get destroyed
function crash(ghost, obstacle) {

    if (ghost.getAnimationLabel() !== 'explode') {
        ghost.changeAnimation('crashed');
        ghost.velocity.x = 0;
        ghost.animation.changeFrame(0);
        ghost.animation.frameDelay=2;
        ghost.animation.looping=false;

        obstacle.remove();

        // Penalty for collision is -10, and you loose one life
        score = (score >= 10)?(score-10):0;
        lives--;
    }
    else {
        ghost.displace(obstacle);
        if (ghost.position.x < obstacle.position.x) {
            obstacle.velocity.x = 5;
        }
        else {
            obstacle.velocity.x = -5;
        }
        score += 5;
    }
}

// Game controls
function controlGhost() {

    let animationLabel = ghost.getAnimationLabel();

    if (animationLabel !== 'crashed' && animationLabel !== 'explode') {

        switch (label) {
            case "Ukulele":
                if(ghost.position.x <= 50) {
                    ghost.position.x = 50;
                    ghost.changeAnimation('floating');
                    ghost.velocity.x = 0;
                }
                else {
                    ghost.changeAnimation('moving');
                    ghost.mirrorX(-1);
                    ghost.velocity.x = -10;
                }
                break;
            case "Train":
                if (ghost.position.x >= width - 50) {
                    ghost.position.x = width - 50;
                    ghost.changeAnimation('floating');
                    ghost.velocity.x = 0;
                }
                else {
                    ghost.changeAnimation('moving');
                    ghost.mirrorX(1);
                    ghost.velocity.x = 10;
                }
                break;
            case "Rainbow":
                if (power === 5) {
                    ghost.velocity.x = 0;
                    ghost.changeAnimation('explode');
                    POWERSHINE = 70;
                    power = 0;
                }
                break;
            default:
                ghost.changeAnimation('floating');
                ghost.velocity.x = 0;
        }
    }
}

function draw() {

    background(0);

    if (loading) {
        textSize(60);
        textFont(font);
        textStyle(BOLD);
        textAlign(CENTER);
        fill(255);
        text(label, width/2, height/2);
    }
    else {
        background(44, 44, 44);

        // create a random number of snowflakes each frame
        for (let i = 0; i < random(5); i++) {
            snowflakes.push(new snowflake()); // append snowflake object
        }

        // loop through snowflakes with a for..of loop
        for (let flake of snowflakes) {
            flake.update(frameCount / 30); // update snowflake position
            flake.display(); // draw snowflake
        }

        // Show control label
        textSize(32);
        fill(255);
        text(label, 30, 50);

        //Show the power
        noFill();
        stroke(POWERSHINE);
        rect(windowWidth/2 - 150, windowHeight-55, 300, 30);
        noStroke();

        // Show life
        for (var i = 0 ; i <= lives ; i++) {
            image(im_heart, windowWidth - (i*70), 30);
        }

        // Show ghost score
        textSize(40);
        textFont(font);
        textAlign(LEFT);
        fill(255);
        text('Score: ' + score, 30, windowHeight-50);

        // Show road markings
        for (var i = roadMarkings.length-1 ; i >= 0 ; i--) {
            roadMarkings[i].show();
            roadMarkings[i].update();

            // Remove road markings once the are off the screen
            if (roadMarkings[i].offscreen()) {
                roadMarkings.splice(i, 1);
            }
        }

        // Show obstacles
        for (var i = 0; i < obstacles.length ; i++) {
            if (ghost.position.y < obstacles[i].position.y && overtaken_obstacles.indexOf(obstacles[i]) <= -1) {
                score += 5;
                overtaken_obstacles.push(obstacles[i]);
                if (score % 30 === 0 && power < 5)
                    power++;
            }

            // Remove obstacles once they are off the screen
            if (obstacles[i].position.y > windowHeight) {
                obstacles[i].remove();
            }
        }
    }

    image(video, windowWidth-(video.width/2) ,windowHeight-(video.height/2), (video.width/2), (video.height/2));

    // New road markings appear after certain number of frames
    if (frameCount % 25 === 0) {
        roadMarkings.push(new RoadMarking());
    }

    // New obstacles appear after certain number of frames
    if (frameCount % 130 === 0) {
        for(var i=0; i <= Math.floor(Math.random() * 6); i++) {

            var obstacle;
            var choices = ['box', 'platform', 'breathe', 'pulse'];
            var num = Math.floor(Math.random() * choices.length);
            var choice = choices[num];

            switch (choice) {
                case 'box':
                    obstacle = createSprite(random(0, width), 0);
                    obstacle.addAnimation('normal', 'assets/box0001.png', 'assets/box0003.png');
                    obstacle.addSpeed(ghostSpeed - 1, 90);
                    break;
                case 'platform':
                    obstacle = createSprite(random(0, width), 0);
                    obstacle.addAnimation('normal', 'assets/small_platform0001.png', 'assets/small_platform0003.png');
                    obstacle.addSpeed(ghostSpeed - 1, 90);
                    break;
                case 'breathe':
                    obstacle = createSprite(random(0, width), 0);
                    obstacle.addAnimation('normal', 'assets/cloud_breathing0001.png', 'assets/cloud_breathing0009.png');
                    obstacle.addSpeed(ghostSpeed - 1, 90);
                    break;
                case 'pulse':
                    obstacle = createSprite(random(0, width), 0);
                    obstacle.addAnimation('normal', 'assets/cloud_pulsing0001.png', 'assets/cloud_pulsing0007.png');
                    obstacle.addSpeed(ghostSpeed - 1, 90);
                    break;

                default:
                    break;

            }


            obstacles.add(obstacle);
        }
    }

    // Handle speed upgrade
    if (frameCount % 900 === 0) {
        ghostSpeed++;
    }

    // Handle power filling
    for (var i = 0; i < power ; i++) {
        fill(color(204, 102, 0));
        rect(windowWidth/2 - 150 + (i*60), height-50, 60, 20);
    }

    // Shine if power bar is full
    if (power === 5) {
        POWERSHINE = color(204, 153, 0);
    }

    // Check if game is over
    if (lives === 0) {

        textSize(60);
        textFont(font);
        textStyle(BOLD);
        textAlign(CENTER);
        fill(255);
        text('GAME OVER', width/2, height/2);

        noLoop();
    }

    ghost.overlap(obstacles, crash);

    // Check end of animation and reset ghost
    curLabel = ghost.getAnimationLabel();
    curFrame = ghost.animation.getFrame();
    lastFrame = ghost.animation.getLastFrame();

    if(curLabel === 'crashed' && curFrame === lastFrame)
        ghost.changeAnimation('floating');

    if (curLabel === 'explode' && curFrame === lastFrame)
        ghost.changeAnimation('floating');


    drawSprites();

}
