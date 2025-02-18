let shapes = [];
let sliderA, sliderB, sliderC, sizeSlider;
let sliderContainer, buttonContainer;
let versionNumber = "0.05"; // Change this for version updates
let selectedShape = 'circle'; // Default shape

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60); // Increased frame rate for smoother motion
    background(0);
    
    // Remove default margins and padding to prevent scrollbars
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    
    // Create sliders at the bottom of the screen with a gray border and larger size
    sliderContainer = createDiv('').style('position', 'absolute')
                                     .style('bottom', '10px')
                                     .style('left', '50%')
                                     .style('transform', 'translateX(-50%)')
                                     .style('padding', '20px')
                                     .style('background', '#888')
                                     .style('border-radius', '10px');
    
    sliderA = createSlider(1, 10, 5, 0.1).style('width', '150px').style('height', '20px').parent(sliderContainer);
    sliderB = createSlider(1, 10, 5, 0.1).style('width', '150px').style('height', '20px').parent(sliderContainer);
    sliderC = createSlider(1, 10, 5, 0.1).style('width', '150px').style('height', '20px').parent(sliderContainer);
    sizeSlider = createSlider(10, min(windowWidth, windowHeight) * 0.75, 50).style('width', '150px').style('height', '20px').parent(sliderContainer);
    
    // Create shape selection buttons
    buttonContainer = createDiv('').style('position', 'absolute')
                                   .style('top', '10px')
                                   .style('left', '50%')
                                   .style('transform', 'translateX(-50%)')
                                   .style('padding', '10px')
                                   .style('background', '#888')
                                   .style('border-radius', '10px');
    
    createButton('Circle').mousePressed(() => selectedShape = 'circle').parent(buttonContainer);
    createButton('Square').mousePressed(() => selectedShape = 'square').parent(buttonContainer);
    createButton('Triangle').mousePressed(() => selectedShape = 'triangle').parent(buttonContainer);
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
    if (mouseY < height - 70 && mouseY > 50) { // Adjusted to ensure space for UI
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
    }
    update() {
        let a = sliderA.value();
        let b = sliderB.value();
        let c = sliderC.value();
        this.x += sin(frameCount * 0.1 * a) * b; // Increased motion speed
        this.y += cos(frameCount * 0.1 * b) * c;
    }
    display() {
        fill(this.color);
        noStroke();
        if (this.type === 'circle') {
            ellipse(this.x, this.y, this.size);
        } else if (this.type === 'square') {
            rectMode(CENTER);
            rect(this.x, this.y, this.size, this.size);
        } else if (this.type === 'triangle') {
            triangle(this.x, this.y - this.size / 2, 
                     this.x - this.size / 2, this.y + this.size / 2, 
                     this.x + this.size / 2, this.y + this.size / 2);
        }
    }
}
