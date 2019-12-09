// The video
let video;
let flipVideo;
// For displaying the label
let label = "waiting...";
// The classifier
let classifier;
let modelURL = 'https://storage.googleapis.com/tm-models/YadBJmj5/';

var im_car_green;
var im_car_red;
var im_boom;
var im_heart;
var font;
var playerSpeed = 7;
var opponents = [];
var roadMarkings = [];
var score = 0;
var lives = 5;
var power = 0;
var POWERSHINE = 70;

function preload() {

    classifier = ml5.imageClassifier(modelURL + 'model.json');

    im_car_green = loadImage('assets/Car_Green.png');
    im_car_red = loadImage('assets/Car_Red.png');
    im_boom = loadImage('assets/boom.png');
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
    video.hide();

    // STEP 2: Start classifying
    classifyVideo();

    roadMarkings.push(new RoadMarking());
    opponents.push(new Opponent());
    player = new Player();
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
    controlCar();
    classifyVideo();
}

// STEP 2 classify the videeo!
function classifyVideo() {
    classifier.classify(video, gotResults);
}

function controlCar() {

    // Game controls
    if (label === 'left') {
        player.turnLeft();
    }
    else if (label === 'right') {
        player.turnRight();
    }
    else if (label === 'special') {
        if (power === 5) {
            player.special();
            POWERSHINE = 70;
            power = 0;
        }
    }

}

function draw() {
    background(44, 44, 44);
    image(video, windowWidth-(video.width/2) ,windowHeight-(video.height/2), (video.width/2), (video.height/2));
    console.log(video.width);
    console.log(video.height);

    textSize(32);
    fill(255);
    text(label, 30, 50);

    // New road markings appear after certain number of frames
    if (frameCount % 25 === 0) {
        roadMarkings.push(new RoadMarking());
    }

    // Show road markings
    for (var i = roadMarkings.length-1 ; i >= 0 ; i--) {
        roadMarkings[i].show();
        roadMarkings[i].update();

        // Remove road markings once the are off the screen
        if (roadMarkings[i].offscreen()) {
            roadMarkings.splice(i, 1);
        }
    }

    //Upgrade speed
    if (frameCount % 900 === 0) {
        playerSpeed++;
    }

    // New opponents appear after certain number of frames
    if (frameCount % 130 === 0) {
        var nb = Math.floor(Math.random() * 6);
        for(var i = 1; i <= nb; i++) {
            opponents.push(new Opponent());
        }
    }

    // Show opponents
    for (var i = opponents.length-1 ; i >= 0 ; i--) {
        opponents[i].show();
        opponents[i].update();

        if (opponents[i].overtakenBy(player) && opponents[i].isOvertakenBy === false) {
            score += 5;
            opponents[i].isOvertakenBy = true;
            if (score % 30 === 0 && power < 5)
                power++;
        }

        // If opponents collide with the player, they get destroyed
        if (opponents[i].hits(player)) {
            opponents[i].boom();
            opponents.splice(i, 1);

            // Penalty for collision is -10, and you loose one life
            score = (score >= 10)?(score-10):0;
            lives--;
        }
        // Remove opponents once the are off the screen
        else if (opponents[i].offscreen()) {
            opponents.splice(i, 1);
        }
    }

    // Show the player
    player.show();

    //Show the power
    noFill();
    stroke(POWERSHINE);
    rect(windowWidth/2 - 150, windowHeight-55, 300, 30);
    noStroke();


    // Show player stats
    textSize(40);
    textFont(font);
    textAlign(LEFT);
    fill(255);
    text('Score: ' + score, 30, windowHeight-50);

    //handle life
    for (var i = 0 ; i <= lives ; i++) {
        image(im_heart, windowWidth - (i*70), 30);
    }

    //add power
    for (var i = 0; i < power ; i++) {
        fill(color(204, 102, 0));
        rect(windowWidth/2 - 150 + (i*60), height-50, 60, 20);
    }

    //shine if power bar is full
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

}
