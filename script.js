let shapes = [];
let gravitySlider, lSystemSlider, collisionSlider, sizeSlider;
let sliderContainer, buttonContainer, controlContainer;
let versionNumber = "0.22"; // Updated version number
let selectedShape = 'circle'; 
let motionActive = false; 
const MAX_SHAPES = 100;

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
                                    .style('align-items', 'center')
                                    .style('z-index', '10');
    
    let leftControls = createDiv('').style('display', 'flex')
                                   .style('gap', '10px')
                                   .parent(controlContainer);

    let motionButton = createButton('▶')
                        .mousePressed(() => {
                            motionActive = !motionActive;
                            motionButton.html(motionActive ? '⏸' : '▶');
                        })
                        .style('width', '60px')
                        .style('height', '60px')
                        .style('font-size', '48px')
                        .style('background', '#888')
                        .style('color', '#3fd16b')
                        .style('border', 'none')
                        .style('cursor', 'pointer')
                        .style('display', 'flex')
                        .style('justify-content', 'center')
                        .style('align-items', 'center')
                        .parent(leftControls);
    
    let restartButton = createButton('⟳')
                        .mousePressed(() => {
                            shapes = [];
                            gravitySlider.value(5);
                            lSystemSlider.value(5);
                            collisionSlider.value(5);
                            sizeSlider.value(50);
                        })
                        .style('width', '60px')
                        .style('height', '60px')
                        .style('font-size', '48px')
                        .style('background', '#888')
                        .style('color', '#3fd16b')
                        .style('border', 'none')
                        .style('cursor', 'pointer')
                        .style('display', 'flex')
                        .style('justify-content', 'center')
                        .style('align-items', 'center')
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
    
    function createShapeButton(shapeType, clipPath) {
        let button = createButton('')
                        .mousePressed(() => {
                            selectedShape = shapeType;
                            updateShapeButtonColors();
                        })
                        .style('width', '30px')
                        .style('height', '30px')
                        .style('background', '#000')
                        .style('border', 'none')
                        .style('clip-path', clipPath)
                        .parent(buttonContainer);
        return button;
    }
    
    let circleButton = createShapeButton('circle', 'circle(50%)');
    let squareButton = createShapeButton('square', 'none');
    let triangleButton = createShapeButton('triangle', 'polygon(50% 0%, 0% 100%, 100% 100%)');
    
    function updateShapeButtonColors() {
        circleButton.style('background', selectedShape === 'circle' ? '#3fd16b' : '#000');
        squareButton.style('background', selectedShape === 'square' ? '#3fd16b' : '#000');
        triangleButton.style('background', selectedShape === 'triangle' ? '#3fd16b' : '#000');
    }
    updateShapeButtonColors();
}

function draw() {
    background(0, 20);
    fill(255);
    textSize(16);
    text(`Version: ${versionNumber}`, 10, 30);
    
    if (motionActive) {
        // Update and display all shapes only if motion is active
        for (let shape of shapes) {
            shape.update();
            shape.display();
        }
    } else {
        // Display shapes without updating position if motion is inactive
        for (let shape of shapes) {
            shape.display();
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    // Prevent shapes from being placed on the bottom bar (adjusted click detection)
    if (mouseY < height - 50 && mouseY > height - controlContainer.elt.clientHeight) {
        if (shapes.length >= MAX_SHAPES) {
            shapes.shift();
        }
        let s = new Shape(mouseX, mouseY, selectedShape);
        shapes.push(s);
    }
}

// Shape class
class Shape {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = sizeSlider.value();
        this.mass = this.size / 10; // Larger mass for bigger shapes
        this.velX = random(-2, 2);
        this.velY = random(-2, 2);
        this.color = color(random(255), random(255), random(255));
    }
    
    update() {
        // Apply gravity based on size
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);
                
                // Gravity formula: F = (G * m1 * m2) / r^2
                let force = gravitySlider.value() * this.mass * other.mass / (distance * distance);
                let angle = atan2(dy, dx);
                
                // Apply force to each shape's velocity
                this.velX += cos(angle) * force;
                this.velY += sin(angle) * force;
            }
        }
        
        // Update position
        this.x += this.velX;
        this.y += this.velY;
        
        // Disappear when going off-screen
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            let index = shapes.indexOf(this);
            if (index > -1) {
                shapes.splice(index, 1);
            }
        }
        
        // Check for collisions with other shapes
        for (let other of shapes) {
            if (other !== this) {
                let dist = dist(this.x, this.y, other.x, other.y);
                if (dist < (this.size + other.size) / 2) {
                    // Split shapes into two half-sized shapes and bounce
                    let newShape1 = new Shape(this.x, this.y, this.type);
                    let newShape2 = new Shape(other.x, other.y, other.type);
                    newShape1.size = this.size / 2;
                    newShape2.size = other.size / 2;
                    shapes.push(newShape1, newShape2);
                    
                    // Remove the original shapes
                    shapes.splice(shapes.indexOf(this), 1);
                    shapes.splice(shapes.indexOf(other), 1);
                    break;
                }
            }
        }
    }
    
    display() {
        noStroke();
        fill(this.color);
        if (this.type === 'circle') {
            ellipse(this.x, this.y, this.size);
        } else if (this.type === 'square') {
            rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        } else if (this.type === 'triangle') {
            triangle(this.x, this.y - this.size / 2, this.x - this.size / 2, this.y + this.size / 2, this.x + this.size / 2, this.y + this.size / 2);
        }
    }
}
