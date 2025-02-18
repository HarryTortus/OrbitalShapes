let shapes = [];
let sliderA, sliderB, sliderC, sizeSlider;
let sliderContainer, buttonContainer;
let versionNumber = "0.10"; // Change this for version updates
let selectedShape = 'circle'; // Default shape

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30); // Slower motion by default
    background(0);
    
    // Remove default margins and padding to prevent scrollbars
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    
    // Create a full-width bottom control bar
    sliderContainer = createDiv('').style('position', 'absolute')
                                     .style('bottom', '0')
                                     .style('left', '0')
                                     .style('width', '100%')
                                     .style('padding', '10px')
                                     .style('background', '#888')
                                     .style('display', 'flex')
                                     .style('flex-wrap', 'wrap')
                                     .style('justify-content', 'center')
                                     .style('align-items', 'center')
                                     .style('gap', '10px');
    
    function createLabeledSlider(labelText, min, max, defaultValue) {
        let container = createDiv('').style('display', 'flex')
                                     .style('flex-direction', 'column')
                                     .style('align-items', 'center')
                                     .parent(sliderContainer);
        let slider = createSlider(min, max, defaultValue, 0.1).style('width', '150px').style('height', '20px').style('background', '#3fd16b').style('accent-color', '#3fd16b').parent(container);
        createSpan(labelText).style('color', 'white').parent(container);
        return slider;
    }
    
    sliderA = createLabeledSlider('Motion A', 1, 10, 5);
    sliderB = createLabeledSlider('Motion B', 1, 10, 5);
    sliderC = createLabeledSlider('Motion C', 1, 10, 5);
    sizeSlider = createLabeledSlider('Size', 10, min(windowWidth, windowHeight) * 0.75, 50);
    
    // Create shape selection buttons as shapes
    buttonContainer = createDiv('').style('display', 'flex')
                                   .style('gap', '10px')
                                   .style('margin-left', '20px')
                                   .parent(sliderContainer);
    
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
    background(0, 20); // Fading effect
    
    fill(255);
    textSize(16);
    text(`Version: ${versionNumber}`, 10, 30); // Display version in top-left corner
    
    for (let shape of shapes) {
        shape.update();
        shape.display();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    // Prevent shapes from being added when clicking on sliders or buttons
    if (mouseY < height - 50) { // Ensure space for UI
        let s = new Shape(mouseX, mouseY, selectedShape); // Shapes spawn where clicked
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
        let a = sliderA.value();
        let b = sliderB.value();
        let c = sliderC.value();
        this.x += this.xSpeed + sin(frameCount * 0.05 * a) * b; // Slower motion
        this.y += this.ySpeed + cos(frameCount * 0.05 * b) * c;
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

