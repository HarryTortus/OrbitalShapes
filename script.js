let shapes = [];
let gravitySlider, lSystemSlider, collisionSlider, sizeSlider;
let sliderContainer, buttonContainer, controlContainer;
let versionNumber = "0.13"; // Change this for version updates
let selectedShape = 'circle'; // Default shape
let motionActive = false; // Start paused

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    background(0);
    
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    
    controlContainer = createDiv('').style('position', 'absolute')
                                    .style('bottom', '0')
                                    .style('left', '0')
                                    .style('width', '100%')
                                    .style('padding', '10px')
                                    .style('background', '#888')
                                    .style('display', 'flex')
                                    .style('flex-wrap', 'wrap')
                                    .style('justify-content', 'space-between')
                                    .style('align-items', 'center');
    
    let leftControls = createDiv('').style('display', 'flex')
                                   .style('gap', '10px')
                                   .parent(controlContainer);

    let motionButton = createButton('▶')
                        .mousePressed(() => {
                            motionActive = !motionActive;
                            motionButton.html(motionActive ? '⏸' : '▶');
                        })
                        .style('width', '30px')
                        .style('height', '30px')
                        .style('background', '#3fd16b')
                        .style('border', 'none')
                        .style('cursor', 'pointer')
                        .parent(leftControls);
    
    sliderContainer = createDiv('').style('display', 'flex')
                                   .style('gap', '10px')
                                   .style('justify-content', 'center')
                                   .style('align-items', 'center')
                                   .parent(controlContainer);
    
    function createLabeledSlider(labelText, min, max, defaultValue) {
        let container = createDiv('').style('display', 'flex')
                                     .style('flex-direction', 'column')
                                     .style('align-items', 'center')
                                     .parent(sliderContainer);
        let slider = createSlider(min, max, defaultValue, 0.1).style('width', '150px')
                                                               .style('height', '20px')
                                                               .style('accent-color', '#3fd16b')
                                                               .parent(container);
        createSpan(labelText).style('color', 'white').parent(container);
        return slider;
    }
    
    gravitySlider = createLabeledSlider('Gravity', 0, 10, 5);
    lSystemSlider = createLabeledSlider('L-System', 0, 10, 5);
    collisionSlider = createLabeledSlider('Collision Intensity', 0, 10, 5);
    sizeSlider = createLabeledSlider('Size', 10, min(windowWidth, windowHeight) * 0.75, 50);
    
    buttonContainer = createDiv('').style('display', 'flex')
                                   .style('gap', '20px')
                                   .style('margin-right', '20px')
                                   .parent(controlContainer);
    
    createButton('').mousePressed(() => selectedShape = 'circle')
                  .style('width', '30px')
                  .style('height', '30px')
                  .style('background', 'black')
                  .style('border-radius', '50%')
                  .style('border', 'none')
                  .parent(buttonContainer);
    
    createButton('').mousePressed(() => selectedShape = 'square')
                  .style('width', '30px')
                  .style('height', '30px')
                  .style('background', 'black')
                  .style('border', 'none')
                  .parent(buttonContainer);
    
    createButton('').mousePressed(() => selectedShape = 'triangle')
                  .style('width', '30px')
                  .style('height', '30px')
                  .style('background', 'transparent')
                  .style('clip-path', 'polygon(50% 0%, 0% 100%, 100% 100%)')
                  .style('background-color', 'black')
                  .style('border', 'none')
                  .parent(buttonContainer);
}

function draw() {
    background(0, 20);
    fill(255);
    textSize(16);
    text(`Version: ${versionNumber}`, 10, 30);
    
    if (motionActive) {
        for (let shape of shapes) {
            shape.update();
            shape.display();
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    if (mouseY < height - 50) {
        let s = new Shape(mouseX, mouseY, selectedShape);
        shapes.push(s);
    }
}

class Shape {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.size = sizeSlider.value();
        this.color = color(random(255), random(255), random(255));
        this.type = type;
        this.rotation = random(TWO_PI);
        this.xSpeed = random(-2, 2);
        this.ySpeed = random(-2, 2);
    }
    update() {
        let gravity = gravitySlider.value();
        let lSystem = lSystemSlider.value();
        let collision = collisionSlider.value();
        
        for (let other of shapes) {
            if (other !== this) {
                let d = dist(this.x, this.y, other.x, other.y);
                if (d < this.size / 2 + other.size / 2) {
                    if (collision > 0) {
                        let newSize = this.size * 0.5;
                        shapes.push(new Shape(this.x, this.y, this.type));
                        shapes[shapes.length - 1].size = newSize;
                        this.size = newSize;
                    }
                }
                let attraction = (this.size + other.size) * 0.001 * gravity;
                this.x += (other.x - this.x) * attraction;
                this.y += (other.y - this.y) * attraction;
            }
        }
    }
    display() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        fill(this.color);
        noStroke();
        if (this.type === 'circle') {
            ellipse(0, 0, this.size);
        } else if (this.type === 'square') {
            rectMode(CENTER);
            rect(0, 0, this.size, this.size);
        } else if (this.type === 'triangle') {
            triangle(0, -this.size / 2, 
                     -this.size / 2, this.size / 2, 
                     this.size / 2, this.size / 2);
        }
        pop();
    }
}

